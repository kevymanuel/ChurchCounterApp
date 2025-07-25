const { OpenAI } = require('openai');
const fs = require('fs');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper to analyze a single image
async function countPeopleInImage(imagePath) {
  const imageData = fs.readFileSync(imagePath);
  const base64Image = imageData.toString('base64');
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'How many people are visible in this photo? Return only the number.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }
    ],
    max_tokens: 10
  });
  const text = response.choices[0].message.content.trim();
  const count = parseInt(text.match(/\d+/)?.[0] || '0', 10);
  return count;
}

module.exports = { countPeopleInImage }; 