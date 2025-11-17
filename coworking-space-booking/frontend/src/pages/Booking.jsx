import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spaceAPI, bookingAPI, paymentAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, CreditCard } from 'lucide-react';

const Booking = () => {
  const { spaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    numberOfSeats: 1,
    startDatetime: '',
    endDatetime: '',
    durationType: 'hourly',
    specialRequests: ''
  });
  const [pricing, setPricing] = useState({
    basePrice: 0,
    discount: 0,
    total: 0,
    deposit: 0
  });
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSpace();
  }, [spaceId]);

  useEffect(() => {
    if (space) {
      calculatePricing();
    }
  }, [bookingData, space]);

  const fetchSpace = async () => {
    try {
      const response = await spaceAPI.getSpaceById(spaceId);
      setSpace(response.data);
    } catch (error) {
      console.error('Error fetching space:', error);
      setError('Space not found');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!space) return;

    let basePrice = 0;
    const { durationType, numberOfSeats } = bookingData;

    switch (durationType) {
      case 'hourly':
        basePrice = space.hourly_rate;
        break;
      case 'half_day':
        basePrice = space.half_day_rate;
        break;
      case 'full_day':
        basePrice = space.full_day_rate;
        break;
      case 'weekly':
        basePrice = space.weekly_rate;
        break;
      case 'monthly':
        basePrice = space.monthly_rate;
        break;
      default:
        basePrice = space.hourly_rate;
    }

    const total = basePrice * numberOfSeats;
    const discountPercent = user?.isMember ? space.member_discount_percent : 0;
    const discount = (total * discountPercent) / 100;
    const finalTotal = total - discount;
    const deposit = finalTotal * 0.5;

    setPricing({
      basePrice: total,
      discount,
      total: finalTotal,
      deposit
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Create booking
      const bookingResponse = await bookingAPI.createBooking({
        spaceTypeId: parseInt(spaceId),
        ...bookingData,
        numberOfSeats: parseInt(bookingData.numberOfSeats)
      });

      const booking = bookingResponse.data.booking;

      // Process deposit payment
      await paymentAPI.processDeposit({
        bookingId: booking.id,
        paymentMethod
      });

      // Success! Navigate to bookings
      navigate('/my-bookings', {
        state: { message: 'Booking successful! Deposit payment processed.' }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.response?.data?.error || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
          <p className="mt-4 text-gray-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-dark mb-4">Space Not Found</h2>
          <button onClick={() => navigate('/spaces')} className="btn-primary">
            Browse Spaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">Book Your Workspace</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Space Info & Form */}
        <div>
          <div className="card mb-6">
            <img
              src={space.image_url}
              alt={space.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-primary-navy mb-2">{space.name}</h2>
              <p className="text-gray-600 mb-4">{space.description}</p>
              <div className="flex items-center gap-2 text-gray-600">
                <Users size={18} />
                <span>Up to {space.total_capacity} seats available</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-6">
            <h3 className="text-xl font-bold text-primary-navy mb-6">Booking Details</h3>

            {error && (
              <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline mr-2" size={16} />
                  Duration Type
                </label>
                <select
                  name="durationType"
                  value={bookingData.durationType}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                >
                  <option value="hourly">Hourly</option>
                  <option value="half_day">Half Day (4 hours)</option>
                  <option value="full_day">Full Day (8 hours)</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline mr-2" size={16} />
                  Number of Seats
                </label>
                <input
                  type="number"
                  name="numberOfSeats"
                  min="1"
                  max={space.total_capacity}
                  value={bookingData.numberOfSeats}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline mr-2" size={16} />
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="startDatetime"
                  value={bookingData.startDatetime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endDatetime"
                  value={bookingData.endDatetime}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleInputChange}
                  className="input-field"
                  rows="3"
                  placeholder="Any special requirements?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="inline mr-2" size={16} />
                  Payment Method (Deposit - 50%)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="gcash">GCash</option>
                  <option value="maya">Maya</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-6"
            >
              {submitting ? 'Processing...' : 'Confirm Booking & Pay Deposit'}
            </button>
          </form>
        </div>

        {/* Right Column - Price Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h3 className="text-xl font-bold text-primary-navy mb-6">Price Summary</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price</span>
                <span className="font-semibold">₱{pricing.basePrice.toFixed(2)}</span>
              </div>
              
              {user?.isMember && pricing.discount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Member Discount ({space.member_discount_percent}%)</span>
                  <span className="font-semibold">-₱{pricing.discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t pt-4 flex justify-between text-lg">
                <span className="font-bold">Total Amount</span>
                <span className="font-bold text-primary-navy">₱{pricing.total.toFixed(2)}</span>
              </div>
              
              <div className="bg-accent-orange bg-opacity-10 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Deposit (50%)</span>
                  <span className="font-bold text-accent-orange">₱{pricing.deposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Balance Due</span>
                  <span className="text-gray-600">₱{pricing.deposit.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-light p-4 rounded-lg text-sm text-gray-600">
              <p className="mb-2">📝 <strong>Payment Terms:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>50% deposit required now</li>
                <li>Remaining 50% due after use</li>
                <li>Extensions charged separately</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
