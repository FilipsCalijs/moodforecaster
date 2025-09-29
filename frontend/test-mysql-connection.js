const mysql = require('mysql2/promise');

const commonPorts = [3306, 8889, 3307, 8888];

async function findMySQLPort() {
  console.log('🔍 Searching for active MySQL server...');
  
  for (const port of commonPorts) {
    console.log(`\n📡 Testing port ${port}...`);
    
    try {
      const connection = mysql.createConnection({
        host: '127.0.0.1',
        port: port,
        user: 'root',
        password: 'root',
        connectTimeout: 5000,
      });

      await connection.connect();
      console.log(`✅ SUCCESS! MySQL is running on port ${port}`);
      
      // Get server info
      const [rows] = await connection.query('SELECT VERSION() as version');
      console.log(`📊 MySQL Version: ${rows[0].version}`);
      
      // List databases
      const [databases] = await connection.query('SHOW DATABASES');
      console.log(`📋 Available databases: ${databases.map(db => db.Database).join(', ')}`);
      
      // Check if our database exists
      const dbExists = databases.some(db => db.Database === 'moodforecaster');
      
      if (!dbExists) {
        console.log('⚠️  Database "moodforecaster" does not exist. Creating it...');
        await connection.query('CREATE DATABASE moodforecaster');
        console.log('✅ Database "moodforecaster" created successfully!');
      } else {
        console.log('✅ Database "moodforecaster" already exists');
      }
      
      // Switch to our database
      await connection.query('USE moodforecaster');
      
      // Check if users table exists
      const [tables] = await connection.query('SHOW TABLES');
      console.log('📋 Tables in moodforecaster:', tables);
      
      const tableExists = tables.some(table => 
        table[`Tables_in_moodforecaster`] === 'users_mood_forecaster'
      );
      
      if (!tableExists) {
        console.log('⚠️  Table "users_mood_forecaster" does not exist. Creating it...');
        await connection.query(`
          CREATE TABLE users_mood_forecaster (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        console.log('✅ Table "users_mood_forecaster" created successfully!');
      } else {
        console.log('✅ Table "users_mood_forecaster" already exists');
      }
      
      await connection.end();
      
      console.log(`\n🎯 Configuration found! Update your .env.local:`);
      console.log(`DB_HOST=127.0.0.1`);
      console.log(`DB_PORT=${port}`);
      console.log(`DB_USER=root`);
      console.log(`DB_PASSWORD=root`);
      console.log(`DB_NAME=moodforecaster`);
      
      return port;
      
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Port ${port}: Connection refused`);
      } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(`🔐 Port ${port}: Access denied (server is running but wrong credentials)`);
        console.log(`   Try different username/password combination`);
      } else {
        console.log(`⚠️  Port ${port}: ${error.message}`);
      }
    }
  }
  
  console.log('\n❌ No MySQL server found on common ports');
  console.log('\n💡 Troubleshooting steps:');
  console.log('1. Start MAMP and ensure MySQL is running');
  console.log('2. Check MAMP preferences for the correct MySQL port');
  console.log('3. Try connecting with different credentials');
  console.log('4. Install MySQL separately if MAMP is not working');
  
  return null;
}

findMySQLPort().catch(console.error);


