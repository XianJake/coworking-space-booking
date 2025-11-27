import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { spaceAPI } from '../utils/api';
import { Users, Clock, MapPin, Wifi, Coffee, Shield } from 'lucide-react';

const SpaceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [space, setSpace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Base pricing calculation
  const HOURLY_RATE = 45;
  const rates = {
    hourly: HOURLY_RATE,
    halfDay: HOURLY_RATE * 4,      // 4 hours = ₱180
    fullDay: HOURLY_RATE * 8,      // 8 hours = ₱360
    weekly: HOURLY_RATE * 8 * 5,   // 5 days × 8 hours = ₱1,800
    monthly: HOURLY_RATE * 8 * 20  // 20 days × 8 hours = ₱7,200
  };

  useEffect(() => {
    fetchSpace();
  }, [id]);

  const fetchSpace = async () => {
    try {
      const response = await spaceAPI.getSpaceById(id);
      setSpace(response.data);
    } catch (error) {
      console.error('Error fetching space:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Space not found</h2>
          <button onClick={() => navigate('/spaces')} className="btn-primary">
            Browse All Spaces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div>
          <img
            src={space.image_url}
            alt={space.name}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-primary-navy mb-4">{space.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{space.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-gray-light p-4 rounded-lg">
              <Users className="text-accent-orange" size={24} />
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="font-bold text-primary-navy">{space.total_capacity} Seats</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-gray-light p-4 rounded-lg">
              <Clock className="text-accent-orange" size={24} />
              <div>
                <p className="text-sm text-gray-600">Flexible Hours</p>
                <p className="font-bold text-primary-navy">24/7 Access</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <h3 className="text-xl font-bold text-primary-navy mb-4">Pricing</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Hourly</span>
                <span className="font-bold text-accent-orange">₱{rates.hourly}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Half Day (4 hours)</span>
                <span className="font-bold">₱{rates.halfDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Full Day (8 hours)</span>
                <span className="font-bold">₱{rates.fullDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly (5 days)</span>
                <span className="font-bold">₱{rates.weekly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly (20 days)</span>
                <span className="font-bold">₱{rates.monthly.toLocaleString()}</span>
              </div>
            </div>

            {space.member_discount_percent > 0 && (
              <div className="mt-4 bg-success bg-opacity-10 text-success p-3 rounded-lg text-center font-semibold">
                Members save {space.member_discount_percent}%!
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(`/booking/${space.id}`)}
            className="btn-primary w-full text-lg"
          >
            Book This Space
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md">
        <h3 className="text-2xl font-bold text-primary-navy mb-6">Amenities & Features</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-center gap-3">
            <Wifi className="text-accent-orange" size={24} />
            <span>High-Speed WiFi</span>
          </div>
          <div className="flex items-center gap-3">
            <Coffee className="text-accent-orange" size={24} />
            <span>Free Coffee & Tea</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="text-accent-orange" size={24} />
            <span>Secure Access</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="text-accent-orange" size={24} />
            <span>Prime Location</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="text-accent-orange" size={24} />
            <span>24/7 Access</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="text-accent-orange" size={24} />
            <span>Meeting Rooms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetails;
