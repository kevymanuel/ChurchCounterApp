// main.js

document.addEventListener('DOMContentLoaded', () => {
  // Render the initial UI
  renderApp();
});

function renderApp() {
  const root = document.getElementById('app-root');
  root.innerHTML = `
    <h1 class="mb-4">Church Counter App</h1>
    <div class="alert alert-info" id="instructions">
      <strong>Instructions:</strong><br>
      1. Enter the total auditorium capacity.<br>
      2. For each section:<br>
      &nbsp;&nbsp;- Enter a section name.<br>
      &nbsp;&nbsp;- Either upload up to 3 photos <b>or</b> enter the number of attendees manually (not both).<br>
      3. Add or remove sections as needed.<br>
      4. Click <b>Submit</b> to analyze and get the attendee count for each section and the total.
    </div>
    <button type="button" class="btn btn-danger my-3" id="reset-btn">Reset All Data</button>
    <form id="auditorium-form">
      <div class="mb-3">
        <label for="capacity" class="form-label">Auditorium Capacity</label>
        <input type="number" class="form-control" id="capacity" name="capacity" min="1" required>
      </div>
      <div id="sections-container"></div>
      <button type="button" class="btn btn-secondary my-2" id="add-section-btn">Add Section</button>
      <button type="submit" class="btn btn-primary my-2">Submit</button>
    </form>
    <div id="results" class="mt-4"></div>
  `;
  attachEventListeners();
  renderSections();
}

function attachEventListeners() {
  document.getElementById('add-section-btn').addEventListener('click', addSection);
  document.getElementById('auditorium-form').addEventListener('submit', handleSubmit);
  document.getElementById('reset-btn').addEventListener('click', handleReset);
}

async function handleReset() {
  if (!confirm('Are you sure you want to reset all data? This cannot be undone.')) return;
  try {
    const res = await fetch('http://localhost:4000/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset');
    // Reset UI state
    document.getElementById('capacity').value = '';
    sectionsState = [];
    sectionCounter = 1;
    renderSections();
    showResults('');
    addSection();
  } catch (err) {
    alert('Error resetting data: ' + (err.message || err));
  }
}

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
  sectionsState.push({ id: sectionId, name: '', files: [], manualCount: '' });
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

function handleSectionManualCountChange(id, value) {
  const section = sectionsState.find(s => s.id === id);
  if (section) {
    section.manualCount = value;
    if (value) {
      section.files = [];
    }
    renderSections();
  }
}

function handleSectionFilesChange(id, files) {
  const section = sectionsState.find(s => s.id === id);
  if (section) {
    section.files = Array.from(files).slice(0, 3);
    if (section.files.length > 0) {
      section.manualCount = '';
    }
    renderSections();
  }
}

function renderSections() {
  const container = document.getElementById('sections-container');
  container.innerHTML = '';
  sectionsState.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-card';
    sectionDiv.innerHTML = `
      <div class="mb-2 d-flex justify-content-between align-items-center">
        <strong>Section</strong>
        <button type="button" class="btn btn-danger btn-sm" data-remove="${section.id}">Remove</button>
      </div>
      <div class="mb-2">
        <label class="form-label">Section Name</label>
        <input type="text" class="form-control" value="${section.name || ''}" data-name="${section.id}" required>
      </div>
      <div class="mb-2">
        <label class="form-label">Manual Count (optional)</label>
        <input type="number" class="form-control" data-manual="${section.id}" min="0" value="${section.manualCount || ''}" ${section.files.length > 0 ? 'disabled' : ''}>
        <div class="form-text">If you enter a manual count, photo upload will be disabled for this section.</div>
      </div>
      <div class="mb-2">
        <label class="form-label">Upload Photos (max 3)</label>
        <input type="file" class="form-control" data-files="${section.id}" accept="image/*" multiple ${section.manualCount ? 'disabled' : ''}>
        <div class="form-text">${section.files.length} file(s) selected</div>
      </div>
    `;
    container.appendChild(sectionDiv);
  });
  // Attach remove, name, file, and manual count listeners
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
  container.querySelectorAll('input[data-manual]').forEach(input => {
    input.addEventListener('input', e => {
      const id = parseInt(input.getAttribute('data-manual'));
      handleSectionManualCountChange(id, input.value);
    });
  });
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
    // Create sections and upload photos or store manual count
    for (const section of sectionsState) {
      const created = await createSection(section.name);
      if (section.manualCount) {
        // Store manual count in a global for analysis
        created.manualCount = Number(section.manualCount);
        section._backendId = created.id;
        section._manualCount = Number(section.manualCount);
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
  // Call backend as before
  const analysis = await analyzeSections();
  // Overwrite results with manual counts where provided
  if (analysis && analysis.results) {
    sectionsState.forEach(section => {
      if (section._manualCount !== undefined) {
        const result = analysis.results.find(r => r.sectionId === section._backendId);
        if (result) {
          result.count = section._manualCount;
          result.confidence = 100;
          result.errorMargin = 0;
        }
      }
    });
    // Recalculate total
    analysis.total = analysis.results.reduce((sum, r) => sum + r.count, 0);
  }
  return analysis;
}

function showResults(html) {
  document.getElementById('results').innerHTML = html;
}

function renderResultsHTML(analysis) {
  if (!analysis || !analysis.results) return '';
  let html = '<h4>Results</h4><ul class="list-group mb-2">';
  analysis.results.forEach(r => {
    html += `<li class="list-group-item d-flex justify-content-between align-items-center">
      <span><strong>${r.sectionName}</strong> (ID: ${r.sectionId})</span>
      <span>${r.count} attendees <small class="text-muted">(±${r.errorMargin}, ${r.confidence}% confidence)</small></span>
    </li>`;
  });
  html += '</ul>';
  html += `<div class="alert alert-info">Total: <strong>${analysis.total}</strong> attendees</div>`;
  return html;
}

// --- Initial Section ---
addSection(); 