-- =============================================================================
--  REDIME — Reciclaje de Dispositivos con Memoria
--  Script de base de datos listo para producción (ejecución directa).
-- =============================================================================
--
--  1. MOTOR DE BASE DE DATOS
--  -------------------------
--  Motor elegido: PostgreSQL 14+  (requerido)
--  Justificación: PostgreSQL ofrece tipos nativos para UUID, TIMESTAMPTZ,
--  DECIMAL exacto, CHECKs compuestos y triggers en PL/pgSQL — todo lo que la
--  app web de REDIME necesita para integridad de datos reales en producción,
--  con soporte de consultas geoespaciales futuras vía PostGIS.
--
--  2. CÓMO EJECUTAR LOCALMENTE
--  ---------------------------
--    # (Windows / Linux / macOS, con PostgreSQL instalado)
--    createdb redime
--    psql -d redime -f redime_db.sql
--
--  Alternativa con rol y contraseña:
--    psql -U postgres -h localhost -c "CREATE DATABASE redime;"
--    psql -U postgres -h localhost -d redime -f redime_db.sql
--
--  Comprobación rápida después de ejecutar:
--    psql -d redime -c "\dt"              -- lista las 7 tablas
--    psql -d redime -c "SELECT * FROM usuario;"
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. EXTENSIONES Y LIMPIEZA
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()

-- Borrado seguro e idempotente (orden inverso al de dependencias).
DROP TRIGGER IF EXISTS trg_historia_publica_valida     ON historia_dispositivo;
DROP TRIGGER IF EXISTS trg_dispositivo_ano_actual      ON dispositivo;

DROP FUNCTION IF EXISTS fn_historia_publica_valida()   CASCADE;
DROP FUNCTION IF EXISTS fn_dispositivo_ano_actual()    CASCADE;

DROP TABLE IF EXISTS preferencia_usuario    CASCADE;
DROP TABLE IF EXISTS tracking_estado        CASCADE;
DROP TABLE IF EXISTS historia_dispositivo   CASCADE;
DROP TABLE IF EXISTS solicitud_recogida     CASCADE;
DROP TABLE IF EXISTS dispositivo            CASCADE;
DROP TABLE IF EXISTS punto_recoleccion      CASCADE;
DROP TABLE IF EXISTS usuario                CASCADE;


-- =============================================================================
-- 1. TABLAS
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1.1  USUARIO
--      Guarda donantes, visitantes y administradores de la plataforma.
-- -----------------------------------------------------------------------------
CREATE TABLE usuario (
    id_usuario           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre               VARCHAR(100)  NOT NULL,
    apellido             VARCHAR(100)  NOT NULL,
    correo               VARCHAR(150)  NOT NULL UNIQUE,
    telefono             VARCHAR(20)   NOT NULL,
    direccion            VARCHAR(255),
    documento_identidad  VARCHAR(20)   NOT NULL UNIQUE,
    tipo_usuario         VARCHAR(20)   NOT NULL,
    fecha_registro       DATE          NOT NULL DEFAULT CURRENT_DATE,
    password_hash        VARCHAR(255)  NOT NULL,

    CONSTRAINT usuario_nombre_ck   CHECK (length(btrim(nombre))   > 0),
    CONSTRAINT usuario_apellido_ck CHECK (length(btrim(apellido)) > 0),
    CONSTRAINT usuario_correo_ck   CHECK (correo LIKE '%@%.%'),
    CONSTRAINT usuario_tipo_ck     CHECK (tipo_usuario IN
        ('donante','visitante','administrador'))
);

COMMENT ON TABLE usuario IS
  'Usuarios de REDIME: donantes, visitantes del archivo y administradores.';

