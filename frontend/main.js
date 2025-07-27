// main.js

let currentPage = 'landing';

function renderNav() {
  return `
    <nav class="navbar navbar-expand-lg navbar-light bg-white px-2 mb-4" style="border-radius:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
      <a class="navbar-brand d-flex align-items-center" href="#" id="nav-home">
        <span class="fw-bold" style="color:#FF0000;letter-spacing:1px;">ChurchCounter</span>
      </a>
      <div class="ms-auto">
        <button class="btn btn-primary ms-2" id="nav-app">Open App</button>
      </div>
    </nav>
  `;
}

function renderLanding() {
  return `
    <div class="container py-4">
      <div class="text-center mb-4">
        <h1 class="fw-bold" style="color:#FF0000;">ChurchCounter App</h1>
        <p class="lead mt-3">Effortlessly count attendees in different sections of your auditorium using AI-powered photo analysis or a simple tap counter.</p>
      </div>
      <div class="mb-4">
        <h4 class="fw-bold">What problem does it solve?</h4>
        <p>Counting people in large spaces is tedious and error-prone. ChurchCounter lets you break your auditorium into sections, then either tap to count or upload photos for AI vision to analyze—making accurate counting fast and easy.</p>
      </div>
      <div class="mb-4">
        <h4 class="fw-bold">Features</h4>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Set auditorium capacity</li>
          <li class="list-group-item">Add/remove named sections</li>
          <li class="list-group-item">For each section: tap to count <b>or</b> upload up to 3 photos</li>
          <li class="list-group-item">AI vision (OpenAI GPT-4) counts people in photos</li>
          <li class="list-group-item">See per-section and total counts</li>
          <li class="list-group-item">Reset to start a new count</li>
          <li class="list-group-item">Backend automatically resets all data every hour for privacy and data freshness</li>
        </ul>
      </div>
      <div class="mb-4">
        <h4 class="fw-bold">How does AI vision work?</h4>
        <p>When you upload photos, ChurchCounter securely sends them to OpenAI's GPT-4 vision model, which analyzes the images and returns a people count for each section. This leverages state-of-the-art AI to make counting fast, accurate, and effortless.</p>
      </div>
      <div class="text-center mt-5">
        <span class="badge bg-secondary p-2">Built with vibe-coding using Cursor and ChatGPT</span>
      </div>
      <div class="text-center mt-4">
        <button class="btn btn-primary btn-lg px-4" id="landing-start-btn">Get Started</button>
      </div>
    </div>
  `;
}

function renderApp() {
  const root = document.getElementById('app-root');
  root.innerHTML = `
    ${renderNav()}
    <div class="container">
      <div class="alert alert-info" id="instructions">
        <strong>Instructions:</strong><br>
        1. Enter the total auditorium capacity.<br>
        2. For each section:<br>
        &nbsp;&nbsp;- Enter a section name.<br>
        &nbsp;&nbsp;- Either upload up to 3 photos <b>or</b> use the attendee counter (not both).<br>
        3. Add or remove sections as needed.<br>
        4. Click <b>Submit</b> to analyze and get the attendee count for each section and the total.
      </div>
      <button type="button" class="btn btn-danger my-3 w-100" id="reset-btn">Reset All Data</button>
      <form id="auditorium-form">
        <div class="mb-3 row g-2 align-items-center">
          <div class="col-12 col-md-6 mx-auto">
            <label for="capacity" class="form-label">Auditorium Capacity</label>
            <input type="number" class="form-control" id="capacity" name="capacity" min="1" required>
          </div>
        </div>
        <div id="sections-container"></div>
        <div class="d-flex flex-column flex-md-row gap-2">
          <button type="button" class="btn btn-secondary my-2 flex-fill" id="add-section-btn">Add Section</button>
          <button type="submit" class="btn btn-primary my-2 flex-fill">Submit</button>
        </div>
      </form>
      <div id="results" class="mt-4"></div>
    </div>
  `;
  attachEventListeners();
  renderSections();
}

