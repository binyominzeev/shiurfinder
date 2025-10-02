import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ShiurCard from '../components/ShiurCard';
import ProgressIndicator from '../components/ProgressIndicator';

// Set your default parasha here
const DEFAULT_PARASHA = 'Haazinu';

const Discovery = () => {
  const [shiurim, setShiurim] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedFavorites, setSelectedFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Use DEFAULT_PARASHA as the initial value
  const [selectedParasha, setSelectedParasha] = useState(DEFAULT_PARASHA);
  const [parashot, setParashot] = useState([]);
  
  const navigate = useNavigate();

  const steps = [
    { number: 1, title: 'Select Interests', description: 'Choose 20-30 shiurim that interest you' },
    { number: 2, title: 'Choose Favorites', description: 'Pick your top 5-10 favorites' },
    { number: 3, title: 'Complete', description: 'Your preferences have been saved!' }
  ];

  useEffect(() => {
    fetchShiurim();
  }, []);

  const fetchShiurim = async () => {
    try {
      const response = await axios.get('/api/shiurim');
      setShiurim(response.data);

      // Extract unique parashot
      const uniqueParashot = Array.from(
        new Set(response.data.map(s => s.parasha).filter(Boolean))
      );
      setParashot(uniqueParashot);
    } catch (error) {
      console.error('Error fetching shiurim:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (shiurId) => {
    setSelectedInterests(prev => {
      if (prev.includes(shiurId)) {
        return prev.filter(id => id !== shiurId);
      } else if (prev.length < 30) {
        return [...prev, shiurId];
      }
      return prev;
    });
  };

  const handleFavoriteToggle = (shiurId) => {
    setSelectedFavorites(prev => {
      if (prev.includes(shiurId)) {
        return prev.filter(id => id !== shiurId);
      } else if (prev.length < 10) {
        return [...prev, shiurId];
      }
      return prev;
    });
  };

  const canProceedToStep2 = selectedInterests.length >= 20 && selectedInterests.length <= 30;
  const canCompleteStep2 = selectedFavorites.length >= 5 && selectedFavorites.length <= 10;

  const handleNextStep = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canCompleteStep2) {
      savePreferences();
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await axios.post('/api/user/interests', { shiurIds: selectedInterests });
      await axios.post('/api/user/favorites', { shiurIds: selectedFavorites });
      setCurrentStep(3);
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getFilteredShiurim = () => {
    let filtered = shiurim;
    if (selectedParasha !== 'All') {
      filtered = filtered.filter(shiur => shiur.parasha === selectedParasha);
    }
    if (currentStep === 1) {
      return filtered;
    } else if (currentStep === 2) {
      return filtered.filter(shiur => selectedInterests.includes(shiur._id));
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Torah Shiurim</h1>
        <p className="text-gray-600">Help us personalize your learning experience</p>
      </div>

      {/* Parasha Chooser */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Filter by Parasha:</label>
        <select
          className="border rounded px-3 py-2"
          value={selectedParasha}
          onChange={e => setSelectedParasha(e.target.value)}
        >
          <option value="All">All Parashot</option>
          {parashot.map(parasha => (
            <option key={parasha} value={parasha}>{parasha}</option>
          ))}
        </select>
      </div>

      <div className="py-4 border-b mb-8">
        <ProgressIndicator steps={steps} currentStep={currentStep} />
      </div>

      {currentStep === 1 && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Step 1: Select Your Interests</h2>
            <p className="text-gray-600 mb-4">
              Browse through our shiurim and select 20-30 that interest you. 
              Selected: {selectedInterests.length}/30
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sticky top-0 z-20" style={{background: '#eff6ff'}}>
            <div className="flex justify-between items-center">
              <span className="text-blue-800">
                Progress: {selectedInterests.length} selected (need 20-30)
              </span>
              {canProceedToStep2 && (
                <button 
                  onClick={handleNextStep}
                  className="btn-primary"
                >
                  Next: Choose Favorites →
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {getFilteredShiurim().map(shiur => (
              <ShiurCard
                key={shiur._id}
                shiur={shiur}
                isSelected={selectedInterests.includes(shiur._id)}
                onToggle={() => handleInterestToggle(shiur._id)}
                selectionMode="interest"
              />
            ))}
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Step 2: Choose Your Favorites</h2>
            <p className="text-gray-600 mb-4">
              From your interests, select 5-10 as your top favorites. 
              Selected: {selectedFavorites.length}/10
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sticky top-0 z-20" style={{background: '#ecfdf5'}}>
            <div className="flex justify-between items-center">
              <span className="text-green-800">
                Progress: {selectedFavorites.length} favorites (need 5-10)
              </span>
              {canCompleteStep2 && (
                <button 
                  onClick={handleNextStep}
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Complete Setup →'}
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {getFilteredShiurim().map(shiur => (
              <ShiurCard
                key={shiur._id}
                shiur={shiur}
                isSelected={selectedFavorites.includes(shiur._id)}
                onToggle={() => handleFavoriteToggle(shiur._id)}
                selectionMode="favorite"
              />
            ))}
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete!</h2>
            <p className="text-gray-600">
              Your preferences have been saved. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discovery;