
require('dotenv').config();
const {connectDB} = require ('./src/config/db'); 
const { initContactTable } = require('./src/config/initTables');
const app = require( './app');


//console.log("DATABASE_URL:", process.env.DATABASE_URL);



PORT = process.env.PORT || 4000;




const startServer = async () => {
  try {
    await connectDB();
    await initContactTable();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });

  } catch (error) {
    console.error("Error al iniciar servidor:", error);
  }
};


startServer();


