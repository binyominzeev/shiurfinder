// Admin CSV upload dependencies (must be after app is defined)
const multer = require('multer');
const csv = require('csv-parse');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const axios = require('axios');
const FTP = require('ftp');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (using local MongoDB for development)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shiurfinder';

let isMongoConnected = false;

mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB');
    isMongoConnected = true;
  })
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    console.log('Running in mock mode without MongoDB');
    isMongoConnected = false;
  });

// Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shiur' }],
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shiur' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rabbi' }],
  createdAt: { type: Date, default: Date.now }
});

const rabbiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: String,
  image: String,
  followers: { type: Number, default: 0 }
});

const shiurSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  rabbi: { type: mongoose.Schema.Types.ObjectId, ref: 'Rabbi', required: true },
  url: { type: String, required: true },
  duration: String,
  topic: String,
  parasha: { type: String }, // Added for weekly parasha link
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Add to userSchema for password reset
userSchema.add({
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

const User = mongoose.model('User', userSchema);
const Rabbi = mongoose.model('Rabbi', rabbiSchema);
const Shiur = mongoose.model('Shiur', shiurSchema);

// Mock data storage for when MongoDB is not available
let mockUsers = [];
let mockRabbis = [];
let mockShiurim = [];
let mockUserCounter = 1;

const createMockUser = (userData) => {
  const user = {
    _id: `user_${mockUserCounter++}`,
    ...userData,
    interests: userData.interests || [],
    favorites: userData.favorites || [],
    following: userData.following || [],
    createdAt: new Date()
  };
  mockUsers.push(user);
  return user;
};

const findMockUser = (query) => {
  if (query._id) return mockUsers.find(u => u._id === query._id);
  if (query.email) return mockUsers.find(u => u.email === query.email);
  if (query.$or) {
    return mockUsers.find(u => 
      query.$or.some(condition => 
        (condition.email && u.email === condition.email) ||
        (condition.username && u.username === condition.username)
      )
    );
  }
  return null;
};

const updateMockUser = (id, updates) => {
  const userIndex = mockUsers.findIndex(u => u._id === id);
  if (userIndex !== -1) {
    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
    return mockUsers[userIndex];
  }
  return null;
};

// Mock data initialization
const initializeMockData = async () => {
  try {
    if (isMongoConnected) {
      const rabbiCount = await Rabbi.countDocuments();
      if (rabbiCount === 0) {
        console.log('Initializing MongoDB with mock data...');
        
        // Create mock rabbis
        const mockRabbisData = await Rabbi.insertMany([
          { name: 'Rabbi David Miller', bio: 'Expert in Talmud and Jewish Philosophy', image: '/api/placeholder/150/150' },
          { name: 'Rabbi Sarah Cohen', bio: 'Specialist in Halacha and Modern Jewish Thought', image: '/api/placeholder/150/150' },
          { name: 'Rabbi Michael Goldstein', bio: 'Torah scholar and community leader', image: '/api/placeholder/150/150' },
          { name: 'Rabbi Rachel Green', bio: 'Expert in Jewish history and ethics', image: '/api/placeholder/150/150' },
          { name: 'Rabbi Jonathan Silver', bio: 'Kabbalah and mysticism teacher', image: '/api/placeholder/150/150' }
        ]);

        // Create mock shiurim
        const topics = ['Talmud', 'Halacha', 'Torah', 'Jewish Philosophy', 'Kabbalah', 'Jewish History', 'Ethics'];
        const levels = ['Beginner', 'Intermediate', 'Advanced'];
        
        const mockShiurimData = [];
        for (let i = 0; i < 50; i++) {
          mockShiurimData.push({
            title: `Shiur ${i + 1}: ${topics[Math.floor(Math.random() * topics.length)]} Insights`,
            description: `A comprehensive exploration of ${topics[Math.floor(Math.random() * topics.length)].toLowerCase()} concepts and their practical applications.`,
            rabbi: mockRabbisData[Math.floor(Math.random() * mockRabbisData.length)]._id,
            url: `https://example.com/shiur-${i + 1}`,
            duration: `${Math.floor(Math.random() * 60) + 15} minutes`,
            topic: topics[Math.floor(Math.random() * topics.length)],
            level: levels[Math.floor(Math.random() * levels.length)],
            views: Math.floor(Math.random() * 1000)
          });
        }
        
        await Shiur.insertMany(mockShiurimData);
        console.log('MongoDB mock data initialized successfully');
      }
    } else {
      console.log('Initializing in-memory mock data...');
      
      // Create mock rabbis for in-memory storage
      mockRabbis = [
        { _id: 'rabbi_1', name: 'Rabbi David Miller', bio: 'Expert in Talmud and Jewish Philosophy', image: '/api/placeholder/150/150', followers: 0 },
        { _id: 'rabbi_2', name: 'Rabbi Sarah Cohen', bio: 'Specialist in Halacha and Modern Jewish Thought', image: '/api/placeholder/150/150', followers: 0 },
        { _id: 'rabbi_3', name: 'Rabbi Michael Goldstein', bio: 'Torah scholar and community leader', image: '/api/placeholder/150/150', followers: 0 },
        { _id: 'rabbi_4', name: 'Rabbi Rachel Green', bio: 'Expert in Jewish history and ethics', image: '/api/placeholder/150/150', followers: 0 },
        { _id: 'rabbi_5', name: 'Rabbi Jonathan Silver', bio: 'Kabbalah and mysticism teacher', image: '/api/placeholder/150/150', followers: 0 }
      ];

      // Create mock shiurim for in-memory storage
      const topics = ['Talmud', 'Halacha', 'Torah', 'Jewish Philosophy', 'Kabbalah', 'Jewish History', 'Ethics'];
      const levels = ['Beginner', 'Intermediate', 'Advanced'];
      
      for (let i = 0; i < 50; i++) {
        mockShiurim.push({
          _id: `shiur_${i + 1}`,
          title: `Shiur ${i + 1}: ${topics[Math.floor(Math.random() * topics.length)]} Insights`,
          description: `A comprehensive exploration of ${topics[Math.floor(Math.random() * topics.length)].toLowerCase()} concepts and their practical applications.`,
          rabbi: mockRabbis[Math.floor(Math.random() * mockRabbis.length)],
          url: `https://example.com/shiur-${i + 1}`,
          duration: `${Math.floor(Math.random() * 60) + 15} minutes`,
          topic: topics[Math.floor(Math.random() * topics.length)],
          level: levels[Math.floor(Math.random() * levels.length)],
          views: Math.floor(Math.random() * 1000),
          createdAt: new Date()
        });
      }
      
      console.log('In-memory mock data initialized successfully');
    }
  } catch (error) {
    console.log('Error initializing mock data:', error.message);
  }
};

// Initialize mock data after a short delay
setTimeout(initializeMockData, 1000);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.sendStatus(401);
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Auth routes
// Admin: Upload CSV of shiurim for a parasha
app.post('/api/admin/upload-shiurim', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    // Only allow admin (add your own admin check here)
    // Example: if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const parasha = req.body.parasha;
    if (!parasha) return res.status(400).json({ message: 'Parasha name required' });
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });

    const filePath = req.file.path;
    const records = [];
    const parser = fs.createReadStream(filePath).pipe(csv.parse({ columns: true, trim: true }));

    for await (const row of parser) {
      // Expecting columns: author (rabbi), title, link
      const rabbiName = row.author || row.rabbi;
      const title = row.title;
      const url = row.link;
      if (!rabbiName || !title || !url) continue;

      // Find or create rabbi
      let rabbiDoc = await Rabbi.findOne({ name: rabbiName });
      if (!rabbiDoc) {
        rabbiDoc = new Rabbi({ name: rabbiName });
        await rabbiDoc.save();
      }

      // Prepare shiur
      records.push({
        title,
        rabbi: rabbiDoc._id,
        url,
        parasha,
      });
    }

    // Bulk insert
    if (records.length > 0) await Shiur.insertMany(records);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({ message: `Imported ${records.length} shiurim for parasha ${parasha}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    let existingUser;
    if (isMongoConnected) {
      existingUser = await User.findOne({ $or: [{ email }, { username }] });
    } else {
      existingUser = findMockUser({ $or: [{ email }, { username }] });
    }
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    let user;
    if (isMongoConnected) {
      user = new User({ username, email, password: hashedPassword });
      await user.save();
    } else {
      user = createMockUser({ username, email, password: hashedPassword });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    res.status(201).json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('[LOGIN] Attempt:', email);

    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = findMockUser({ email });
    }
    console.log('[LOGIN] User found:', !!user);

    if (!user) {
      console.log('[LOGIN] No user found for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password match:', passwordMatch);

    if (!passwordMatch) {
      console.log('[LOGIN] Password mismatch for:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'fallback-secret');
    console.log('[LOGIN] Success for:', email);
    res.json({ 
      token, 
      user: { id: user._id, username: user.username, email: user.email } 
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Shiur routes
app.get('/api/shiurim', async (req, res) => {
  try {
    let shiurim;
    if (isMongoConnected) {
      shiurim = await Shiur.find().populate('rabbi').sort({ createdAt: -1 });
    } else {
      shiurim = mockShiurim.map(shiur => ({ ...shiur })); // Copy the mock data
    }
    
    // Shuffle the array for discovery
    const shuffled = shiurim.sort(() => 0.5 - Math.random());
    
    res.json(shuffled);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/shiurim/:id', async (req, res) => {
  try {
    let shiur;
    if (isMongoConnected) {
      shiur = await Shiur.findById(req.params.id).populate('rabbi');
    } else {
      shiur = mockShiurim.find(s => s._id === req.params.id);
    }
    
    if (!shiur) {
      return res.status(404).json({ message: 'Shiur not found' });
    }
    res.json(shiur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User preference routes
app.post('/api/user/interests', authenticateToken, async (req, res) => {
  try {
    const { shiurIds } = req.body;
    
    if (isMongoConnected) {
      await User.findByIdAndUpdate(req.user.userId, { interests: shiurIds });
    } else {
      updateMockUser(req.user.userId, { interests: shiurIds });
    }
    
    res.json({ message: 'Interests updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/user/favorites', authenticateToken, async (req, res) => {
  try {
    const { shiurIds } = req.body;
    
    if (isMongoConnected) {
      await User.findByIdAndUpdate(req.user.userId, { favorites: shiurIds });
    } else {
      updateMockUser(req.user.userId, { favorites: shiurIds });
    }
    
    res.json({ message: 'Favorites updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    let user;
    if (isMongoConnected) {
      user = await User.findById(req.user.userId)
        .populate('interests')
        .populate('favorites')
        .populate('following')
        .select('-password');
    } else {
      user = findMockUser({ _id: req.user.userId });
      if (user) {
        // Populate interests and favorites with actual shiur data
        const interests = user.interests.map(id => mockShiurim.find(s => s._id === id)).filter(Boolean);
        const favorites = user.favorites.map(id => mockShiurim.find(s => s._id === id)).filter(Boolean);
        const following = user.following.map(id => mockRabbis.find(r => r._id === id)).filter(Boolean);
        
        user = { ...user, interests, favorites, following };
        delete user.password;
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rabbi routes
app.get('/api/rabbis', async (req, res) => {
  try {
    let rabbis;
    if (isMongoConnected) {
      rabbis = await Rabbi.find();
    } else {
      rabbis = mockRabbis.map(rabbi => ({ ...rabbi }));
    }
    res.json(rabbis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/user/follow', authenticateToken, async (req, res) => {
  try {
    const { rabbiId } = req.body;
    if (!rabbiId) return res.status(400).json({ message: 'rabbiId required' });

    if (isMongoConnected) {
      const user = await User.findById(req.user.userId);
      if (!user.following.includes(rabbiId)) {
        user.following.push(rabbiId);
        await user.save();
        await Rabbi.findByIdAndUpdate(rabbiId, { $inc: { followers: 1 } });
      }
    } else {
      const user = findMockUser({ _id: req.user.userId });
      if (user && !user.following.includes(rabbiId)) {
        user.following.push(rabbiId);
        const rabbi = mockRabbis.find(r => r._id === rabbiId);
        if (rabbi) rabbi.followers += 1;
      }
    }

    res.json({ message: 'Following rabbi successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/user/unfollow', authenticateToken, async (req, res) => {
  try {
    const { rabbiId } = req.body;
    if (!rabbiId) return res.status(400).json({ message: 'rabbiId required' });

    if (isMongoConnected) {
      const user = await User.findById(req.user.userId);
      user.following = user.following.filter(id => id.toString() !== rabbiId);
      await user.save();
      await Rabbi.findByIdAndUpdate(rabbiId, { $inc: { followers: -1 } });
    } else {
      const user = findMockUser({ _id: req.user.userId });
      if (user) {
        user.following = user.following.filter(id => id !== rabbiId);
        const rabbi = mockRabbis.find(r => r._id === rabbiId);
        if (rabbi && rabbi.followers > 0) rabbi.followers -= 1;
      }
    }

    res.json({ message: 'Unfollowed rabbi successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Password Reset Request Endpoint ---
app.post('/api/auth/reset-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    let user;
    if (isMongoConnected) {
      user = await User.findOne({ email });
    } else {
      user = findMockUser({ email });
    }
    if (!user) {
      // Respond with success to prevent email enumeration
      return res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60; // 1 hour

    if (isMongoConnected) {
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      await user.save();
    } else {
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
    }

    // Send email (configure your SMTP in .env)
    const transporter = nodemailer.createTransport({
      sendmail: true,
      newline: 'unix',
      path: '/usr/sbin/sendmail'
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
    await transporter.sendMail({
      to: email,
      from: process.env.SMTP_FROM || 'no-reply@shiurfinder.com',
      subject: 'ShiurFinder Password Reset',
      html: `<p>You requested a password reset.</p>
             <p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`
    });

    res.json({ message: 'If an account exists for this email, a reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Password Reset Confirm Endpoint ---
app.post('/api/auth/reset-password/confirm', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ message: 'Token and new password required' });

  try {
    let user;
    if (isMongoConnected) {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
      });
    } else {
      user = mockUsers.find(u => u.resetPasswordToken === token && u.resetPasswordExpires > Date.now());
    }
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(password, 12);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    if (isMongoConnected) await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RSS Feed routes
function extractMp3Url(str) {
  const match = str.match(/"mp3_url"\s*:\s*"([^"]+)"/);
  return match ? match[1] : null;
}

app.post('/api/export-favorites', async (req, res) => {
  const { favorites } = req.body; // [{title, url, _id}, ...]
  try {
    // Fetch and extract mp3_url for each favorite
    const items = await Promise.all(favorites.map(async shiur => {
      let mp3Url = null;
      if (shiur.url) {
        try {
          const resp = await axios.get(shiur.url);
          mp3Url = extractMp3Url(resp.data);
        } catch (e) {
          mp3Url = null;
        }
      }
      return {
        ...shiur,
        mp3_url: mp3Url,
      };
    }));

    // Generate RSS XML
    const itemsXml = items
      .filter(shiur => shiur.mp3_url && shiur.title)
      .map(shiur => `
        <item>
          <title><![CDATA[${shiur.title}]]></title>
          <enclosure url="${shiur.mp3_url}" type="audio/mpeg" />
          <guid>${shiur._id}</guid>
        </item>
      `)
      .join('\n');
    const xml = `<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
<channel>
<title>My Shiurim Podcast</title>
<link>https://binjomin.hu/</link>
<description>A collection of parasha from YT / YuT.</description>
<language>en-us</language>
    ${itemsXml}
  </channel>
</rss>`;

    // Upload via FTP
    const client = new FTP();
    client.on('ready', () => {
      client.put(Buffer.from(xml), '/public_html/podcast_feed.xml', (err) => {
        client.end();
        if (err) return res.status(500).json({ error: err.message });
        return res.json({ success: true });
      });
    });
    client.connect({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});