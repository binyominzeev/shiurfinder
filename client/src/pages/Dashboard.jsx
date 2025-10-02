import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ShiurCard from '../components/ShiurCard';
import RabbiCard from '../components/RabbiCard';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [recentShiurim, setRecentShiurim] = useState([]);
  const [suggestedRabbis, setSuggestedRabbis] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, shiurimRes, rabbisRes] = await Promise.all([
        axios.get('/api/user/profile'),
        axios.get('/api/shiurim'),
        axios.get('/api/rabbis')
      ]);

      setUserProfile(profileRes.data);
      setRecentShiurim(shiurimRes.data.slice(0, 6)); // Show 6 recent shiurim
      setSuggestedRabbis(rabbisRes.data.slice(0, 3)); // Show 3 suggested rabbis
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const hasPreferences = userProfile?.interests?.length > 0 || userProfile?.favorites?.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.username}!
        </h1>
        <p className="text-gray-600">
          Continue your Torah learning journey
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Discover Shiurim</h3>
          <p className="text-gray-600 text-sm mb-4">Find new Torah content tailored to your interests</p>
          <Link to="/discovery" className="btn-primary">
            Start Discovery
          </Link>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Your Favorites</h3>
          <p className="text-gray-600 text-sm mb-4">
            {userProfile?.favorites?.length || 0} saved favorites
          </p>
          <Link to="/favorites" className="btn-primary">
            View Favorites
          </Link>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Following</h3>
          <p className="text-gray-600 text-sm mb-4">
            {userProfile?.following?.length || 0} rabbis followed
          </p>
          <button className="btn-secondary">
            Manage
          </button>
        </div>
      </div>

      {!hasPreferences && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-blue-900">Get Started</h3>
              <p className="text-blue-700 mt-1">
                Complete your preferences to get personalized shiur recommendations
              </p>
              <div className="mt-4">
                <Link to="/discovery" className="btn-primary">
                  Set Up Preferences
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Shiurim */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Shiurim</h2>
          <Link to="/discovery" className="text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentShiurim.map(shiur => (
            <ShiurCard key={shiur._id} shiur={shiur} selectionMode="view" />
          ))}
        </div>
      </div>
  );
};

export default Dashboard;