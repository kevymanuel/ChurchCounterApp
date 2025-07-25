const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const auditoriumRouter = require('./routes/auditorium');
const sectionsRouter = require('./routes/sections');
const analyzeRouter = require('./routes/analyze');
const resetRouter = require('./routes/reset');
const store = require('./data/store');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auditorium', auditoriumRouter);
app.use('/sections', sectionsRouter);
app.use('/analyze', analyzeRouter);
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
});