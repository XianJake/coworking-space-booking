const pool = require('../config/database');

// Get all membership plans
const getAllMembershipPlans = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM membership_plans WHERE is_active = true ORDER BY price'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    res.status(500).json({ error: 'Error fetching membership plans' });
  }
};

// Subscribe to a membership plan
const subscribeToPlan = async (req, res) => {
  const { planId, paymentMethod } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get plan details
    const planResult = await client.query(
      'SELECT * FROM membership_plans WHERE id = $1 AND is_active = true',
      [planId]
    );
    
    if (planResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Membership plan not found' });
    }
    
    const plan = planResult.rows[0];
    
    // Calculate membership dates
    const startDate = new Date();
    let expiryDate = new Date();
    
    switch(plan.duration_type) {
      case 'monthly':
        expiryDate.setMonth(expiryDate.getMonth() + 1);
        break;
      case 'quarterly':
        expiryDate.setMonth(expiryDate.getMonth() + 3);
        break;
      case 'annual':
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        break;
    }
    
    // In production, process payment through gateway
    // For now, simulate successful payment
    
    // Update user membership
    await client.query(
      `UPDATE users 
       SET is_member = true,
           membership_plan_id = $1,
           membership_start_date = $2,
           membership_expiry_date = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [planId, startDate, expiryDate, req.user.id]
    );
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Successfully subscribed to membership plan',
      plan: plan.plan_name,
      startDate,
      expiryDate,
      discount: plan.discount_percentage
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error subscribing to plan:', error);
    res.status(500).json({ error: 'Error subscribing to membership plan' });
  } finally {
    client.release();
  }
};

// Cancel membership
const cancelMembership = async (req, res) => {
  try {
    await pool.query(
      `UPDATE users 
       SET is_member = false,
           membership_plan_id = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [req.user.id]
    );
    
    res.json({
      message: 'Membership cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling membership:', error);
    res.status(500).json({ error: 'Error cancelling membership' });
  }
};

module.exports = {
  getAllMembershipPlans,
  subscribeToPlan,
  cancelMembership
};
