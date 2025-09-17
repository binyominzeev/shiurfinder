import React, { useState } from 'react';
import axios from 'axios';

const RabbiCard = ({ rabbi, isFollowing: initialIsFollowing = false }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      await axios.post(`/api/user/follow/${rabbi._id}`);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following rabbi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 text-center">
      <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-xl font-bold text-gray-600">
          {rabbi.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {rabbi.name}
      </h3>
      
      {rabbi.bio && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {rabbi.bio}
        </p>
      )}
      
      <div className="text-sm text-gray-500 mb-4">
        {rabbi.followers} {rabbi.followers === 1 ? 'follower' : 'followers'}
      </div>
      
      <button
        onClick={handleFollow}
        disabled={loading || isFollowing}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isFollowing 
            ? 'bg-gray-100 text-gray-600 cursor-default' 
            : 'bg-primary-500 hover:bg-primary-600 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? 'Following...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default RabbiCard;