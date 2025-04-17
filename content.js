// Your Gemini API key
const API_KEY = "AIzaSyBx8RMd1E4GjQJ8rqDAOn2OjQrL5qSx6m0";

// Function to get selected text or content of focused input
function getSelectedText() {
  const activeElement = document.activeElement;
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    return activeElement.value;
  }
  return window.getSelection().toString();
}

// Function to replace selected text or input content
function replaceText(newText) {
  const activeElement = document.activeElement;
  if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
    activeElement.value = newText;
    // Trigger input event to ensure the change is registered
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
  } else {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
  }
}

// Function to make API call to Gemini
async function callGeminiAPI(text, action, tone) {
  const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  
  let prompt = '';
  switch(action) {
    case 'improve':
      prompt = `Improve the following text in a ${tone} tone: "${text}"`;
      break;
    case 'grammar':
      prompt = `Check and correct grammar in the following text: "${text}"`;
      break;
    case 'rewrite':
      prompt = `Rewrite the following text in a ${tone} tone: "${text}"`;
      break;
  }

  try {
    console.log('Sending request to Gemini API...');
    const response = await fetch(`${baseUrl}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    console.log('Received response from API');
    const data = await response.json();
    console.log('API Response:', data);

    if (data.error) {
      console.error('API Error:', data.error);
      throw new Error(data.error.message || 'API Error');
    }

    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action) {
    const selectedText = getSelectedText();
    if (!selectedText) {
      sendResponse({ error: 'Please select some text or focus on an input field' });
      return true;
    }

    // Process the request
    callGeminiAPI(selectedText, request.action, request.tone)
      .then(result => {
        console.log('Successfully got result from API');
        replaceText(result);
        // Send success response back to popup
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Error in message handler:', error);
        // Send error response back to popup
        sendResponse({ error: error.message });
      });

    return true; // Will respond asynchronously
  }
});