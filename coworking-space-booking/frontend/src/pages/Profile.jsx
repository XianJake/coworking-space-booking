import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, membershipAPI } from '../utils/api';
import { User, Mail, Phone, CreditCard, Edit2, Save, X, Award } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });

  const [membershipPlans, setMembershipPlans] = useState([]);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
    fetchMembershipPlans();
  }, [user]);

  const fetchMembershipPlans = async () => {
    try {
      const response = await membershipAPI.getAllPlans();
      setMembershipPlans(response.data.filter(plan => plan.is_active));
    } catch (error) {
      console.error('Error fetching membership plans:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Note: You'll need to add an update profile endpoint in the backend
      // For now, this is a placeholder
      const response = await authAPI.getProfile();

      // Simulate update (you'll need to implement PUT /api/auth/profile endpoint)
      setSuccess('Profile updated successfully!');
      setIsEditing(false);

      // Update user context
      if (updateUser) {
        updateUser({ ...user, ...profileData });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user.name || '',
      phone: user.phone || ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleSubscribe = async (planId) => {
    setSubscribing(true);
    setError('');

    try {
      const response = await membershipAPI.subscribe({
        membershipPlanId: planId,
        paymentMethod: 'gcash' // You can make this dynamic
      });

      setSuccess('Membership upgraded successfully!');
      setShowMembershipModal(false);

      // Refresh user data
      const profileResponse = await authAPI.getProfile();
      if (updateUser) {
        updateUser(profileResponse.data);
      }
    } catch (error) {
      console.error('Error subscribing to membership:', error);
      setError(error.response?.data?.error || 'Failed to subscribe to membership');
    } finally {
      setSubscribing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="section-title mb-8">My Profile</h1>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-success bg-opacity-10 border border-success text-success px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-error bg-opacity-10 border border-error text-error px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Information Card */}
        <div className="md:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-navy">Personal Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Save size={16} />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={loading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline mr-2" size={16} />
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Your full name"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline mr-2" size={16} />
                  Email Address
                </label>
                <p className="text-gray-900 py-2 bg-gray-50 px-3 rounded">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline mr-2" size={16} />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="+639XXXXXXXXX"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user.phone || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Role
                </label>
                <p className="text-gray-900 py-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-navy text-white">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Membership Status Card */}
        <div className="md:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-primary-navy mb-4 flex items-center gap-2">
              <Award size={20} />
              Membership
            </h2>

            {user.isMember ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-accent-orange to-yellow-500 text-white p-4 rounded-lg">
                  <p className="text-sm font-medium mb-1">Active Member</p>
                  <p className="text-2xl font-bold">{user.membershipDiscount}% OFF</p>
                  <p className="text-xs mt-2 opacity-90">On all bookings</p>
                </div>

                {user.membershipExpiryDate && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Expires:</p>
                    <p>{new Date(user.membershipExpiryDate).toLocaleDateString()}</p>
                  </div>
                )}

                <button
                  onClick={() => setShowMembershipModal(true)}
                  className="btn-secondary w-full"
                >
                  Upgrade Plan
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  You're not a member yet. Upgrade to enjoy exclusive discounts on all bookings!
                </p>
                <button
                  onClick={() => setShowMembershipModal(true)}
                  className="btn-primary w-full"
                >
                  Become a Member
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Membership Plans Modal */}
      {showMembershipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary-navy">Choose Your Membership Plan</h2>
                <button
                  onClick={() => setShowMembershipModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {membershipPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="card p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-accent-orange"
                  >
                    <h3 className="text-xl font-bold text-primary-navy mb-2">{plan.plan_name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-accent-orange">₱{plan.price}</span>
                      <span className="text-gray-600">/{plan.duration_type}</span>
                    </div>
                    <div className="mb-4">
                      <span className="inline-block bg-success bg-opacity-20 text-success px-3 py-1 rounded-full text-sm font-medium">
                        {plan.discount_percentage}% Discount
                      </span>
                    </div>
                    <div className="mb-6 text-sm text-gray-600">
                      <p className="whitespace-pre-line">{plan.benefits}</p>
                    </div>
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing || (user.membershipPlanId === plan.id)}
                      className={`w-full ${
                        user.membershipPlanId === plan.id
                          ? 'btn-secondary cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      {subscribing ? 'Processing...' :
                       user.membershipPlanId === plan.id ? 'Current Plan' : 'Subscribe'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
