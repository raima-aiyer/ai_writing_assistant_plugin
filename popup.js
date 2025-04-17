document.addEventListener('DOMContentLoaded', function() {
    const improveButton = document.getElementById('improve');
    const grammarButton = document.getElementById('grammar');
    const rewriteButton = document.getElementById('rewrite');
    const statusDiv = document.getElementById('status');
    const toneButtons = document.querySelectorAll('.tone-button');
  
    // Handle tone selection
    toneButtons.forEach(button => {
      button.addEventListener('click', function() {
        toneButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
      });
    });
  
    // Get selected tone
    function getSelectedTone() {
      return document.querySelector('.tone-button.active').dataset.tone;
    }
  
    // Common function to send message to content script
    function sendMessage(action) {
      statusDiv.textContent = 'Processing...';
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0]) {
          statusDiv.textContent = 'Error: No active tab found';
          return;
        }
  
        chrome.tabs.sendMessage(tabs[0].id, {
          action: action,
          tone: getSelectedTone()
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            statusDiv.textContent = 'Error: Could not connect to page. Please refresh the page and try again.';
            return;
          }
          
          if (response && response.error) {
            statusDiv.textContent = response.error;
          } else if (response && response.success) {
            statusDiv.textContent = 'Success!';
          } else {
            statusDiv.textContent = 'Unknown error occurred';
          }
        });
      });
    }
  
    // Add event listeners for buttons
    improveButton.addEventListener('click', () => sendMessage('improve'));
    grammarButton.addEventListener('click', () => sendMessage('grammar'));
    rewriteButton.addEventListener('click', () => sendMessage('rewrite'));
  });