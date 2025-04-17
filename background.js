// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('AI Writing Assistant installed');
  });
  
  // Handle any background tasks here
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'background') {
      // Handle background tasks if needed
      sendResponse({ success: true });
    }
    return true;
  });