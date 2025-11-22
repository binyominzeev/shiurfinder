const axios = require('axios');
const Shiur = require('../models/Shiur');
const User = require('../models/User');

// Define formatDuration here
function formatDuration(duration) {
  // Example: convert seconds to HH:MM:SS
  if (!duration) return '';
  const sec = parseInt(duration, 10);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s]
    .map(v => v < 10 ? '0' + v : v)
    .join(':');
}

const extractMp3Url = (str) => {
  const match = str.match(/\\"mp3_url\\":\\"([^"]+)\\"/);
  return match ? match[1] : null;
};

const extractDuration = (str) => {
  const match = str.match(/\\"duration\\":([^,]+),/);
  return match ? match[1] : null;
};

const generateUserRssFeed = async (username) => {
  const user = await User.findOne({ username }).populate('favorites');
  if (!user) return null;

  const items = await Promise.all(user.favorites.map(async (shiur) => {
    let mp3Url = null;
    let duration = null;
    let fetchedData = null;

    if (shiur.url) {
      try {
        const resp = await axios.get(shiur.url);
        fetchedData = resp.data;
        mp3Url = extractMp3Url(fetchedData);
        duration = extractDuration(fetchedData);
      } catch (e) {
        mp3Url = null;
      }
    }

    return {
      title: shiur.title,
      mp3_url: mp3Url,
      duration: formatDuration(duration),
      guid: shiur._id,
      pubDate: new Date().toUTCString(),
    };
  }));

  return items.filter(item => item.mp3_url);
};

module.exports = {
  generateUserRssFeed,
  formatDuration, // Export if needed elsewhere
};