import React, { useEffect, useState } from 'react';
import { membershipAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Star } from 'lucide-react';

const Membership = () => {
  const { user, updateUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await membershipAPI.getAllPlans();
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      alert('Please login to subscribe');
      return;
    }

    setSubscribing(planId);
    try {
      await membershipAPI.subscribe({
        planId,
        paymentMethod: 'gcash' // Default, can be made dynamic
      });
      
      // Update user state
      const updatedUser = { ...user, isMember: true };
      updateUser(updatedUser);
      
      alert('Successfully subscribed to membership!');
    } catch (error) {
      console.error('Error subscribing:', error);
      alert(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
          <p className="mt-4 text-gray-dark">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-light py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title">Membership Plans</h1>
          <p className="section-subtitle">
            Save more with exclusive member discounts and benefits
          </p>
          
          {user?.isMember && (
            <div className="inline-flex items-center gap-2 bg-success bg-opacity-10 text-success px-4 py-2 rounded-full font-semibold">
              <Star size={18} />
              You are currently a member!
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.id}
              className={`card overflow-hidden ${
                index === 1 ? 'ring-2 ring-accent-orange transform md:scale-105' : ''
              }`}
            >
              {index === 1 && (
                <div className="bg-accent-orange text-white text-center py-2 text-sm font-semibold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-primary-navy mb-2">
                  {plan.plan_name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-accent-orange">
                    ₱{plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.duration_type}</span>
                </div>

                <div className="mb-6">
                  <div className="inline-flex items-center bg-success bg-opacity-10 text-success px-3 py-1 rounded-full text-sm font-semibold">
                    Save {plan.discount_percentage}% on all bookings
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.benefits?.split(',').map((benefit, idx) => (
                    <div key={idx} className="flex items-start">
                      <CheckCircle size={18} className="text-success mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{benefit.trim()}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id || (user?.isMember && !subscribing)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    index === 1
                      ? 'bg-accent-orange text-white hover:bg-opacity-90'
                      : 'bg-primary-navy text-white hover:bg-opacity-90'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {subscribing === plan.id
                    ? 'Processing...'
                    : user?.isMember
                    ? 'Current Plan'
                    : 'Subscribe Now'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8">
          <h3 className="text-2xl font-bold text-primary-navy mb-4">Why Become a Member?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-primary-navy mb-2">💰 Cost Savings</h4>
              <p className="text-sm text-gray-600">
                Get up to 20% discount on all bookings. Save hundreds monthly!
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-navy mb-2">⚡ Priority Access</h4>
              <p className="text-sm text-gray-600">
                Book your favorite spaces first before non-members.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-navy mb-2">🎯 Exclusive Perks</h4>
              <p className="text-sm text-gray-600">
                Access member-only events and networking opportunities.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary-navy mb-2">📊 Dedicated Support</h4>
              <p className="text-sm text-gray-600">
                Get priority customer service and account management.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
