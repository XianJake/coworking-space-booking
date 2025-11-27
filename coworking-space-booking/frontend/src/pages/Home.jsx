import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { spaceAPI } from '../utils/api';
import { ArrowRight, Users, Clock, Shield, Wifi } from 'lucide-react';

const Home = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const response = await spaceAPI.getAllSpaces();
      setSpaces(response.data.slice(0, 4)); // Show only 4 on homepage
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-navy via-blue-900 to-primary-navy text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Perfect Workspace<br />Awaits
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto">
            Book flexible workspaces by the hour, day, or month.<br />
            Work your way, on your schedule.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/spaces" className="btn-primary text-lg inline-flex items-center justify-center gap-2">
              Browse Spaces
              <ArrowRight size={20} />
            </Link>
            <Link to="/membership" className="btn-secondary bg-white text-primary-navy text-lg">
              View Membership Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-orange bg-opacity-10 rounded-full mb-4">
                <Clock className="text-accent-orange" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">Starting at ₱45/hour</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-orange bg-opacity-10 rounded-full mb-4">
                <Wifi className="text-accent-orange" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">High-Speed WiFi</h3>
              <p className="text-gray-600">Ultra-fast internet for your work</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-orange bg-opacity-10 rounded-full mb-4">
                <Users className="text-accent-orange" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community</h3>
              <p className="text-gray-600">Network with professionals</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-orange bg-opacity-10 rounded-full mb-4">
                <Shield className="text-accent-orange" size={32} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure & Clean</h3>
              <p className="text-gray-600">Safe and sanitized spaces</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-16 bg-gray-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="order-2 md:order-1">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"
                  alt="Modern coworking space"
                  className="rounded-lg shadow-2xl w-full h-[400px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-accent-orange text-white p-6 rounded-lg shadow-xl">
                  <p className="text-4xl font-bold">₱45</p>
                  <p className="text-sm">per hour</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-navy mb-6">
                About CommunSide
              </h2>
              <p className="text-gray-600 text-lg mb-4">
                Welcome to CommunSide, your premier coworking space solution designed for modern professionals,
                freelancers, and teams who value flexibility and community.
              </p>
              <p className="text-gray-600 text-lg mb-6">
                We believe that great work happens in great spaces. That's why we've created comfortable,
                fully-equipped workspaces that foster productivity and collaboration. Whether you need a quiet
                spot for focused work or a vibrant environment to network and grow, we've got you covered.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700"><strong>Flexible Plans:</strong> Hourly (₱45), Half-day (₱160), Full-day (₱300), Weekly, and Monthly options</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700"><strong>Premium Amenities:</strong> High-speed WiFi, printing, meeting rooms, and complimentary coffee</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-accent-orange rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700"><strong>Member Benefits:</strong> Get 10-20% discounts on all bookings with our membership plans</p>
                </div>
              </div>
              <div className="mt-8">
                <Link to="/spaces" className="btn-primary inline-flex items-center gap-2">
                  Explore Our Spaces
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Preview Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Workspace Options</h2>
            <p className="section-subtitle">Choose the perfect space for your needs</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto"></div>
              <p className="mt-4 text-gray-dark">Loading spaces...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {spaces.map((space) => (
                <div key={space.id} className="card group">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={space.image_url}
                      alt={space.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-navy">
                      {space.total_capacity} seats
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary-navy mb-2">{space.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{space.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-accent-orange">
                          ₱{space.hourly_rate}
                        </p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                      {space.member_discount_percent > 0 && (
                        <div className="bg-success bg-opacity-10 text-success px-2 py-1 rounded text-xs font-semibold">
                          {space.member_discount_percent}% off for members
                        </div>
                      )}
                    </div>
                    <Link
                      to={`/spaces/${space.id}`}
                      className="btn-primary w-full text-center block"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/spaces" className="btn-secondary inline-flex items-center gap-2">
              View All Spaces
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Working?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Join hundreds of professionals who trust CommunSide for their workspace needs.
          </p>
          <Link to="/signup" className="btn-primary text-lg">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
