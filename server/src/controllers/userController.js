// filepath: /server/src/controllers/userController.js
const User = require('../models/User');
const Shiur = require('../models/Shiur');
const { extractMp3Url, extractDuration, formatDuration } = require('../utils/rssUtils');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('interests')
      .populate('favorites')
      .populate('following')
      .populate('shiurNotes.shiurId')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserInterests = async (req, res) => {
  try {
    const { shiurIds } = req.body;

    await User.findByIdAndUpdate(req.user.userId, { interests: shiurIds });

    res.json({ message: 'Interests updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserFavorites = async (req, res) => {
  try {
    const { shiurIds } = req.body;

    await User.findByIdAndUpdate(req.user.userId, { favorites: shiurIds });

    res.json({ message: 'Favorites updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserFavoritesRss = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('favorites');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const items = await Promise.all(user.favorites.map(async (shiur) => {
      const fetchedData = await axios.get(shiur.url);
      const mp3Url = extractMp3Url(fetchedData.data);
      const duration = extractDuration(fetchedData.data);

      return {
        title: shiur.title,
        description: `Rabbi: ${shiur.rabbi.name}`,
        mp3_url: mp3Url,
        duration: formatDuration(duration),
        guid: shiur._id,
        pubDate: new Date().toUTCString(),
      };
    }));

    const rssFeed = generateRssFeed(items);
    res.set('Content-Type', 'application/rss+xml');
    res.send(rssFeed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateRssFeed = (items) => {
  const itemsXml = items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <enclosure url="${item.mp3_url}" type="audio/mpeg" />
      <guid>${item.guid}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <itunes:duration>${item.duration}</itunes:duration>
    </item>
  `).join('');

  return `
    <rss version="2.0">
      <channel>
        <title>User Favorites</title>
        <link>https://example.com</link>
        <description>User-specific RSS feed for favorites</description>
        <language>en-us</language>
        ${itemsXml}
      </channel>
    </rss>
  `;
};

module.exports = {
  getUserProfile,
  updateUserInterests,
  updateUserFavorites,
  getUserFavoritesRss,
};