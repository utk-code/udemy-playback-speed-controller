// Get DOM elements
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const presetButtons = document.querySelectorAll('.preset-btn');
const status = document.getElementById('status');

// Load saved speed from storage
chrome.storage.local.get(['playbackSpeed'], (result) => {
  const savedSpeed = result.playbackSpeed || 1;
  updateSpeed(savedSpeed);
});

// Update speed display and slider
function updateSpeed(speed) {
  speedSlider.value = speed;
  speedValue.textContent = speed.toFixed(2);
  
  // Update active preset button
  presetButtons.forEach(btn => {
    const btnSpeed = parseFloat(btn.dataset.speed);
    if (Math.abs(btnSpeed - speed) < 0.01) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Apply speed to current tab
function applySpeed(speed) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'setSpeed', speed: speed },
        (response) => {
          if (chrome.runtime.lastError) {
            showStatus('Please refresh the Udemy page', 'error');
          } else if (response && response.success) {
            showStatus(`Speed set to ${speed.toFixed(2)}x`, 'success');
            // Save speed to storage
            chrome.storage.local.set({ playbackSpeed: speed });
          } else {
            showStatus('Video not found', 'error');
          }
        }
      );
    }
  });
}

// Show status message
function showStatus(message, type = '') {
  status.textContent = message;
  status.className = `status ${type}`;
  setTimeout(() => {
    status.textContent = '';
    status.className = 'status';
  }, 3000);
}

// Slider input handler
speedSlider.addEventListener('input', (e) => {
  const speed = parseFloat(e.target.value);
  updateSpeed(speed);
});

// Slider change handler (when user releases the slider)
speedSlider.addEventListener('change', (e) => {
  const speed = parseFloat(e.target.value);
  applySpeed(speed);
});

// Preset button click handlers
presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const speed = parseFloat(btn.dataset.speed);
    updateSpeed(speed);
    applySpeed(speed);
  });
});

// Apply saved speed when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0] && tabs[0].url && tabs[0].url.includes('udemy.com')) {
    chrome.storage.local.get(['playbackSpeed'], (result) => {
      const savedSpeed = result.playbackSpeed || 1;
      applySpeed(savedSpeed);
    });
  }
});
