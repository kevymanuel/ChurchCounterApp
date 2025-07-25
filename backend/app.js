const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const { countPeopleInImage } = require('./services/openaiService');
const fs = require('fs');
const { router: auditoriumRouter } = require('./routes/auditorium');
const { router: sectionsRouter } = require('./routes/sections');
const analyzeRouter = require('./routes/analyze');
const resetRouter = require('./routes/reset');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
app.use('/auditorium', auditoriumRouter);
app.use('/sections', sectionsRouter);
app.use('/analyze', analyzeRouter);
app.use('/reset', resetRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});