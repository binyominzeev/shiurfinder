import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ShiurCard from '../components/ShiurCard';

const Favorites = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullShiurim, setFullShiurim] = useState({}); // id -> full shiur object

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchFullShiurim();
    }
    // eslint-disable-next-line
  }, [userProfile]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/user/profile');
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full shiur objects for all favorites and interests
  const fetchFullShiurim = async () => {
    const favIds = userProfile?.favorites?.map(s => s._id || s) || [];
    const intIds = userProfile?.interests?.map(s => s._id || s) || [];
    const allIds = Array.from(new Set([...favIds, ...intIds]));
    if (allIds.length === 0) return;

    try {
      const response = await axios.get('/api/shiurim', {
        params: { ids: allIds.join(',') }
      });
      // Assume response.data is an array of shiur objects
      const shiurMap = {};
      response.data.forEach(shiur => {
        shiurMap[shiur._id] = shiur;
      });
      setFullShiurim(shiurMap);
    } catch (error) {
      console.error('Error fetching full shiurim:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const favorites = (userProfile?.favorites || []).map(s => fullShiurim[s._id || s] || s);
  const interests = (userProfile?.interests || []).map(s => fullShiurim[s._id || s] || s);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Favorites</h1>
        <p className="text-gray-600">
          Your carefully curated collection of Torah shiurim
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">
            {favorites.length}
          </div>
          <div className="text-gray-600">Favorite Shiurim</div>
        </div>
        <div className="card p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {interests.length}
          </div>
          <div className="text-gray-600">Interested Shiurim</div>
        </div>
        <div className="card p-6 text-center hover:bg-gray-50 cursor-pointer transition">
          <Link to="/following" className="block">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {userProfile?.following?.length || 0}
            </div>
            <div className="text-gray-600">Rabbis Following</div>
          </Link>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 ? (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Your Top Picks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(shiur => (
              <ShiurCard key={shiur._id} shiur={shiur} selectionMode="view" showRabbi={true} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6">
            Start exploring shiurim and mark your favorites to see them here
          </p>
          <a href="/discovery" className="btn-primary">
            Discover Shiurim
          </a>
        </div>
      )}

      {/* Interests Section */}
      {interests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Your Interests ({interests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interests.filter(shiur => !favorites.some(fav => fav._id === shiur._id)).map(shiur => (
              <ShiurCard key={shiur._id} shiur={shiur} selectionMode="view" showRabbi={true} />
            ))}
          </div>
        </div>
      )}

      {/* Following Section */}
      {userProfile?.following?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Rabbis You Follow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userProfile.following.map(rabbi => (
              <div key={rabbi._id} className="card p-6 text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-lg font-bold text-gray-600">
                    {rabbi.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {rabbi.name}
                </h3>
                {rabbi.bio && (
                  <p className="text-gray-600 text-sm">
                    {rabbi.bio}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;