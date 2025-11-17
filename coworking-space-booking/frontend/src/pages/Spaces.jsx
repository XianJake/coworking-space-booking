import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { spaceAPI } from '../utils/api';
import { Users } from 'lucide-react';

const Spaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await spaceAPI.getAllSpaces();
      setSpaces(response.data);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
          <p className="mt-4 text-gray-dark">Loading spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="section-title">All Workspaces</h1>
        <p className="section-subtitle">Find the perfect space for your work style</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {spaces.map((space) => (
          <div key={space.id} className="card group">
            <div className="relative h-56 overflow-hidden">
              <img
                src={space.image_url}
                alt={space.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full flex items-center gap-2">
                <Users size={16} className="text-primary-navy" />
                <span className="text-sm font-semibold text-primary-navy">
                  {space.total_capacity} seats
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold text-primary-navy mb-3">{space.name}</h3>
              <p className="text-gray-600 mb-4">{space.description}</p>
              
              <div className="bg-gray-light p-4 rounded-lg mb-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Hourly</span>
                  <span className="font-bold text-primary-navy">₱{space.hourly_rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Half Day (4hrs)</span>
                  <span className="font-bold text-primary-navy">₱{space.half_day_rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Full Day (8hrs)</span>
                  <span className="font-bold text-primary-navy">₱{space.full_day_rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Weekly</span>
                  <span className="font-bold text-primary-navy">₱{space.weekly_rate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly</span>
                  <span className="font-bold text-primary-navy">₱{space.monthly_rate}</span>
                </div>
              </div>

              {space.member_discount_percent > 0 && (
                <div className="bg-success bg-opacity-10 text-success px-3 py-2 rounded-lg text-sm font-semibold mb-4 text-center">
                  🎉 {space.member_discount_percent}% discount for members
                </div>
              )}
              
              <Link
                to={`/booking/${space.id}`}
                className="btn-primary w-full text-center block"
              >
                Book Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Spaces;
