const pool = require('../config/database');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        user_role VARCHAR(50) DEFAULT 'customer',
        is_member BOOLEAN DEFAULT FALSE,
        membership_plan_id INTEGER,
        membership_start_date TIMESTAMP,
        membership_expiry_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Membership Plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS membership_plans (
        id SERIAL PRIMARY KEY,
        plan_name VARCHAR(100) NOT NULL,
        duration_type VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        discount_percentage DECIMAL(5, 2) NOT NULL,
        benefits TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Space Types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS space_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        total_capacity INTEGER NOT NULL,
        hourly_rate DECIMAL(10, 2) NOT NULL,
        half_day_rate DECIMAL(10, 2) NOT NULL,
        full_day_rate DECIMAL(10, 2) NOT NULL,
        weekly_rate DECIMAL(10, 2) NOT NULL,
        monthly_rate DECIMAL(10, 2) NOT NULL,
        member_discount_percent DECIMAL(5, 2) DEFAULT 0,
        image_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        space_type_id INTEGER REFERENCES space_types(id),
        number_of_seats INTEGER NOT NULL,
        start_datetime TIMESTAMP NOT NULL,
        end_datetime TIMESTAMP NOT NULL,
        duration_type VARCHAR(50) NOT NULL,
        booking_status VARCHAR(50) DEFAULT 'pending',
        base_price DECIMAL(10, 2) NOT NULL,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        total_amount DECIMAL(10, 2) NOT NULL,
        deposit_paid DECIMAL(10, 2) DEFAULT 0,
        balance_due DECIMAL(10, 2) NOT NULL,
        final_amount_paid DECIMAL(10, 2) DEFAULT 0,
        extension_fee DECIMAL(10, 2) DEFAULT 0,
        booking_reference VARCHAR(100) UNIQUE NOT NULL,
        check_in_time TIMESTAMP,
        check_out_time TIMESTAMP,
        special_requests TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment Transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_id VARCHAR(255),
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_date TIMESTAMP,
        gateway_response TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_space_type_id ON bookings(space_type_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_start_datetime ON bookings(start_datetime);
      CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
      CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payment_transactions(booking_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables created successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { createTables };
