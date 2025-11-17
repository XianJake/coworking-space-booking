import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../utils/api';
import { Calendar, MapPin, Clock, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-success bg-opacity-10 text-success',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-200 text-gray-700',
      cancelled: 'bg-error bg-opacity-10 text-error'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(booking.booking_status);
    if (filter === 'past') return ['completed'].includes(booking.booking_status);
    if (filter === 'cancelled') return booking.booking_status === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
          <p className="mt-4 text-gray-dark">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">My Bookings</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto">
        {['all', 'upcoming', 'past', 'cancelled'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
              filter === f
                ? 'bg-accent-orange text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings found</h3>
          <p className="text-gray-500">Start booking your workspace today!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="card hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <img
                    src={booking.image_url}
                    alt={booking.space_name}
                    className="w-full md:w-48 h-32 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-primary-navy mb-1">
                          {booking.space_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Booking Reference: {booking.booking_reference}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.booking_status)}`}>
                        {booking.booking_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        <span className="text-sm">
                          {format(new Date(booking.start_datetime), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2" />
                        <span className="text-sm">
                          {format(new Date(booking.start_datetime), 'hh:mm a')} - 
                          {format(new Date(booking.end_datetime), 'hh:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        <span className="text-sm capitalize">
                          {booking.number_of_seats} seat(s) - {booking.duration_type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign size={16} className="mr-2" />
                        <span className="text-sm font-semibold">
                          ₱{booking.total_amount}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-3 border-t">
                      {booking.booking_status === 'confirmed' && (
                        <div className="flex items-center text-success text-sm">
                          <CheckCircle size={16} className="mr-1" />
                          Deposit Paid: ₱{booking.deposit_paid}
                        </div>
                      )}
                      {booking.booking_status === 'pending' && (
                        <div className="text-yellow-600 text-sm">
                          ⚠️ Awaiting payment confirmation
                        </div>
                      )}
                      {booking.balance_due > 0 && booking.booking_status !== 'cancelled' && (
                        <div className="text-accent-orange text-sm">
                          Balance Due: ₱{booking.balance_due}
                        </div>
                      )}
                    </div>

                    {booking.special_requests && (
                      <div className="mt-3 p-3 bg-gray-light rounded text-sm">
                        <strong>Special Requests:</strong> {booking.special_requests}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
