// Stato dell'applicazione
let conversationHistory = [];
let isLoading = false;
let includeContext = false;
let computerUseMode = false;
let computerUseController = null;

// Elementi DOM
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const modelSelector = document.getElementById('modelSelector');
const settingsBtn = document.getElementById('settingsBtn');
const contextBtn = document.getElementById('contextBtn');
const computerUseToggle = document.getElementById('computerUseToggle');
const modeIndicator = document.getElementById('modeIndicator');

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadConversation();
  checkApiKey();

  // Inizializza controller computer use
  if (window.ComputerUseController) {
    computerUseController = new ComputerUseController();
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  stopBtn.addEventListener('click', stopExecution);

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

  computerUseToggle.addEventListener('change', (e) => {
    computerUseMode = e.target.checked;
    updateModeIndicator();

    if (computerUseMode) {
      showSystemMessage('🤖 Modalità Computer Use attivata! Claude può ora navigare e interagire con le pagine web.');
    } else {
      showSystemMessage('💬 Modalità Chat attivata');
    }
  });

  modelSelector.addEventListener('change', saveSettings);
});

// Aggiorna indicatore modalità
function updateModeIndicator() {
  if (computerUseMode) {
    modeIndicator.textContent = 'Modalità: 🤖 Computer Use (Autonomous)';
  } else {
    modeIndicator.textContent = 'Modalità: 💬 Chat';
  }
}

// Carica impostazioni
async function loadSettings() {
  const result = await chrome.storage.sync.get(['selectedModel', 'computerUseMode']);
  if (result.selectedModel) {
    modelSelector.value = result.selectedModel;
  }
  if (result.computerUseMode !== undefined) {
    computerUseMode = result.computerUseMode;
    computerUseToggle.checked = computerUseMode;
    updateModeIndicator();
  }
}

// Salva impostazioni
async function saveSettings() {
  await chrome.storage.sync.set({
    selectedModel: modelSelector.value,
    computerUseMode: computerUseMode
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
  scrollToBottom();
}

// Mostra messaggio di sistema
function showSystemMessage(message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message system';
  messageDiv.textContent = message;
  chatContainer.appendChild(messageDiv);
  scrollToBottom();
}

// Mostra log azione
function showActionLog(action, details) {
  const logDiv = document.createElement('div');
  logDiv.className = 'action-log';
  logDiv.innerHTML = `
    <span class="action-type">${action}</span>
    ${details ? `<div style="margin-top: 4px; font-size: 10px;">${details}</div>` : ''}
  `;
  chatContainer.appendChild(logDiv);
  scrollToBottom();
}

// Scroll automatico
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Mostra indicatore di caricamento
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message assistant loading';
  loadingDiv.id = 'loading';
  loadingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatContainer.appendChild(loadingDiv);
  scrollToBottom();
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
  scrollToBottom();
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

// Invia messaggio (chat normale o computer use)
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || isLoading) return;

  // Ottieni API key
  const result = await chrome.storage.sync.get(['apiKey']);
  if (!result.apiKey) {
    showError('API key non configurata. Apri le impostazioni.');
    return;
  }

  if (computerUseMode) {
    // Modalità Computer Use
    await sendComputerUseMessage(result.apiKey, message);
  } else {
    // Modalità Chat normale
    await sendNormalChatMessage(result.apiKey, message);
  }
}

// Chat normale (modalità base)
async function sendNormalChatMessage(apiKey, message) {
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

  messageInput.value = '';
  isLoading = true;
  sendBtn.disabled = true;
  showLoading();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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

    addMessageToUI('assistant', assistantMessage);
    conversationHistory.push({ role: 'assistant', content: assistantMessage });

    await saveConversation();

  } catch (error) {
    removeLoading();
    console.error('Error:', error);
    showError(`Errore: ${error.message}`);
    conversationHistory.pop();
  } finally {
    isLoading = false;
    sendBtn.disabled = false;
    messageInput.focus();
  }
}

// Computer Use mode (autonomo)
async function sendComputerUseMessage(apiKey, message) {
  if (!computerUseController) {
    showError('Computer Use Controller non disponibile');
    return;
  }

  addMessageToUI('user', message);
  messageInput.value = '';
  isLoading = true;
  sendBtn.disabled = true;
  stopBtn.classList.add('visible');

  showSystemMessage('🚀 Avvio modalità Computer Use...');

  // Callback per aggiornamenti
  const onUpdate = (update) => {
    switch (update.type) {
      case 'status':
        showSystemMessage(update.message);
        break;

      case 'response':
        // Mostra risposta di Claude
        if (update.data.choices && update.data.choices[0]) {
          const content = update.data.choices[0].message.content;
          if (content && typeof content === 'string') {
            addMessageToUI('assistant', content);
          }
        }
        break;

      case 'action':
        // Mostra azioni eseguite
        if (update.data.toolResults) {
          update.data.toolResults.forEach(toolResult => {
            const toolCall = toolResult.toolCall;
            const input = toolCall.function?.input || {};

            let actionDesc = `${toolCall.function.name}`;
            if (input.action) {
              actionDesc += ` → ${input.action}`;
              if (input.coordinate) {
                actionDesc += ` (${input.coordinate[0]}, ${input.coordinate[1]})`;
              }
              if (input.text) {
                actionDesc += `: "${input.text.substring(0, 50)}"`;
              }
            }

            showActionLog(actionDesc, JSON.stringify(toolResult.result).substring(0, 100));
          });
        }
        break;

      case 'complete':
        showSystemMessage('✅ ' + update.message);
        isLoading = false;
        sendBtn.disabled = false;
        stopBtn.classList.remove('visible');
        break;

      case 'error':
        showError(update.message);
        isLoading = false;
        sendBtn.disabled = false;
        stopBtn.classList.remove('visible');
        break;
    }
  };

  try {
    // Avvia esecuzione autonoma
    await computerUseController.runAutonomous(
      apiKey,
      modelSelector.value,
      message,
      onUpdate
    );
  } catch (error) {
    console.error('Computer Use error:', error);
    showError(`Errore: ${error.message}`);
    isLoading = false;
    sendBtn.disabled = false;
    stopBtn.classList.remove('visible');
  }
}

// Ferma l'esecuzione
function stopExecution() {
  if (computerUseController) {
    computerUseController.stop();
    showSystemMessage('🛑 Esecuzione fermata dall\'utente');
    stopBtn.classList.remove('visible');
    isLoading = false;
    sendBtn.disabled = false;
  }
}
