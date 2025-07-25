const express = require('express');
const router = express.Router();
const store = require('../data/store');

router.post('/', (req, res) => {
  const { capacity } = req.body;
  store.auditorium.capacity = capacity;
  res.json({ success: true, auditorium: store.auditorium });
});

module.exports = router; 