function renderSectionCard(section) {
  return `
    <div class="section-card">
      <div class="mb-2 d-flex justify-content-between align-items-center flex-wrap">
        <strong>Section</strong>
        <button type="button" class="btn btn-danger btn-sm mt-2 mt-md-0" data-remove="${section.id}">Remove</button>
      </div>
      <div class="mb-2">
        <label class="form-label">Section Name</label>
        <input type="text" class="form-control" value="${section.name || ''}" data-name="${section.id}" required>
      </div>
      <div class="mb-2">
        <label class="form-label">Attendee Counter</label>
        <div class="input-group flex-nowrap w-100" style="max-width: 260px;">
          <button type="button" class="btn btn-outline-secondary" data-minus="${section.id}" title="Decrease count">-</button>
          <span class="form-control text-center bg-light" style="pointer-events:none;">${section.count}</span>
          <button type="button" class="btn btn-outline-secondary" data-plus="${section.id}" title="Increase count">+</button>
        </div>
        <div class="form-text">Tap + to add, - to remove attendees. Disabled if photos are uploaded.</div>
      </div>
      <div class="mb-2">
        <label class="form-label">Upload Photos (max 3)</label>
        <input type="file" class="form-control" data-files="${section.id}" accept="image/*" multiple ${section.count > 0 ? 'disabled' : ''}>
        <div class="form-text">${section.files.length} file(s) selected</div>
      </div>
    </div>
  `;
}

function renderSections() {
  const container = document.getElementById('sections-container');
  container.innerHTML = sectionsState.map(renderSectionCard).join('');
  // Attach remove, name, file, and counter listeners
  container.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(btn.getAttribute('data-remove'));
      removeSection(id);
    });
  });
  container.querySelectorAll('input[data-name]').forEach(input => {
    input.addEventListener('input', e => {
      const id = parseInt(input.getAttribute('data-name'));
      handleSectionNameChange(id, input.value);
    });
  });
  container.querySelectorAll('input[data-files]').forEach(input => {
    input.addEventListener('change', e => {
      const id = parseInt(input.getAttribute('data-files'));
      handleSectionFilesChange(id, input.files);
    });
  });
  container.querySelectorAll('button[data-plus]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(btn.getAttribute('data-plus'));
      handleSectionCountChange(id, 1);
    });
  });
  container.querySelectorAll('button[data-minus]').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = parseInt(btn.getAttribute('data-minus'));
      handleSectionCountChange(id, -1);
    });
  });
}

function renderResultCard(r) {
  return `
    <div class="col-12 col-md-6">
      <div class="card shadow-sm border-0 mb-2" style="border-radius:1rem;">
        <div class="card-body">
          <div class="fw-bold mb-2" style="font-size:1.1rem;">${r.sectionName}</div>
          <div class="d-flex align-items-center mb-2">
            <span style="font-size:1.3rem;font-weight:700;">${r.count}</span>
            <span class="ms-2 badge bg-secondary">±${r.errorMargin}</span>
          </div>
          <div class="text-muted" style="font-size:0.95rem;">Confidence: ${r.confidence}%</div>
        </div>
      </div>
    </div>`;
}

function renderResultsHTML(analysis) {
  if (!analysis || !analysis.results) return '';
  let html = '<h4 class="fw-bold mb-3">Results</h4><div class="row g-3">';
  analysis.results.forEach(r => {
    html += renderResultCard(r);
  });
  html += '</div>';
  html += `<div class="alert alert-primary mt-3 text-center" style="font-size:1.2rem;font-weight:700;">Total: <span class="text-danger">${analysis.total}</span> attendees</div>`;
  return html;
}

function showResults(html) {
  document.getElementById('results').innerHTML = html;
}

function attachEventListeners() {
  if (document.getElementById('nav-home')) {
    document.getElementById('nav-home').addEventListener('click', e => {
      e.preventDefault();
      currentPage = 'landing';
      render();
    });
  }
  if (document.getElementById('nav-app')) {
    document.getElementById('nav-app').addEventListener('click', e => {
      e.preventDefault();
      currentPage = 'app';
      render();
    });
  }
  if (document.getElementById('landing-start-btn')) {
    document.getElementById('landing-start-btn').addEventListener('click', e => {
      currentPage = 'app';
      render();
    });
  }
  if (document.getElementById('add-section-btn')) {
    document.getElementById('add-section-btn').addEventListener('click', addSection);
  }
  if (document.getElementById('auditorium-form')) {
    document.getElementById('auditorium-form').addEventListener('submit', handleSubmit);
  }
  if (document.getElementById('reset-btn')) {
    document.getElementById('reset-btn').addEventListener('click', handleReset);
  }
}

function render() {
  const root = document.getElementById('app-root');
  if (currentPage === 'landing') {
    root.innerHTML = renderNav() + renderLanding();
    attachEventListeners();
  } else {
    renderApp();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  render();
});

