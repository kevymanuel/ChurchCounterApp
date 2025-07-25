# ChurchCounterApp

A web application to count attendees in different sections of an auditorium using either manual input or AI-powered photo analysis (OpenAI GPT-4 vision).

## Features
- Set auditorium capacity
- Add/remove named sections
- For each section, either:
  - Tap to count attendees
  - Upload up to 3 photos (AI counts people in each photo)
- Submit to get a count per section and total
- Reset all data to start a new count
- **Backend automatically resets all data every hour for privacy and data freshness**

## Tech Stack
- **Backend:** Node.js, Express, OpenAI API
- **Frontend:** Plain JavaScript, Bootstrap, Roboto font

## Setup Instructions

### 1. Clone the Repository
```sh
git clone https://github.com/kevymanuel/ChurchCounterApp.git
cd ChurchCounterApp
```

### 2. Backend Setup
```sh
cd backend
npm install
```

#### Environment Variables
Create a `.env` file in the `backend/` directory:
```
OPENAI_API_KEY=your_openai_api_key_here
```

#### Start the Backend
```sh
node app.js
```

### 3. Frontend Setup
No build step required. Open `frontend/index.html` in your browser.

#### (Optional) Serve Frontend with Local Server
If you have issues with uploads or CORS, run:
```sh
cd frontend
python3 -m http.server 8080
# or
npx serve .
```
Then visit [http://localhost:8080](http://localhost:8080)

## Usage
- Enter auditorium capacity
- Add and name sections
- For each section, upload photos **or** use the attendee counter
- Click **Submit** to analyze
- Click **Reset All Data** to start over
- **Note:** All data is automatically cleared every hour

## How does AI vision work?
When you upload photos, ChurchCounter securely sends them to OpenAI's GPT-4 vision model, which analyzes the images and returns a people count for each section. This leverages state-of-the-art AI to make counting fast, accurate, and effortless.

## Built With
- vibe-coding using Cursor and ChatGPT

## Contributing
Pull requests welcome! Please open an issue first to discuss major changes.

## License
[MIT](LICENSE) (add your license file) 