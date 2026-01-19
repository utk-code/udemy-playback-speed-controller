// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'setSpeed') {
    const success = setPlaybackSpeed(request.speed);
    sendResponse({ success: success });
  }
  return true;
});

// Function to set playback speed
function setPlaybackSpeed(speed) {
  // Find the video element on the page
  const video = document.querySelector('video');
  
  if (video) {
    try {
      video.playbackRate = speed;
      console.log(`Udemy Speed Controller: Set playback speed to ${speed}x`);
      return true;
    } catch (error) {
      console.error('Udemy Speed Controller: Error setting speed:', error);
      return false;
    }
  } else {
    console.warn('Udemy Speed Controller: Video element not found');
    return false;
  }
}

// Observe for video element changes (for when navigating between lectures)
const observer = new MutationObserver((mutations) => {
  // Check if there's a saved speed to apply
  chrome.storage.local.get(['playbackSpeed'], (result) => {
    if (result.playbackSpeed) {
      const video = document.querySelector('video');
      if (video && Math.abs(video.playbackRate - result.playbackSpeed) > 0.01) {
        setPlaybackSpeed(result.playbackSpeed);
      }
    }
  });
});

// Start observing the document for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Apply saved speed when page loads
window.addEventListener('load', () => {
  chrome.storage.local.get(['playbackSpeed'], (result) => {
    if (result.playbackSpeed) {
      setTimeout(() => {
        setPlaybackSpeed(result.playbackSpeed);
      }, 1000);
    }
  });
});

// Also try to apply speed immediately
chrome.storage.local.get(['playbackSpeed'], (result) => {
  if (result.playbackSpeed) {
    setTimeout(() => {
      setPlaybackSpeed(result.playbackSpeed);
    }, 500);
  }
});
