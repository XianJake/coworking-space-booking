const { createTables } = require('./createTables');
const { seedData } = require('./seedData');
const pool = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🚀 Running database migrations...');
    await createTables();
    
    console.log('🌱 Seeding initial data...');
    await seedData();
    
    console.log('');
    console.log('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations();