-- -----------------------------------------------------------------------------
-- 1.2  PUNTO_RECOLECCION
--      Catálogo de puntos físicos de entrega (drop-off).
-- -----------------------------------------------------------------------------
CREATE TABLE punto_recoleccion (
    id_punto         UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre           VARCHAR(150)  NOT NULL,
    direccion        VARCHAR(255)  NOT NULL,
    lat              DECIMAL(10,8) NOT NULL,
    lng              DECIMAL(11,8) NOT NULL,
    horario          VARCHAR(100)  NOT NULL,
    tipos_aceptados  VARCHAR(255)  NOT NULL,
    activo           BOOLEAN       NOT NULL DEFAULT TRUE,

    CONSTRAINT punto_lat_ck CHECK (lat BETWEEN -90  AND  90),
    CONSTRAINT punto_lng_ck CHECK (lng BETWEEN -180 AND 180)
);

COMMENT ON TABLE punto_recoleccion IS
  'Ubicaciones físicas donde se reciben dispositivos en modalidad drop-off.';

-- -----------------------------------------------------------------------------
-- 1.3  DISPOSITIVO
--      Información técnica + emocional del dispositivo donado.
-- -----------------------------------------------------------------------------
CREATE TABLE dispositivo (
    id_dispositivo    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario        UUID          NOT NULL,
    marca             VARCHAR(100)  NOT NULL,
    modelo            VARCHAR(100)  NOT NULL,
    ano_aproximado    INTEGER       NOT NULL,
    tipo_dispositivo  VARCHAR(50)   NOT NULL,
    peso_estimado     DECIMAL(6,2)  NOT NULL,
    antiguedad        VARCHAR(50),
    funciona          BOOLEAN       NOT NULL,
    pieza_entera      BOOLEAN       NOT NULL,
    foto_url          VARCHAR(255),
    fecha_registro    DATE          NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT dispositivo_tipo_ck CHECK (tipo_dispositivo IN
        ('largeAppliance','smallAppliance','telecomEquipment','other')),
    -- Cota inferior fija; la cota "año actual" la aplica el trigger
    -- fn_dispositivo_ano_actual() (CURRENT_DATE no es IMMUTABLE y no puede
    -- usarse en un CHECK).
    CONSTRAINT dispositivo_ano_min_ck  CHECK (ano_aproximado >= 1990),
    CONSTRAINT dispositivo_peso_pos_ck CHECK (peso_estimado   >  0),

    CONSTRAINT dispositivo_usuario_fk FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE dispositivo IS
  'Cada dispositivo donado. 1:N con usuario, 1:1 con historia_dispositivo.';

-- -----------------------------------------------------------------------------
-- 1.4  SOLICITUD_RECOGIDA
--      Pedido de recogida o depósito del dispositivo.
-- -----------------------------------------------------------------------------
CREATE TABLE solicitud_recogida (
    id_solicitud      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario        UUID          NOT NULL,
    id_dispositivo    UUID          NOT NULL,
    id_punto          UUID,
    fecha_solicitud   DATE          NOT NULL DEFAULT CURRENT_DATE,
    metodo_entrega    VARCHAR(30)   NOT NULL,
    direccion         VARCHAR(255),
    fecha_preferida   DATE,
    estado_solicitud  VARCHAR(30)   NOT NULL DEFAULT 'pendiente',

    CONSTRAINT solicitud_metodo_ck CHECK (metodo_entrega IN
        ('homePickup','dropOffPoint')),
    CONSTRAINT solicitud_estado_ck CHECK (estado_solicitud IN
        ('pendiente','en_proceso','completada','cancelada')),
    -- Integridad de negocio: homePickup exige dirección; dropOffPoint exige
    -- que la solicitud apunte a un punto físico.
    CONSTRAINT solicitud_metodo_datos_ck CHECK (
        (metodo_entrega = 'homePickup'   AND direccion IS NOT NULL) OR
        (metodo_entrega = 'dropOffPoint' AND id_punto  IS NOT NULL)
    ),

    CONSTRAINT solicitud_usuario_fk FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT solicitud_dispositivo_fk FOREIGN KEY (id_dispositivo)
        REFERENCES dispositivo (id_dispositivo)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT solicitud_punto_fk FOREIGN KEY (id_punto)
        REFERENCES punto_recoleccion (id_punto)
        ON UPDATE CASCADE ON DELETE SET NULL
);

COMMENT ON TABLE solicitud_recogida IS
  'Solicitud de pickup a domicilio o entrega en punto físico.';

-- -----------------------------------------------------------------------------
-- 1.5  HISTORIA_DISPOSITIVO
--      Narrativa generada por IA. Relación 1:1 con dispositivo asegurada por
--      la restricción UNIQUE sobre id_dispositivo (un dispositivo no puede
--      tener dos historias).
-- -----------------------------------------------------------------------------
CREATE TABLE historia_dispositivo (
    id_historia        UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    id_dispositivo     UUID          NOT NULL UNIQUE,
    texto_historia     TEXT          NOT NULL,
    fecha_generacion   DATE          NOT NULL DEFAULT CURRENT_DATE,
    estado_aprobacion  VARCHAR(20)   NOT NULL DEFAULT 'pendiente',
    extracto           VARCHAR(300),
    imagen_url         VARCHAR(255),
    publica            BOOLEAN       NOT NULL DEFAULT FALSE,

    CONSTRAINT historia_estado_ck CHECK (estado_aprobacion IN
        ('pendiente','aprobada','rechazada')),
    -- Regla de negocio: no puede ser pública sin estar aprobada. El trigger
    -- fn_historia_publica_valida() añade la verificación de consentimiento.
    CONSTRAINT historia_publica_aprobada_ck CHECK (
        publica = FALSE OR estado_aprobacion = 'aprobada'
    ),

    CONSTRAINT historia_dispositivo_fk FOREIGN KEY (id_dispositivo)
        REFERENCES dispositivo (id_dispositivo)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE historia_dispositivo IS
  'Historia narrativa del dispositivo (1:1 con DISPOSITIVO, UNIQUE id_dispositivo).';

-- -----------------------------------------------------------------------------
-- 1.6  TRACKING_ESTADO
--      Eventos de trazabilidad por dispositivo (N eventos por dispositivo).
-- -----------------------------------------------------------------------------
CREATE TABLE tracking_estado (
    id_tracking          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    id_dispositivo       UUID          NOT NULL,
    etapa                VARCHAR(30)   NOT NULL,
    subestado            VARCHAR(100),
    fecha_actualizacion  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    mensaje_usuario      TEXT,
    procesamiento_tipo   VARCHAR(30)   NOT NULL,

    CONSTRAINT tracking_etapa_ck CHECK (etapa IN
        ('delivery','processing','completed')),
    CONSTRAINT tracking_procesamiento_ck CHECK (procesamiento_tipo IN
        ('standardRecycle','commemoration')),

    CONSTRAINT tracking_dispositivo_fk FOREIGN KEY (id_dispositivo)
        REFERENCES dispositivo (id_dispositivo)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE tracking_estado IS
  'Eventos de tracking (entrega, procesamiento, finalización) por dispositivo.';

-- -----------------------------------------------------------------------------
-- 1.7  PREFERENCIA_USUARIO
--      Preferencias de procesamiento y consentimiento de publicación.
-- -----------------------------------------------------------------------------
CREATE TABLE preferencia_usuario (
    id_preferencia                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario                    UUID        NOT NULL,
    tipo_procesamiento_preferido  VARCHAR(30),
    consentimiento_publicacion    BOOLEAN     NOT NULL DEFAULT FALSE,

    CONSTRAINT preferencia_tipo_ck CHECK (
        tipo_procesamiento_preferido IS NULL OR
        tipo_procesamiento_preferido IN ('standardRecycle','commemoration')
    ),

    CONSTRAINT preferencia_usuario_fk FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON UPDATE CASCADE ON DELETE CASCADE
);

COMMENT ON TABLE preferencia_usuario IS
  'Preferencias por usuario; consentimiento_publicacion habilita historias públicas.';


-- =============================================================================
-- 2. ÍNDICES  (rendimiento de lecturas frecuentes)
-- =============================================================================
CREATE INDEX idx_dispositivo_usuario       ON dispositivo       (id_usuario);
CREATE INDEX idx_dispositivo_fecha         ON dispositivo       (fecha_registro DESC);

CREATE INDEX idx_solicitud_usuario         ON solicitud_recogida(id_usuario);
CREATE INDEX idx_solicitud_dispositivo     ON solicitud_recogida(id_dispositivo);
CREATE INDEX idx_solicitud_punto           ON solicitud_recogida(id_punto);
CREATE INDEX idx_solicitud_estado          ON solicitud_recogida(estado_solicitud);

CREATE INDEX idx_tracking_dispositivo      ON tracking_estado   (id_dispositivo);
CREATE INDEX idx_tracking_fecha            ON tracking_estado   (fecha_actualizacion DESC);

CREATE INDEX idx_preferencia_usuario       ON preferencia_usuario(id_usuario);

CREATE INDEX idx_historia_publicas
  ON historia_dispositivo(fecha_generacion DESC)
  WHERE publica = TRUE AND estado_aprobacion = 'aprobada';


-- =============================================================================
-- 3. FUNCIONES Y TRIGGERS DE NEGOCIO
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 3.1  Año del dispositivo ≤ año actual
--      CURRENT_DATE no es IMMUTABLE, así que el CHECK no puede usarlo. Se
--      valida aquí en BEFORE INSERT/UPDATE.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_dispositivo_ano_actual()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.ano_aproximado > EXTRACT(YEAR FROM CURRENT_DATE)::INT THEN
        RAISE EXCEPTION
            'ano_aproximado (%) no puede ser mayor al año actual (%)',
            NEW.ano_aproximado, EXTRACT(YEAR FROM CURRENT_DATE)::INT
            USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_dispositivo_ano_actual
BEFORE INSERT OR UPDATE OF ano_aproximado ON dispositivo
FOR EACH ROW
EXECUTE FUNCTION fn_dispositivo_ano_actual();

-- -----------------------------------------------------------------------------
-- 3.2  Publicación de historia — dos condiciones obligatorias:
--      (a) estado_aprobacion = 'aprobada'
--      (b) el dueño del dispositivo tiene consentimiento_publicacion = TRUE
--          en al menos una fila de preferencia_usuario.
--      Si alguna falla, se rechaza la escritura con mensaje claro.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_historia_publica_valida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_id_usuario      UUID;
    v_tiene_consent   BOOLEAN;
BEGIN
    -- Si no se pretende publicar, no hay nada que validar.
    IF NEW.publica IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    -- Condición (a): aprobación previa.
    IF NEW.estado_aprobacion <> 'aprobada' THEN
        RAISE EXCEPTION
            'La historia % no puede ser pública sin aprobación (estado actual: %)',
            NEW.id_historia, NEW.estado_aprobacion
            USING ERRCODE = 'check_violation';
    END IF;

    -- Localizar al usuario dueño del dispositivo asociado.
    SELECT d.id_usuario INTO v_id_usuario
    FROM dispositivo d
    WHERE d.id_dispositivo = NEW.id_dispositivo;

    IF v_id_usuario IS NULL THEN
        RAISE EXCEPTION
            'Dispositivo % no existe; no se puede publicar la historia',
            NEW.id_dispositivo
            USING ERRCODE = 'foreign_key_violation';
    END IF;

    -- Condición (b): consentimiento explícito del usuario.
    SELECT EXISTS (
        SELECT 1 FROM preferencia_usuario p
        WHERE p.id_usuario = v_id_usuario
          AND p.consentimiento_publicacion = TRUE
    ) INTO v_tiene_consent;

    IF NOT v_tiene_consent THEN
        RAISE EXCEPTION
            'El usuario % no ha otorgado consentimiento_publicacion; la historia no puede publicarse',
            v_id_usuario
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_historia_publica_valida
BEFORE INSERT OR UPDATE OF publica, estado_aprobacion ON historia_dispositivo
FOR EACH ROW
EXECUTE FUNCTION fn_historia_publica_valida();


-- =============================================================================
-- 4. DATOS DE PRUEBA MÍNIMOS
--    (1 usuario · 1 dispositivo · 1 solicitud · 1 historia · 1 tracking
--     + 1 punto de recolección + 1 preferencia con consentimiento)
-- =============================================================================

-- 4.1  Punto de recolección de referencia.
INSERT INTO punto_recoleccion (
    id_punto, nombre, direccion, lat, lng, horario, tipos_aceptados, activo
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'EcoPunto Centro Medellín',
    'Cra. 52 #44-17, La Candelaria, Medellín',
    6.24470000, -75.57389000,
    'Lun-Sáb 8:00-18:00',
    'largeAppliance,smallAppliance,telecomEquipment,other',
    TRUE
);

-- 4.2  Usuario donante.
INSERT INTO usuario (
    id_usuario, nombre, apellido, correo, telefono, direccion,
    documento_identidad, tipo_usuario, fecha_registro, password_hash
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Ana', 'Pérez',
    'ana.perez@redime.co',
    '3001234567',
    'Cl. 10 # 45-20, Medellín',
    '1020304050',
    'donante',
    CURRENT_DATE,
    -- sha256("demo1234") con pepper "redime.mde.2026" — sólo demo.
    'e1a9a6c5d8c8a3bfe5d6b1c14d3f7cb62d7c1dfb25b7c3b62e0f5a3c1c4b9e1d'
);

-- 4.3  Preferencia con consentimiento explícito (habilita publicación).
INSERT INTO preferencia_usuario (
    id_preferencia, id_usuario,
    tipo_procesamiento_preferido, consentimiento_publicacion
) VALUES (
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    'commemoration',
    TRUE
);

-- 4.4  Dispositivo donado por Ana.
INSERT INTO dispositivo (
    id_dispositivo, id_usuario, marca, modelo, ano_aproximado,
    tipo_dispositivo, peso_estimado, antiguedad,
    funciona, pieza_entera, foto_url, fecha_registro
) VALUES (
    '33333333-3333-3333-3333-333333333333',
    '11111111-1111-1111-1111-111111111111',
    'Apple', 'iPhone 6',
    2014,
    'telecomEquipment',
    0.13,
    'más de 10 años',
    FALSE, TRUE, NULL,
    CURRENT_DATE
);

-- 4.5  Solicitud de recogida a domicilio asociada al dispositivo.
INSERT INTO solicitud_recogida (
    id_solicitud, id_usuario, id_dispositivo, id_punto,
    fecha_solicitud, metodo_entrega, direccion, fecha_preferida, estado_solicitud
) VALUES (
    '44444444-4444-4444-4444-444444444444',
    '11111111-1111-1111-1111-111111111111',
    '33333333-3333-3333-3333-333333333333',
    NULL,
    CURRENT_DATE,
    'homePickup',
    'Cl. 10 # 45-20, Medellín',
    CURRENT_DATE + INTERVAL '3 days',
    'pendiente'
);

-- 4.6  Historia narrativa (queda aprobada y pública gracias al consentimiento).
INSERT INTO historia_dispositivo (
    id_historia, id_dispositivo, texto_historia,
    fecha_generacion, estado_aprobacion, extracto, imagen_url, publica
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '33333333-3333-3333-3333-333333333333',
    'Este teléfono me acompañó durante una década: escuchó las primeras ' ||
    'palabras de mi hija, guardó las notas de voz de mi abuela y me llevó ' ||
    'por las calles de Medellín en noches de lluvia. Hoy descansa, pero su ' ||
    'memoria viaja al archivo colectivo.',
    CURRENT_DATE,
    'aprobada',
    'Un iPhone 6 que acompañó una década de recuerdos familiares.',
    NULL,
    TRUE
);

-- 4.7  Primer evento de tracking — solicitud recibida.
INSERT INTO tracking_estado (
    id_tracking, id_dispositivo, etapa, subestado,
    fecha_actualizacion, mensaje_usuario, procesamiento_tipo
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '33333333-3333-3333-3333-333333333333',
    'delivery',
    'Solicitud recibida',
    NOW(),
    'Tu solicitud fue registrada. Pronto recibirás más información.',
    'commemoration'
);


-- =============================================================================
-- FIN — El script es idempotente: volver a ejecutarlo recrea el esquema.
-- =============================================================================
