import React, { useEffect, useState } from 'react';
import { bookingAPI } from '../utils/api';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await bookingAPI.getAllBookings();
      const bookingsData = response.data;
      setBookings(bookingsData);
      
      // Calculate stats
      const stats = {
        totalBookings: bookingsData.length,
        totalRevenue: bookingsData.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0),
        activeBookings: bookingsData.filter(b => ['confirmed', 'in_progress'].includes(b.booking_status)).length,
        pendingPayments: bookingsData.filter(b => b.booking_status === 'pending').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateBookingStatus(bookingId, { status: newStatus });
      fetchBookings(); // Refresh
      alert('Status updated successfully!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.booking_status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-accent-orange" size={32} />
            <span className="text-3xl font-bold text-primary-navy">{stats.totalBookings}</span>
          </div>
          <p className="text-gray-600">Total Bookings</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="text-success" size={32} />
            <span className="text-3xl font-bold text-primary-navy">₱{stats.totalRevenue.toFixed(0)}</span>
          </div>
          <p className="text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="text-blue-500" size={32} />
            <span className="text-3xl font-bold text-primary-navy">{stats.activeBookings}</span>
          </div>
          <p className="text-gray-600">Active Bookings</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-yellow-500" size={32} />
            <span className="text-3xl font-bold text-primary-navy">{stats.pendingPayments}</span>
          </div>
          <p className="text-gray-600">Pending Payments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-6">
        <div className="flex gap-3 overflow-x-auto">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap ${
                filter === status
                  ? 'bg-accent-orange text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Space</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-primary-navy">
                    {booking.booking_reference}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{booking.user_name}</p>
                      <p className="text-gray-500 text-xs">{booking.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{booking.space_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {format(new Date(booking.start_datetime), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    ₱{booking.total_amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.booking_status === 'confirmed' ? 'bg-success bg-opacity-10 text-success' :
                      booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.booking_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      booking.booking_status === 'completed' ? 'bg-gray-200 text-gray-700' :
                      'bg-error bg-opacity-10 text-error'
                    }`}>
                      {booking.booking_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      defaultValue=""
                    >
                      <option value="" disabled>Update Status</option>
                      <option value="confirmed">Confirm</option>
                      <option value="in_progress">Check-in</option>
                      <option value="completed">Complete</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
