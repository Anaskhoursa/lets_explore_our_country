const {Pool} = require('pg')

const pool = new Pool ({
  user: 'postgres',           
  host: 'localhost',               
  database: 'Nktachfo_Bladna',            
  password: '0000',       
  port: 5432,
})

pool.connect((err, client, release) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
    } else {
      console.log('Connected to the database successfully!');
    }
    release(); 
  });
module.exports = pool;
