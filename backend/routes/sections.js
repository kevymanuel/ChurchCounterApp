const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const store = require('../data/store');

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

router.post('/', (req, res) => {
  const { name } = req.body;
  const newSection = { id: store.sectionId++, name, photos: [] };
  store.sections.push(newSection);
  res.json(newSection);
});

router.get('/', (req, res) => {
  res.json(store.sections);
});

router.post('/:id/photos', upload.array('photos', 3), (req, res) => {
  const section = store.sections.find(s => s.id === parseInt(req.params.id));
  if (!section) return res.status(404).json({ error: 'Section not found' });
  if (section.photos.length + req.files.length > 3) {
    return res.status(400).json({ error: 'Max 3 photos per section' });
  }
  section.photos.push(...req.files.map(f => f.filename));
  res.json(section);
});

module.exports = router; 