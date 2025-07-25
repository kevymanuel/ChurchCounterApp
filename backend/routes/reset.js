const express = require('express');
const store = require('../data/store');
const router = express.Router();

router.post('/', (req, res) => {
  store.auditorium.capacity = null;
  store.sections.length = 0;
  store.sectionId = 1;
  res.json({ success: true });
});

module.exports = router; 