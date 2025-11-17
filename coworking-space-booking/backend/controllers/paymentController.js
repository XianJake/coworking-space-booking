const pool = require('../config/database');

// Process deposit payment (50%)
const processDepositPayment = async (req, res) => {
  const { bookingId, paymentMethod } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get booking details
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, req.user.id]
    );
    
    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    
    if (booking.booking_status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Booking already processed' });
    }
    
    const depositAmount = booking.total_amount * 0.5;
    
    // In production, integrate with actual payment gateway (PayMongo, etc.)
    // For now, simulate successful payment
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Create payment transaction record
    await client.query(
      `INSERT INTO payment_transactions (
        booking_id, user_id, transaction_type, payment_method,
        amount, transaction_id, payment_status, payment_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [bookingId, req.user.id, 'deposit', paymentMethod, depositAmount, transactionId, 'success']
    );
    
    // Update booking
    await client.query(
      `UPDATE bookings 
       SET booking_status = 'confirmed',
           deposit_paid = $1,
           balance_due = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [depositAmount, depositAmount, bookingId]
    );
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Deposit payment processed successfully',
      transactionId,
      depositAmount,
      balanceDue: depositAmount,
      bookingStatus: 'confirmed'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Error processing payment' });
  } finally {
    client.release();
  }
};

// Process balance payment (remaining 50% + extensions)
const processBalancePayment = async (req, res) => {
  const { bookingId, paymentMethod, extensionFee } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get booking details
    const bookingResult = await client.query(
      'SELECT * FROM bookings WHERE id = $1',
      [bookingId]
    );
    
    if (bookingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    
    if (booking.booking_status !== 'in_progress') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Booking must be in progress to process balance' });
    }
    
    const totalBalanceAmount = booking.balance_due + (extensionFee || 0);
    
    // Simulate payment processing
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;
    
    // Create payment transaction record
    await client.query(
      `INSERT INTO payment_transactions (
        booking_id, user_id, transaction_type, payment_method,
        amount, transaction_id, payment_status, payment_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [bookingId, booking.user_id, 'balance', paymentMethod, totalBalanceAmount, transactionId, 'success']
    );
    
    // Update booking
    await client.query(
      `UPDATE bookings 
       SET booking_status = 'completed',
           extension_fee = $1,
           final_amount_paid = deposit_paid + $2,
           balance_due = 0,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [extensionFee || 0, totalBalanceAmount, bookingId]
    );
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Balance payment processed successfully',
      transactionId,
      amountPaid: totalBalanceAmount,
      bookingStatus: 'completed'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing balance payment:', error);
    res.status(500).json({ error: 'Error processing balance payment' });
  } finally {
    client.release();
  }
};

// Get payment history for a booking
const getBookingPayments = async (req, res) => {
  const { bookingId } = req.params;
  
  try {
    // Check if user has access to this booking
    const bookingResult = await pool.query(
      'SELECT user_id FROM bookings WHERE id = $1',
      [bookingId]
    );
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && booking.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get all payments for this booking
    const result = await pool.query(
      `SELECT * FROM payment_transactions
       WHERE booking_id = $1
       ORDER BY created_at DESC`,
      [bookingId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Error fetching payment history' });
  }
};

// Get user's payment history
const getUserPayments = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pt.*, b.booking_reference, st.name as space_name
       FROM payment_transactions pt
       JOIN bookings b ON pt.booking_id = b.id
       JOIN space_types st ON b.space_type_id = st.id
       WHERE pt.user_id = $1
       ORDER BY pt.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Error fetching payment history' });
  }
};

module.exports = {
  processDepositPayment,
  processBalancePayment,
  getBookingPayments,
  getUserPayments
};
