// filepath: /server/src/controllers/userController.js
const User = require('../models/User');
const Shiur = require('../models/Shiur');
const Rabbi = require('../models/Rabbi');
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

// Add a note to a shiur
const addShiurNote = async (req, res) => {
  try {
    const { shiurId, note } = req.body;
    if (!shiurId) return res.status(400).json({ message: 'Shiur ID is required' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existingNoteIndex = user.shiurNotes.findIndex(n => n.shiurId.toString() === shiurId);

    if (existingNoteIndex > -1) {
      if (note && note.trim()) {
        user.shiurNotes[existingNoteIndex].note = note.trim();
        user.shiurNotes[existingNoteIndex].updatedAt = new Date();
      } else {
        user.shiurNotes.splice(existingNoteIndex, 1);
      }
    } else {
      if (note && note.trim()) {
        user.shiurNotes.push({
          shiurId,
          note: note.trim()
        });
      }
    }

    await user.save();
    res.json({ message: 'Note saved successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a favorite shiur
const removeFavorite = async (req, res) => {
  try {
    const { shiurId } = req.params;
    if (!shiurId) return res.status(400).json({ message: 'shiurId is required' });

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.favorites = user.favorites.filter(fav => fav.toString() !== shiurId);
    await user.save();

    res.json({ message: 'Shiur removed from favorites successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bulk update favorites
const bulkUpdateFavorites = async (req, res) => {
  try {
    const { shiurIds } = req.body;
    await User.findByIdAndUpdate(req.user.userId, { favorites: shiurIds });
    res.json({ message: 'Favorites updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Follow a rabbi
const followRabbi = async (req, res) => {
  try {
    const { rabbiId } = req.body;
    if (!rabbiId) return res.status(400).json({ message: 'rabbiId required' });

    const user = await User.findById(req.user.userId);
    if (!user.following.includes(rabbiId)) {
      user.following.push(rabbiId);
      await user.save();
      await Rabbi.findByIdAndUpdate(rabbiId, { $inc: { followers: 1 } });
    }
    res.json({ message: 'Following rabbi successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a rabbi
const unfollowRabbi = async (req, res) => {
  try {
    const { rabbiId } = req.body;
    if (!rabbiId) return res.status(400).json({ message: 'rabbiId required' });

    const user = await User.findById(req.user.userId);
    user.following = user.following.filter(id => id.toString() !== rabbiId);
    await user.save();
    await Rabbi.findByIdAndUpdate(rabbiId, { $inc: { followers: -1 } });

    res.json({ message: 'Unfollowed rabbi successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's favorites filtered by parasha
const getUserFavoritesByParasha = async (req, res) => {
  try {
    const { parasha } = req.query;
    if (!parasha) return res.status(400).json({ message: 'Parasha is required' });

    const user = await User.findById(req.user.userId).select('favorites');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const shiurim = await Shiur.find({ _id: { $in: user.favorites }, parasha });
    res.json(shiurim);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserInterests,
  updateUserFavorites,
  getUserFavoritesRss,
  addShiurNote,
  removeFavorite,
  bulkUpdateFavorites,
  followRabbi,
  unfollowRabbi,
  getUserFavoritesByParasha,
};