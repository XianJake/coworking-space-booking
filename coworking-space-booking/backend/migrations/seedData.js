const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Seed Membership Plans
    const membershipPlans = [
      ['Basic Monthly', 'monthly', 1500, 10, 'Access to common areas, 10% discount on bookings', true],
      ['Premium Monthly', 'monthly', 2500, 15, 'Access to all areas, 15% discount, priority booking', true],
      ['Enterprise Annual', 'annual', 25000, 20, 'All premium benefits + 20% discount, dedicated account manager', true]
    ];

    for (const plan of membershipPlans) {
      await client.query(`
        INSERT INTO membership_plans (plan_name, duration_type, price, discount_percentage, benefits, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, plan);
    }

    // Seed Space Types
    const spaceTypes = [
      [
        'Common Area',
        'Open workspace with shared amenities, perfect for focused individual work',
        15,
        100, 350, 650, 3000, 10000, 15,
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        true
      ],
      [
        'Private Room',
        'Quiet private office space for individuals or small teams',
        2,
        200, 700, 1300, 6000, 20000, 15,
        'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800',
        true
      ],
      [
        'Collaboration Room',
        'Spacious meeting room with whiteboard and video conferencing',
        8,
        300, 1000, 1800, 8000, 28000, 15,
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
        true
      ],
      [
        'Premium Seat',
        'Ergonomic workspace with premium amenities and stunning views',
        5,
        150, 500, 950, 4500, 15000, 15,
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
        true
      ]
    ];

    for (const space of spaceTypes) {
      await client.query(`
        INSERT INTO space_types (
          name, description, total_capacity,
          hourly_rate, half_day_rate, full_day_rate, weekly_rate, monthly_rate,
          member_discount_percent, image_url, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING
      `, space);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, phone, user_role, is_member)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['admin@coworkspace.com', hashedPassword, 'Admin User', '+639123456789', 'admin', false]);

    // Create demo customer
    const customerPassword = await bcrypt.hash('demo123', 10);
    await client.query(`
      INSERT INTO users (email, password, name, phone, user_role, is_member)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `, ['demo@customer.com', customerPassword, 'Demo Customer', '+639987654321', 'customer', false]);

    await client.query('COMMIT');
    console.log('✅ Seed data inserted successfully!');
    console.log('');
    console.log('📝 Demo Accounts:');
    console.log('   Admin: admin@coworkspace.com / admin123');
    console.log('   Customer: demo@customer.com / demo123');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { seedData };
