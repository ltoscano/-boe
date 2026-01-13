// Elementi DOM
const settingsForm = document.getElementById('settingsForm');
const apiKeyInput = document.getElementById('apiKey');
const defaultModelSelect = document.getElementById('defaultModel');
const successMessage = document.getElementById('successMessage');
const clearHistoryBtn = document.getElementById('clearHistory');

// Carica impostazioni salvate
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.sync.get(['apiKey', 'selectedModel']);

  if (result.apiKey) {
    apiKeyInput.value = result.apiKey;
  }

  if (result.selectedModel) {
    defaultModelSelect.value = result.selectedModel;
  }
});

// Salva impostazioni
settingsForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const selectedModel = defaultModelSelect.value;

  if (!apiKey) {
    alert('Inserisci una API key valida');
    return;
  }

  // Salva in Chrome storage
  await chrome.storage.sync.set({
    apiKey: apiKey,
    selectedModel: selectedModel
  });

  // Mostra messaggio di successo
  successMessage.style.display = 'block';
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 3000);
});

// Cancella cronologia chat
clearHistoryBtn.addEventListener('click', async () => {
  if (confirm('Sei sicuro di voler cancellare tutta la cronologia della chat?')) {
    await chrome.storage.local.remove(['conversation']);
    alert('Cronologia cancellata con successo!');
  }
});
