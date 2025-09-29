import mysql from 'mysql2/promise';

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
      console.log(`📊 MySQL Version: ${(rows as any)[0].version}`);
      
      // List databases
      const [databases] = await connection.query('SHOW DATABASES');
      console.log(`📋 Available databases: ${(databases as any[]).map(db => db.Database).join(', ')}`);
      
      await connection.end();
      
      console.log(`\n🎯 Use this configuration in your .env.local:`);
      console.log(`DB_PORT=${port}`);
      
      return port;
      
    } catch (error) {
      if ((error as any).code === 'ECONNREFUSED') {
        console.log(`❌ Port ${port}: Connection refused`);
      } else if ((error as any).code === 'ER_ACCESS_DENIED_ERROR') {
        console.log(`🔐 Port ${port}: Access denied (server is running but wrong credentials)`);
        console.log(`   Try different username/password combination`);
      } else {
        console.log(`⚠️  Port ${port}: ${(error as any).message}`);
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

findMySQLPort();


