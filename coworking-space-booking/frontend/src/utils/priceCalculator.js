/**
 * Price Calculator Utility
 * Pricing: 45 pesos/hour base, 1.50 pesos per additional minute
 * Minimum: 1 hour
 */

export const HOURLY_RATE = 45; // pesos per hour
export const PER_MINUTE_RATE = 1.50; // pesos per minute (for additional minutes beyond hourly blocks)
export const MINIMUM_HOURS = 1;

/**
 * Calculate price based on start and end datetime
 * @param {string|Date} startDatetime - Start date and time
 * @param {string|Date} endDatetime - End date and time
 * @param {number} numberOfSeats - Number of seats to book (default: 1)
 * @param {number} memberDiscountPercent - Member discount percentage (default: 0)
 * @returns {Object} Pricing breakdown
 */
export const calculatePrice = (startDatetime, endDatetime, numberOfSeats = 1, memberDiscountPercent = 0) => {
  if (!startDatetime || !endDatetime) {
    return {
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      basePrice: 0,
      discount: 0,
      subtotal: 0,
      total: 0,
      pricePerSeat: 0
    };
  }

  const start = new Date(startDatetime);
  const end = new Date(endDatetime);

  // Calculate total duration in milliseconds
  const durationMs = end - start;

  if (durationMs <= 0) {
    return {
      hours: 0,
      minutes: 0,
      totalMinutes: 0,
      basePrice: 0,
      discount: 0,
      subtotal: 0,
      total: 0,
      pricePerSeat: 0,
      error: 'End time must be after start time'
    };
  }

  // Convert to total minutes
  const totalMinutes = Math.ceil(durationMs / (1000 * 60));

  // Calculate hours and remaining minutes
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Enforce minimum of 1 hour
  const chargeableHours = Math.max(hours, MINIMUM_HOURS);
  const chargeableMinutes = hours >= MINIMUM_HOURS ? remainingMinutes : 0;

  // Calculate base price per seat
  // Price = (hours × 45) + (additional minutes × 1.50)
  const hourlyCharge = chargeableHours * HOURLY_RATE;
  const minuteCharge = chargeableMinutes * PER_MINUTE_RATE;
  const pricePerSeat = hourlyCharge + minuteCharge;

  // Calculate subtotal for all seats
  const subtotal = pricePerSeat * numberOfSeats;

  // Apply member discount
  const discount = (subtotal * memberDiscountPercent) / 100;
  const total = subtotal - discount;

  return {
    hours: chargeableHours,
    minutes: chargeableMinutes,
    totalMinutes: chargeableHours * 60 + chargeableMinutes,
    actualHours: hours,
    actualMinutes: remainingMinutes,
    basePrice: pricePerSeat,
    subtotal,
    discount,
    total,
    pricePerSeat,
    numberOfSeats,
    memberDiscountPercent,
    breakdown: {
      hourlyCharge,
      minuteCharge
    }
  };
};

/**
 * Format duration as human-readable string
 * @param {number} hours - Number of hours
 * @param {number} minutes - Number of minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (hours, minutes) => {
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  }
  return parts.join(' and ') || '0 minutes';
};

/**
 * Format price in Philippine Peso
 * @param {number} amount - Amount to format
 * @returns {string} Formatted price
 */
export const formatPrice = (amount) => {
  return `₱${amount.toFixed(2)}`;
};
