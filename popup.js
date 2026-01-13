// Stato dell'applicazione
let conversationHistory = [];
let isLoading = false;
let includeContext = false;

// Elementi DOM
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelector = document.getElementById('modelSelector');
const settingsBtn = document.getElementById('settingsBtn');
const contextBtn = document.getElementById('contextBtn');

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadConversation();
  checkApiKey();

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  contextBtn.addEventListener('click', () => {
    includeContext = !includeContext;
    contextBtn.classList.toggle('active', includeContext);
  });

  modelSelector.addEventListener('change', saveSettings);
});

// Carica impostazioni
async function loadSettings() {
  const result = await chrome.storage.sync.get(['selectedModel']);
  if (result.selectedModel) {
    modelSelector.value = result.selectedModel;
  }
}

// Salva impostazioni
async function saveSettings() {
  await chrome.storage.sync.set({
    selectedModel: modelSelector.value
  });
}

// Carica conversazione salvata
async function loadConversation() {
  const result = await chrome.storage.local.get(['conversation']);
  if (result.conversation) {
    conversationHistory = result.conversation;
    conversationHistory.forEach(msg => {
      addMessageToUI(msg.role, msg.content);
    });
  }
}

// Salva conversazione
async function saveConversation() {
  await chrome.storage.local.set({
    conversation: conversationHistory
  });
}

// Controlla se l'API key è configurata
async function checkApiKey() {
  const result = await chrome.storage.sync.get(['apiKey']);
  if (!result.apiKey) {
    showSetupNotice();
  }
}

// Mostra avviso di configurazione
function showSetupNotice() {
  chatContainer.innerHTML = `
    <div class="setup-notice">
      <p><strong>Benvenuto!</strong></p>
      <p>Per iniziare, configura la tua API key di OpenRouter.</p>
      <button onclick="chrome.runtime.openOptionsPage()">Apri Impostazioni</button>
    </div>
  `;
}

// Aggiungi messaggio all'UI
function addMessageToUI(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;
  messageDiv.textContent = content;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Mostra indicatore di caricamento
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message assistant loading';
  loadingDiv.id = 'loading';
  loadingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatContainer.appendChild(loadingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Rimuovi indicatore di caricamento
function removeLoading() {
  const loadingDiv = document.getElementById('loading');
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

// Mostra errore
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'message error';
  errorDiv.textContent = `❌ ${message}`;
  chatContainer.appendChild(errorDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Ottieni il contesto della pagina corrente
async function getPageContext() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContext' });
    return response;
  } catch (error) {
    console.error('Error getting page context:', error);
    return null;
  }
}

// Invia messaggio
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || isLoading) return;

  // Ottieni API key
  const result = await chrome.storage.sync.get(['apiKey']);
  if (!result.apiKey) {
    showError('API key non configurata. Apri le impostazioni.');
    return;
  }

  // Aggiungi messaggio utente
  addMessageToUI('user', message);
  conversationHistory.push({ role: 'user', content: message });

  // Aggiungi contesto pagina se richiesto
  let userMessage = message;
  if (includeContext) {
    const context = await getPageContext();
    if (context) {
      userMessage = `Contesto della pagina:\nURL: ${context.url}\nTitolo: ${context.title}\n\n${context.text ? 'Contenuto:\n' + context.text.substring(0, 2000) : ''}\n\nDomanda: ${message}`;
    }
  }

  // Pulisci input
  messageInput.value = '';
  isLoading = true;
  sendBtn.disabled = true;
  showLoading();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${result.apiKey}`,
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'Claude via OpenRouter Extension'
      },
      body: JSON.stringify({
        model: modelSelector.value,
        messages: [
          ...conversationHistory.slice(0, -1),
          { role: 'user', content: userMessage }
        ]
      })
    });

    removeLoading();

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    // Aggiungi risposta
    addMessageToUI('assistant', assistantMessage);
    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    // Salva conversazione
    await saveConversation();

  } catch (error) {
    removeLoading();
    console.error('Error:', error);
    showError(`Errore: ${error.message}`);
    // Rimuovi l'ultimo messaggio utente dalla cronologia in caso di errore
    conversationHistory.pop();
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}
