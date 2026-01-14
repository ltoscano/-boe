// Service Worker per l'estensione Chrome

// Installazione dell'estensione
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Estensione installata!');
    // Apri la pagina delle opzioni al primo avvio
    chrome.runtime.openOptionsPage();
  } else if (details.reason === 'update') {
    console.log('Estensione aggiornata!');
  }

  // Context menu per interagire con Claude dalla selezione di testo
  chrome.contextMenus.create({
    id: 'askClaude',
    title: 'Chiedi a Claude: "%s"',
    contexts: ['selection']
  });
});

// Gestione messaggi da content scripts o popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getApiKey') {
    chrome.storage.sync.get(['apiKey'], (result) => {
      sendResponse({ apiKey: result.apiKey });
    });
    return true; // Mantiene il canale aperto per sendResponse asincrona
  }
});

// Gestione click sul context menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'askClaude') {
    const selectedText = info.selectionText;

    // Salva il testo selezionato per usarlo nel popup
    await chrome.storage.local.set({ pendingQuestion: selectedText });

    // Apri il popup (l'utente dovrà cliccare sull'icona dell'estensione)
    // Non possiamo aprire automaticamente il popup, ma possiamo impostare un badge
    chrome.action.setBadgeText({ text: '1' });
    chrome.action.setBadgeBackgroundColor({ color: '#667eea' });
  }
});
