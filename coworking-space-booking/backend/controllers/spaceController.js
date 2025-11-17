const pool = require('../config/database');

// Get all active space types
const getAllSpaces = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM space_types WHERE is_active = true ORDER BY id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({ error: 'Error fetching space types' });
  }
};

// Get single space type by ID
const getSpaceById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT * FROM space_types WHERE id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Space type not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching space:', error);
    res.status(500).json({ error: 'Error fetching space type' });
  }
};

// Check availability for a space type
const checkAvailability = async (req, res) => {
  const { spaceTypeId, startDatetime, endDatetime, numberOfSeats } = req.query;
  
  try {
    // Get space capacity
    const spaceResult = await pool.query(
      'SELECT total_capacity FROM space_types WHERE id = $1',
      [spaceTypeId]
    );
    
    if (spaceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Space type not found' });
    }
    
    const totalCapacity = spaceResult.rows[0].total_capacity;
    
    // Get all bookings that overlap with the requested time period
    const bookingsResult = await pool.query(
      `SELECT SUM(number_of_seats) as booked_seats
       FROM bookings
       WHERE space_type_id = $1
         AND booking_status IN ('confirmed', 'in_progress')
         AND (
           (start_datetime <= $2 AND end_datetime > $2) OR
           (start_datetime < $3 AND end_datetime >= $3) OR
           (start_datetime >= $2 AND end_datetime <= $3)
         )`,
      [spaceTypeId, startDatetime, endDatetime]
    );
    
    const bookedSeats = bookingsResult.rows[0].booked_seats || 0;
    const availableSeats = totalCapacity - bookedSeats;
    
    res.json({
      totalCapacity,
      bookedSeats,
      availableSeats,
      requestedSeats: parseInt(numberOfSeats),
      isAvailable: availableSeats >= parseInt(numberOfSeats)
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Error checking availability' });
  }
};

// Create space type (Admin only)
const createSpace = async (req, res) => {
  const {
    name, description, totalCapacity,
    hourlyRate, halfDayRate, fullDayRate, weeklyRate, monthlyRate,
    memberDiscountPercent, imageUrl
  } = req.body;
  
  try {
    const result = await pool.query(
      `INSERT INTO space_types (
        name, description, total_capacity,
        hourly_rate, half_day_rate, full_day_rate, weekly_rate, monthly_rate,
        member_discount_percent, image_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [name, description, totalCapacity, hourlyRate, halfDayRate, fullDayRate,
       weeklyRate, monthlyRate, memberDiscountPercent, imageUrl]
    );
    
    res.status(201).json({
      message: 'Space type created successfully',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({ error: 'Error creating space type' });
  }
};

// Update space type (Admin only)
const updateSpace = async (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  
  try {
    // Build dynamic update query
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const result = await pool.query(
      `UPDATE space_types SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Space type not found' });
    }
    
    res.json({
      message: 'Space type updated successfully',
      space: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating space:', error);
    res.status(500).json({ error: 'Error updating space type' });
  }
};

module.exports = {
  getAllSpaces,
  getSpaceById,
  checkAvailability,
  createSpace,
  updateSpace
};
