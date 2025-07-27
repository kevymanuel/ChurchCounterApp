const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const rateLimit = require('express-rate-limit');
const auditoriumRouter = require('./routes/auditorium');
const sectionsRouter = require('./routes/sections');
const analyzeRouter = require('./routes/analyze');
const resetRouter = require('./routes/reset');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 4000;

// Rate limiting middleware
// General rate limit: 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for analyze endpoint (uses OpenAI tokens)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 analyze requests per 15 minutes
  message: 'Too many analyze requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit for file uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 upload requests per 15 minutes
  message: 'Too many file uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply rate limiting
app.use(generalLimiter); // Apply to all routes

// Routes with specific rate limits
app.use('/auditorium', auditoriumRouter);
app.use('/sections', uploadLimiter, sectionsRouter); // Apply upload limiter to sections (file uploads)
app.use('/analyze', analyzeLimiter, analyzeRouter); // Apply stricter limiter to analyze
app.use('/reset', resetRouter);

// Automatically reset backend data every hour (3600000 ms)
setInterval(() => {
  store.auditorium.capacity = null;
  store.sections.length = 0;
  store.sectionId = 1;
  console.log('Backend data automatically reset after 1 hour.');
}, 3600000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Rate limiting enabled:');
  console.log('- General: 100 requests per 15 minutes per IP');
  console.log('- Analyze: 10 requests per 15 minutes per IP');
  console.log('- Uploads: 20 requests per 15 minutes per IP');
});