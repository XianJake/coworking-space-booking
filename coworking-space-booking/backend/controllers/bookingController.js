const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Calculate price based on duration type
const calculatePrice = (spaceType, durationType, numberOfSeats, isMember) => {
  let basePrice = 0;
  
  switch(durationType) {
    case 'hourly':
      basePrice = spaceType.hourly_rate;
      break;
    case 'half_day':
      basePrice = spaceType.half_day_rate;
      break;
    case 'full_day':
      basePrice = spaceType.full_day_rate;
      break;
    case 'weekly':
      basePrice = spaceType.weekly_rate;
      break;
    case 'monthly':
      basePrice = spaceType.monthly_rate;
      break;
    default:
      basePrice = spaceType.hourly_rate;
  }
  
  const totalBase = basePrice * numberOfSeats;
  const discount = isMember ? (totalBase * spaceType.member_discount_percent / 100) : 0;
  const finalPrice = totalBase - discount;
  
  return {
    basePrice: totalBase,
    discount,
    totalAmount: finalPrice,
    depositAmount: finalPrice * 0.5,
    balanceDue: finalPrice * 0.5
  };
};

// Create a new booking
const createBooking = async (req, res) => {
  const {
    spaceTypeId,
    numberOfSeats,
    startDatetime,
    endDatetime,
    durationType,
    specialRequests
  } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get space type details
    const spaceResult = await client.query(
      'SELECT * FROM space_types WHERE id = $1',
      [spaceTypeId]
    );
    
    if (spaceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Space type not found' });
    }
    
    const spaceType = spaceResult.rows[0];
    
    // Check availability
    const bookingsResult = await client.query(
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
    const availableSeats = spaceType.total_capacity - bookedSeats;
    
    if (availableSeats < numberOfSeats) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Not enough seats available',
        availableSeats,
        requestedSeats: numberOfSeats
      });
    }
    
    // Get user membership status
    const userResult = await client.query(
      'SELECT is_member FROM users WHERE id = $1',
      [req.user.id]
    );
    const isMember = userResult.rows[0].is_member;
    
    // Calculate pricing
    const pricing = calculatePrice(spaceType, durationType, numberOfSeats, isMember);
    
    // Generate unique booking reference
    const bookingReference = `BK-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Create booking
    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id, space_type_id, number_of_seats,
        start_datetime, end_datetime, duration_type,
        booking_status, base_price, discount_amount, total_amount,
        deposit_paid, balance_due, booking_reference, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        req.user.id, spaceTypeId, numberOfSeats,
        startDatetime, endDatetime, durationType,
        'pending', pricing.basePrice, pricing.discount, pricing.totalAmount,
        0, pricing.totalAmount, bookingReference, specialRequests || null
      ]
    );
    
    await client.query('COMMIT');
    
    const booking = bookingResult.rows[0];
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        ...booking,
        depositAmount: pricing.depositAmount,
        spaceName: spaceType.name
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Error creating booking' });
  } finally {
    client.release();
  }
};

// Get user's bookings
const getUserBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, st.name as space_name, st.image_url
       FROM bookings b
       JOIN space_types st ON b.space_type_id = st.id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
};

// Get all bookings (Admin)
const getAllBookings = async (req, res) => {
  const { status, startDate, endDate } = req.query;
  
  try {
    let query = `
      SELECT b.*, st.name as space_name, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN space_types st ON b.space_type_id = st.id
      JOIN users u ON b.user_id = u.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (status) {
      query += ` AND b.booking_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND b.start_datetime >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND b.end_datetime <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    query += ' ORDER BY b.created_at DESC';
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
};

// Get booking by ID
const getBookingById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `SELECT b.*, st.name as space_name, st.image_url, u.name as user_name, u.email as user_email, u.phone
       FROM bookings b
       JOIN space_types st ON b.space_type_id = st.id
       JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if user has permission to view this booking
    const booking = result.rows[0];
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Error fetching booking' });
  }
};

// Update booking status (Admin/Staff)
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status, checkInTime, checkOutTime } = req.body;
  
  try {
    let query = 'UPDATE bookings SET booking_status = $1';
    const params = [status, id];
    let paramCount = 2;
    
    if (checkInTime) {
      paramCount++;
      query += `, check_in_time = $${paramCount}`;
      params.splice(paramCount - 1, 0, checkInTime);
    }
    
    if (checkOutTime) {
      paramCount++;
      query += `, check_out_time = $${paramCount}`;
      params.splice(paramCount - 1, 0, checkOutTime);
    }
    
    query += `, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length} RETURNING *`;
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({
      message: 'Booking status updated successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Error updating booking' });
  }
};

// Cancel booking
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query(
      `UPDATE bookings 
       SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND booking_status = 'pending'
       RETURNING *`,
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Booking not found or cannot be cancelled (already confirmed/completed)'
      });
    }
    
    res.json({
      message: 'Booking cancelled successfully',
      booking: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Error cancelling booking' });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
};
