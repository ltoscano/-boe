// Content script per estrarre informazioni dalla pagina

// Listener per messaggi dal popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContext') {
    const context = extractPageContext();
    sendResponse(context);
  }
  return true;
});

// Estrai il contesto della pagina
function extractPageContext() {
  return {
    url: window.location.href,
    title: document.title,
    text: extractMainText(),
    selection: window.getSelection().toString()
  };
}

// Estrai il testo principale dalla pagina
function extractMainText() {
  // Rimuovi script, style e altri elementi non testuali
  const clone = document.body.cloneNode(true);

  // Rimuovi elementi non rilevanti
  const selectorsToRemove = [
    'script',
    'style',
    'noscript',
    'iframe',
    'nav',
    'header',
    'footer',
    'aside',
    '.advertisement',
    '.ad',
    '.sidebar'
  ];

  selectorsToRemove.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Estrai il testo
  let text = clone.innerText || clone.textContent;

  // Pulisci il testo
  text = text
    .replace(/\s+/g, ' ')  // Riduci spazi multipli
    .replace(/\n\s*\n/g, '\n')  // Riduci righe vuote multiple
    .trim();

  // Limita la lunghezza
  const maxLength = 5000;
  if (text.length > maxLength) {
    text = text.substring(0, maxLength) + '...[testo troncato]';
  }

  return text;
}

// Monitora la selezione di testo
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString();
  if (selectedText && selectedText.length > 0) {
    // Potenzialmente mostra un tooltip o un'azione rapida
    // Per ora non facciamo nulla, ma è pronto per future funzionalità
  }
});
