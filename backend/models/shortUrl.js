// const mongoose = require('mongoose')
// const shortId = require('shortid')

// const shortUrlSchema = new mongoose.Schema({
//   full: {
//     type: String,
//     required: true
//   },
//   short: {
//     type: String,
//     required: true,
//     default: shortId.generate
//   },
//   clicks: {
//     type: Number,
//     required: true,
//     default: 0
//   }
// })

// module.exports = mongoose.model('ShortUrl', shortUrlSchema)

const mongoose = require('mongoose');
const shortId = require('shortid');

const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: String,
  ipAddress: String,
  location: {
    country: String,
    city: String
  },
  osType: String,
  deviceType: String
});

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true
  },
  short: {
    type: String,
    required: true,
    default: shortId.generate
  },
  customAlias: {
    type: String,
    unique: false,
    sparse: true
  },
  topic: {
    type: String,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  },
  clickDetails: [clickSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster lookups
shortUrlSchema.index({ short: 1 });
shortUrlSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('ShortUrl', shortUrlSchema);