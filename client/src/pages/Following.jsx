import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ShiurCard from '../components/ShiurCard';

const Following = () => {
  const [rabbis, setRabbis] = useState([]);
  const [shiurim, setShiurim] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      const profileRes = await axios.get('/api/user/profile');
      const followedRabbis = profileRes.data.following || [];
      setRabbis(followedRabbis);

      // Get all shiurim for these rabbis
      const rabbiIds = followedRabbis.map(r => r._id);
      if (rabbiIds.length > 0) {
        const shiurRes = await axios.get('/api/shiurim', {
          params: { rabbi: rabbiIds.join(',') }
        });
        setShiurim(shiurRes.data);
      }
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (rabbiId) => {
    try {
      await axios.post('/api/user/unfollow', { rabbiId });
      setRabbis(rabbis.filter(r => r._id !== rabbiId));
      setShiurim(shiurim.filter(s => s.rabbi._id !== rabbiId));
    } catch (err) {
      // handle error
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Rabbis You Follow</h1>
      {rabbis.length === 0 ? (
        <div className="text-gray-600">You are not following any rabbis yet.</div>
      ) : (
        rabbis.map(rabbi => (
          <div key={rabbi._id} className="mb-10">
            <div className="flex items-center mb-2">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-lg font-bold text-gray-600">
                  {rabbi.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <div className="font-semibold text-lg">{rabbi.name}</div>
                {rabbi.bio && <div className="text-gray-600 text-sm">{rabbi.bio}</div>}
              </div>
              <button
                className="ml-4 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                onClick={() => handleUnfollow(rabbi._id)}
              >
                Unfollow
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {shiurim.filter(s => s.rabbi._id === rabbi._id).map(shiur => (
                <ShiurCard key={shiur._id} shiur={shiur} showRabbi={false} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Following;