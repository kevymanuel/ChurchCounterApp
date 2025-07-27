const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateAuditoriumCapacity } = require('../middleware/validation');

// Set auditorium capacity
router.post('/', validateAuditoriumCapacity, (req, res) => {
  try {
    store.auditorium.capacity = req.body.capacity;
    res.json({ 
      message: 'Auditorium capacity set successfully',
      capacity: store.auditorium.capacity 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set auditorium capacity' });
  }
});

module.exports = router; 