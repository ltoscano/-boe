// Content script per estrarre informazioni dalla pagina

// Listener per messaggi dal popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContext') {
    const context = extractPageContext();
    sendResponse(context);
  } else if (request.action === 'executeComputerAction') {
    executeComputerAction(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Mantiene il canale aperto per async
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

// ============= COMPUTER USE ACTION EXECUTOR =============

/**
 * Esegue azioni di computer use sulla pagina
 */
async function executeComputerAction(action) {
  console.log('[Computer Use] Executing action:', action);

  try {
    switch (action.type) {
      case 'mouse_move':
        return await executeMouseMove(action.x, action.y);

      case 'left_click':
        return await executeClick('left');

      case 'right_click':
        return await executeClick('right');

      case 'double_click':
        return await executeDoubleClick();

      case 'type':
        return await executeType(action.text);

      case 'key':
        return await executeKey(action.key);

      case 'scroll':
        return await executeScroll(action.direction);

      case 'edit_text':
        return await executeEditText(action.selector, action.oldText, action.newText);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  } catch (error) {
    console.error('[Computer Use] Action failed:', error);
    return { success: false, error: error.message };
  }
}

// Variabile per tracciare la posizione del cursore virtuale
let virtualCursorPosition = { x: 0, y: 0 };
let virtualCursor = null;

/**
 * Crea e mostra il cursore virtuale
 */
function createVirtualCursor() {
  if (!virtualCursor) {
    virtualCursor = document.createElement('div');
    virtualCursor.id = 'claude-virtual-cursor';
    virtualCursor.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      border: 2px solid #667eea;
      border-radius: 50%;
      background: rgba(102, 126, 234, 0.3);
      pointer-events: none;
      z-index: 999999;
      transition: all 0.2s ease;
    `;
    document.body.appendChild(virtualCursor);
  }
  return virtualCursor;
}

/**
 * Muove il mouse (cursore virtuale)
 */
async function executeMouseMove(x, y) {
  virtualCursorPosition = { x, y };

  const cursor = createVirtualCursor();
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;

  console.log(`[Computer Use] Mouse moved to (${x}, ${y})`);
  return { success: true, position: { x, y } };
}

/**
 * Esegue un click
 */
async function executeClick(button = 'left') {
  const { x, y } = virtualCursorPosition;

  // Trova l'elemento sotto il cursore
  const element = document.elementFromPoint(x, y);

  if (element) {
    // Scroll l'elemento in vista se necessario
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Attendi un po' per lo scroll
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simula il click
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y,
      button: button === 'left' ? 0 : 2
    });

    element.dispatchEvent(clickEvent);

    // Effetto visivo
    const cursor = createVirtualCursor();
    cursor.style.transform = 'scale(0.8)';
    setTimeout(() => {
      cursor.style.transform = 'scale(1)';
    }, 100);

    console.log(`[Computer Use] ${button} click at (${x}, ${y}) on`, element);
    return {
      success: true,
      element: {
        tag: element.tagName,
        id: element.id,
        class: element.className,
        text: element.textContent?.substring(0, 100)
      }
    };
  }

  return { success: false, error: 'No element found at position' };
}

/**
 * Esegue un doppio click
 */
async function executeDoubleClick() {
  const { x, y } = virtualCursorPosition;
  const element = document.elementFromPoint(x, y);

  if (element) {
    const dblClickEvent = new MouseEvent('dblclick', {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX: x,
      clientY: y
    });

    element.dispatchEvent(dblClickEvent);

    console.log(`[Computer Use] Double click at (${x}, ${y})`);
    return { success: true };
  }

  return { success: false, error: 'No element found' };
}

/**
 * Digita testo nell'elemento attivo
 */
async function executeType(text) {
  const activeElement = document.activeElement;

  if (activeElement && (
    activeElement.tagName === 'INPUT' ||
    activeElement.tagName === 'TEXTAREA' ||
    activeElement.isContentEditable
  )) {
    // Simula typing carattere per carattere
    for (const char of text) {
      activeElement.value += char;

      // Trigger input event
      const inputEvent = new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        data: char
      });
      activeElement.dispatchEvent(inputEvent);

      // Piccola pausa tra caratteri per sembrare più naturale
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    console.log(`[Computer Use] Typed: "${text}"`);
    return { success: true, text };
  }

  return { success: false, error: 'No active input element' };
}

/**
 * Preme un tasto speciale
 */
async function executeKey(key) {
  const activeElement = document.activeElement || document.body;

  const keyEvent = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key: key,
    code: key
  });

  activeElement.dispatchEvent(keyEvent);

  // Gestisci tasti speciali
  if (key === 'Enter') {
    const form = activeElement.closest('form');
    if (form) {
      form.submit();
    }
  }

  console.log(`[Computer Use] Key pressed: ${key}`);
  return { success: true, key };
}

/**
 * Esegue scroll
 */
async function executeScroll(direction) {
  const scrollAmount = direction === 'up' ? -500 : 500;

  window.scrollBy({
    top: scrollAmount,
    behavior: 'smooth'
  });

  await new Promise(resolve => setTimeout(resolve, 300));

  console.log(`[Computer Use] Scrolled ${direction}`);
  return {
    success: true,
    direction,
    newPosition: window.scrollY
  };
}

/**
 * Modifica testo in un elemento
 */
async function executeEditText(selector, oldText, newText) {
  const element = document.querySelector(selector);

  if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
    const currentValue = element.value;
    element.value = currentValue.replace(oldText, newText);

    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(inputEvent);

    console.log(`[Computer Use] Text edited in ${selector}`);
    return { success: true };
  }

  return { success: false, error: 'Element not found or not editable' };
}

// Rimuovi cursore virtuale quando la pagina viene chiusa
window.addEventListener('beforeunload', () => {
  if (virtualCursor) {
    virtualCursor.remove();
  }
});
