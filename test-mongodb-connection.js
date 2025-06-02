const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  console.log('Probando conexión a MongoDB...');
  console.log('URI:', process.env.MONGO_URI || 'mongodb://localhost:27017/cozyapp');
  console.log('DB Name:', process.env.MONGO_DB_NAME || 'cozyapp');
  
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cozyapp', {
      dbName: process.env.MONGO_DB_NAME || 'cozyapp',
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Conexión a MongoDB establecida correctamente');
    
    // Verificar las colecciones existentes
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Colecciones en la base de datos:');
    collections.forEach(col => {
      console.log(`- ${col.name}`);
    });
    
    // Verificar si existen las colecciones necesarias
    const requiredCollections = ['users', 'tasks', 'tasklists', 'globalevents'];
    const existingCollections = collections.map(col => col.name);
    
    requiredCollections.forEach(col => {
      if (!existingCollections.includes(col)) {
        console.warn(`Advertencia: No se encontró la colección '${col}'`);
      }
    });
    
  } catch (error) {
    console.error('Error conectando a MongoDB:', error.message);
  } finally {
    mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

testConnection();