const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const store = require('../data/store');
const { 
  validateSectionCreation, 
  validateSectionId, 
  validateFileUpload 
} = require('../middleware/validation');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 3 // Maximum 3 files
  }
});

// Create a new section
router.post('/', validateSectionCreation, (req, res) => {
  try {
    const { name } = req.body;
    const newSection = {
      id: store.sectionId++,
      name: name,
      files: [],
      count: 0
    };
    store.sections.push(newSection);
    res.json({ 
      message: 'Section created successfully',
      section: newSection 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create section' });
  }
});

// Get all sections
router.get('/', (req, res) => {
  try {
    res.json({ 
      sections: store.sections,
      count: store.sections.length 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve sections' });
  }
});

// Upload photos for a section
router.post('/:id/photos', validateSectionId, upload.array('photos', 3), validateFileUpload, (req, res) => {
  try {
    const sectionId = parseInt(req.params.id);
    const section = store.sections.find(s => s.id === sectionId);
    
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: file.path
    }));
    
    section.files = uploadedFiles;
    
    res.json({ 
      message: 'Photos uploaded successfully',
      section: section 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

module.exports = router; 