const express = require('express');
const fs = require('fs');
const path = require('path');
const store = require('../data/store');
const router = express.Router();

router.post('/', (req, res) => {
  try {
    // Clear in-memory data
    store.auditorium.capacity = null;
    store.sections.length = 0;
    store.sectionId = 1;
    
    // Clear uploaded files from filesystem
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${file}`);
        } catch (err) {
          console.error(`Error deleting file ${file}:`, err);
        }
      });
      console.log(`Cleared ${files.length} uploaded files`);
    }
    
    console.log('All data and files reset successfully');
    res.json({ 
      success: true, 
      message: 'All data and uploaded files cleared successfully',
      clearedFiles: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).length : 0
    });
  } catch (error) {
    console.error('Error during reset:', error);
    res.status(500).json({ 
      error: 'Failed to reset data',
      details: error.message 
    });
  }
});

module.exports = router; 