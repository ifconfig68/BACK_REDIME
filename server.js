require('dotenv').config();


console.log("DATABASE_URL:", process.env.DATABASE_URL);

const {connectDB} = require ('./src/config/db'); 
const app = require( './app');

PORT = process.env.PORT || 4000;
connectDB();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