// --- Backend API Calls ---

const API_BASE = 'http://localhost:4000';

async function setAuditoriumCapacity(capacity) {
  const res = await fetch(`${API_BASE}/auditorium`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity })
  });
  return res.json();
}

async function createSection(name) {
  const res = await fetch(`${API_BASE}/sections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

async function uploadSectionPhotos(sectionId, files) {
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }
  const res = await fetch(`${API_BASE}/sections/${sectionId}/photos`, {
    method: 'POST',
    body: formData
  });
  return res.json();
}

async function analyzeSections() {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST' });
  return res.json();
}

// --- Section State Management ---
let sectionsState = [];
let sectionCounter = 1;

function addSection() {
  const sectionId = sectionCounter++;
  sectionsState.push({ id: sectionId, name: '', files: [], count: 0 });
  renderSections();
}

function removeSection(id) {
  sectionsState = sectionsState.filter(s => s.id !== id);
  if (sectionsState.length === 0) {
    addSection();
  } else {
    renderSections();
  }
}

function handleSectionNameChange(id, value) {
  const section = sectionsState.find(s => s.id === id);
  if (section) section.name = value;
}

function handleSectionCountChange(id, delta) {
  const section = sectionsState.find(s => s.id === id);
  if (section) {
    section.count = Math.max(0, section.count + delta);
    renderSections();
  }
}

function handleSectionFilesChange(id, files) {
  const section = sectionsState.find(s => s.id === id);
  if (section) {
    section.files = Array.from(files).slice(0, 3);
    if (section.files.length > 0) {
      section.count = 0; // Reset counter if photos are selected
    }
    renderSections();
  }
}

// --- Form Submission ---
async function handleSubmit(e) {
  e.preventDefault();
  const capacity = document.getElementById('capacity').value;
  if (!capacity || sectionsState.length === 0 || sectionsState.some(s => !s.name)) {
    alert('Please enter capacity and add at least one section with a name.');
    return;
  }
  // Disable form
  const form = document.getElementById('auditorium-form');
  form.querySelectorAll('input, button').forEach(el => el.disabled = true);
  showResults('Submitting...');
  try {
    await setAuditoriumCapacity(Number(capacity));
    // Create sections and upload photos or store counter value
    for (const section of sectionsState) {
      const created = await createSection(section.name);
      if (section.count > 0) {
        // Store counter value in a global for analysis
        created.manualCount = section.count;
        section._backendId = created.id;
        section._manualCount = section.count;
      } else if (section.files.length > 0) {
        await uploadSectionPhotos(created.id, section.files);
        section._backendId = created.id;
      }
    }
    // Analyze
    const analysis = await analyzeSectionsWithManualCounts();
    showResults(renderResultsHTML(analysis));
  } catch (err) {
    showResults('Error: ' + (err.message || err));
  }
  // Re-enable form
  form.querySelectorAll('input, button').forEach(el => el.disabled = false);
}

// --- Custom Analyze to handle manual counts ---
async function analyzeSectionsWithManualCounts() {
  // Check if we have any manual counts
  const hasManualCounts = sectionsState.some(section => section._manualCount !== undefined);
  
  if (hasManualCounts) {
    // Use manual counts directly - don't call backend analyze
    const results = sectionsState.map(section => {
      if (section._manualCount !== undefined) {
        return {
          sectionId: section._backendId,
          sectionName: section.name,
          count: section._manualCount,
          confidence: 100,
          errorMargin: 0
        };
      }
      return null;
    }).filter(result => result !== null);
    
    const total = results.reduce((sum, r) => sum + r.count, 0);
    return { results, total };
  } else {
    // Call backend analyze for photo-based analysis
    return await analyzeSections();
  }
}

async function handleReset() {
  try {
    // Call backend reset endpoint
    const response = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset backend data');
    }
    
    const result = await response.json();
    console.log('Reset result:', result);
    
    // Clear frontend state
    sectionsState = [];
    sectionCounter = 1; // Reset section counter
    addSection(); // Add one empty section
    document.getElementById('capacity').value = '';
    
    // Clear results
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
      resultsDiv.innerHTML = '';
    }
    
    // Force re-render to clear any cached counter values
    renderSections();
    
    alert('All data and uploaded files cleared successfully!');
  } catch (error) {
    console.error('Reset error:', error);
    alert('Error resetting data: ' + error.message);
  }
}

// --- Initial Section ---
addSection(); 