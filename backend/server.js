require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('./config/passport');
const session = require('express-session');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const { createUrlLimiter, analyticsLimiter } = require('./middleware/rateLimiter');
const auth = require('./middleware/auth');
const jwt = require('jsonwebtoken');
// Models
const ShortUrl = require('./models/shortUrl');
const User = require('./models/user');

const app = express();
const port = process.env.PORT || 5000;
// const port = "https://url-shortener-assignment.onrender.com";

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://localhost:27017/urlShortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Auth Routes
app.get('https://url-shortener-assignment.onrender.com/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('https://url-shortener-assignment.onrender.com/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET);
    res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
  }
);
app.get('/api/shorten', auth, async (req, res) => {
  try {
    const urls = await ShortUrl.find({ userId: req.user.id });
    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch URLs' });
  }
});
// URL Shortener Routes
app.post('/api/shorten', auth, createUrlLimiter, async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    
     if (!longUrl) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

     // Check if customAlias is provided and not empty
    let alias = customAlias?.trim();
    if (alias) {
      const existing = await ShortUrl.findOne({ customAlias: alias });
      if (existing) {
        return res.status(400).json({ error: 'Custom alias already taken' });
      }
    } else {
      alias = generateShortUrl(); // Generate a short URL if customAlias is not provided
    }
    
    // const shortUrl = await ShortUrl.create({
    //   full: longUrl,
    //   customAlias,
    //   topic,
    //   userId: req.user.id
    // });
    const shortUrl = await ShortUrl.create({
      full: longUrl,
      customAlias: alias,
      topic: topic?.trim() || null,
      userId: req.user.id
    });
    await shortUrl.save();
    console.log("Short URL created:", shortUrl);
    res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/${shortUrl.short}`,
      createdAt: shortUrl.createdAt
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(400).json({ error: 'Failed to create short URL' });
  }
});
function generateShortUrl() {
  return Math.random().toString(36).substring(2, 8);
}

app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ 
      $or: [
        { short: req.params.shortUrl },
        { customAlias: req.params.shortUrl }
      ]
    });

    if (!shortUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Track analytics
    const parser = new UAParser(req.headers['user-agent']);
    const ua = parser.getResult();
    const ip = req.ip;
    const geo = geoip.lookup(ip);

    shortUrl.clickDetails.push({
      userAgent: req.headers['user-agent'],
      ipAddress: ip,
      location: geo ? { country: geo.country, city: geo.city } : null,
      osType: ua.os.name,
      deviceType: ua.device.type || 'desktop'
    });

    shortUrl.clicks++;
    await shortUrl.save();
    
    res.json({ fullUrl: shortUrl.full });
  } catch (error) {

    console.error('Failed to process URL', error);
    res.status(500).json({ error: 'Failed to process URL' });
  }
});

// Analytics Routes
app.get('/api/analytics/:alias', auth, analyticsLimiter, async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({
      $or: [
        { short: req.params.alias },
        { customAlias: req.params.alias }
      ],
      userId: req.user.id
    });

    console.log("Short url:", shortUrl);
    // if (!shortUrl) {
    //   return res.status(404).json({ error: 'URL not found' });
    // }

    // Calculate analytics
    const uniqueUsers = new Set(shortUrl.clickDetails.map(click => click.ipAddress)).size;
    console.log("Unique Users:", uniqueUsers);
    // Get clicks by date (last 7 days)
    const clicksByDate = await getClicksByDate(shortUrl.clickDetails);
    console.log("Clicks by Date:", clicksByDate);
    // Get OS statistics
    const osStats = getOSStats(shortUrl.clickDetails);
    console.log("OS Stats", osStats);
    // Get device type statistics
    const deviceStats = getDeviceStats(shortUrl.clickDetails);
    console.log(console.log("Device Stats", deviceStats));
    res.json({
      totalClicks: shortUrl.clicks,
      uniqueUsers,
      clicksByDate,
      osType: osStats,
      deviceType: deviceStats
    });
  } catch (error) {
    console.error('Error fetching analytics', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/topicAnalytics/:topic', auth, analyticsLimiter, async (req, res) => {
  try {
    const urls = await ShortUrl.find({
      topic: req.params.topic,
      userId: req.user.id
    });

    const analytics = calculateTopicAnalytics(urls);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching topics analytics', error);
    res.status(500).json({ error: 'Failed to fetch topic analytics' });
  }
});

app.get('/api/overallAnalytics', auth, analyticsLimiter, async (req, res) => {
  try {
    const urls = await ShortUrl.find({ userId: req.user.id });
    // console.log("URLs:", urls);
    const analytics = calculateOverallAnalytics(urls);
    console.log("Analytics:", analytics);
    res.json(analytics);
  } catch (error) {
     console.error('Error fetching overall analytics', error);
    res.status(500).json({ error: 'Failed to fetch overall analytics' });
  }
});

// Helper functions for analytics calculations
function getClicksByDate(clickDetails) {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return clickDetails
    .filter(click => click.timestamp >= sevenDaysAgo)
    .reduce((acc, click) => {
      const date = click.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
}

function getOSStats(clickDetails) {
  return clickDetails.reduce((acc, click) => {
    const os = click.osType;
    if (!acc[os]) {
      acc[os] = { uniqueClicks: 0, uniqueUsers: new Set() };
    }
    acc[os].uniqueClicks++;
    acc[os].uniqueUsers.add(click.ipAddress);
    return acc;
  }, {});
}

function getDeviceStats(clickDetails) {
  return clickDetails.reduce((acc, click) => {
    const device = click.deviceType;
    if (!acc[device]) {
      acc[device] = { uniqueClicks: 0, uniqueUsers: new Set() };
    }
    acc[device].uniqueClicks++;
    acc[device].uniqueUsers.add(click.ipAddress);
    return acc;
  }, {});
}

function calculateTopicAnalytics(urls) {
  const topicStats = {
    totalClicks: 0,
    uniqueUsers: new Set(),
    clicksByDate: {},
    urls: []
  };

  urls.forEach(url => {
    topicStats.totalClicks += url.clicks;
    const urlStats = {
      shortUrl: url.short,
      totalClicks: url.clicks,
      uniqueUsers: new Set()
    };

    url.clickDetails.forEach(click => {
      topicStats.uniqueUsers.add(click.ipAddress);
      urlStats.uniqueUsers.add(click.ipAddress);
      
      // Clicks by date
      const date = click.timestamp.toISOString().split('T')[0];
      topicStats.clicksByDate[date] = (topicStats.clicksByDate[date] || 0) + 1;
    });

    urlStats.uniqueUsers = urlStats.uniqueUsers.size;
    topicStats.urls.push(urlStats);
  });

  // Convert Sets to counts and format clicksByDate
  topicStats.uniqueUsers = topicStats.uniqueUsers.size;
  topicStats.clicksByDate = Object.entries(topicStats.clicksByDate).map(([date, clicks]) => ({ date, clicks }));

  return topicStats;
}

function calculateOverallAnalytics(urls) {
  const overallStats = {
    totalUrls: urls.length,
    totalClicks: 0,
    uniqueUsers: new Set(),
    clicksByDate: {},
    osType: {},
    deviceType: {}
  };

  urls.forEach(url => {
    overallStats.totalClicks += url.clicks;
    
    url.clickDetails.forEach(click => {
      overallStats.uniqueUsers.add(click.ipAddress);
      
      // Clicks by date
      const date = click.timestamp.toISOString().split('T')[0];
      overallStats.clicksByDate[date] = (overallStats.clicksByDate[date] || 0) + 1;
      
      // OS stats
      if (!overallStats.osType[click.osType]) {
        overallStats.osType[click.osType] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      overallStats.osType[click.osType].uniqueClicks++;
      overallStats.osType[click.osType].uniqueUsers.add(click.ipAddress);
      
      // Device stats
      if (!overallStats.deviceType[click.deviceType]) {
        overallStats.deviceType[click.deviceType] = { uniqueClicks: 0, uniqueUsers: new Set() };
      }
      overallStats.deviceType[click.deviceType].uniqueClicks++;
      overallStats.deviceType[click.deviceType].uniqueUsers.add(click.ipAddress);
    });
  });

  // Convert Sets to counts and format data
  overallStats.uniqueUsers = overallStats.uniqueUsers.size;
  overallStats.clicksByDate = Object.entries(overallStats.clicksByDate).map(([date, clicks]) => ({ date, clicks }));
  overallStats.osType = Object.entries(overallStats.osType).map(([osName, stats]) => ({
    osName,
    uniqueClicks: stats.uniqueClicks,
    uniqueUsers: stats.uniqueUsers.size
  }));
  overallStats.deviceType = Object.entries(overallStats.deviceType).map(([deviceName, stats]) => ({
    deviceName,
    uniqueClicks: stats.uniqueClicks,
    uniqueUsers: stats.uniqueUsers.size
  }));

  return overallStats;
}

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});