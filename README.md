# Claude via OpenRouter - Chrome Extension con Computer Use 🤖

Un'estensione Chrome **avanzata** che porta Claude AI nel tuo browser con capacità di **Computer Use**. Naviga autonomamente siti web, interagisce con elementi della pagina, compila form e molto altro tramite OpenRouter API.

## ✨ Caratteristiche Principali

### 🤖 **Computer Use Mode (Autonomous)**
- 📸 **Screenshot Analysis** - Claude "vede" la pagina web
- 🖱️ **Mouse Control** - Muove il cursore e clicca su elementi
- ⌨️ **Keyboard Input** - Digita testo e compila form
- 🔄 **Autonomous Navigation** - Naviga siti web autonomamente
- 👁️ **Visual Feedback** - Mostra cursore virtuale e azioni in tempo reale
- 🛑 **Safety Controls** - Pulsante stop per fermare l'esecuzione

### 💬 **Chat Mode (Standard)**
- Conversazione testuale normale con Claude
- Inclusione contesto pagina opzionale
- Cronologia conversazioni persistente

### 🎛️ **Altre Features**
- **Selezione modello rapida** - Haiku 3.5, Sonnet 3.5, Opus 3, ecc.
- **Toggle modalità** - Passa facilmente tra Chat e Computer Use
- **Context awareness** - Include URL, titolo e contenuto pagina
- **Action logging** - Visualizza tutte le azioni eseguite da Claude
- **Interfaccia moderna** - UI pulita e intuitiva

## 🚀 Installazione

### 1. Ottieni una API Key di OpenRouter

1. Visita [openrouter.ai/keys](https://openrouter.ai/keys)
2. Crea un account o accedi
3. Genera una nuova API key
4. Copia la chiave (inizia con `sk-or-v1-...`)

### 2. Installa l'estensione

1. Scarica o clona questo repository
2. Apri Chrome e vai su `chrome://extensions/`
3. Abilita la "Modalità sviluppatore" (toggle in alto a destra)
4. Clicca su "Carica estensione non pacchettizzata"
5. Seleziona la cartella dell'estensione

### 3. Configura l'estensione

1. Clicca sull'icona dell'estensione nella toolbar
2. Clicca su "Apri Impostazioni" o sull'icona ⚙️
3. Incolla la tua API key di OpenRouter
4. Scegli il modello predefinito (consigliato: **Claude 3.5 Haiku** o **Sonnet 3.5**)
5. Clicca su "Salva Impostazioni"

## 📖 Come usare

### 🤖 Modalità Computer Use (Autonomous)

**NOTA IMPORTANTE:** Haiku 4.5 e Sonnet 4.5 supportano computer use nativamente!

1. Clicca sull'icona dell'estensione
2. Attiva il toggle **"🤖 Computer Use"**
3. Descrivi il task che vuoi automatizzare, ad esempio:
   - "Cerca 'pizza napoletana' su Google e apri il primo risultato"
   - "Compila il form di contatto con nome: Mario Rossi, email: mario@example.com"
   - "Naviga su Amazon e cerca 'laptop'"
   - "Leggi i primi 3 articoli di questa pagina e fai un riassunto"

4. Claude inizierà a:
   - 📸 Catturare screenshot della pagina
   - 🧠 Analizzare cosa vede
   - 🖱️ Muovere il mouse agli elementi
   - 👆 Cliccare su pulsanti/link
   - ⌨️ Digitare testo nei campi
   - 🔄 Ripetere finché il task non è completo

5. Vedrai in tempo reale:
   - Messaggi di Claude
   - Azioni eseguite (click, typing, scroll)
   - Cursore virtuale viola che si muove

6. Usa il pulsante **"Stop"** per interrompere in qualsiasi momento

#### Esempi di Task Computer Use

```
✅ "Cerca 'weather Milan' su Google"
✅ "Vai su Wikipedia e cerca 'Albert Einstein'"
✅ "Compila il form newsletter con email test@example.com"
✅ "Leggi il titolo e il primo paragrafo di questo articolo"
✅ "Cerca 'best restaurants' e aprimi la mappa"
```

### 💬 Modalità Chat (Standard)

1. Clicca sull'icona dell'estensione
2. Assicurati che il toggle "Computer Use" sia **disattivato**
3. Scrivi il tuo messaggio nella casella di input
4. Premi "Invia" o Invio
5. Attendi la risposta di Claude

#### Includere il contesto della pagina

1. Clicca sull'icona 📄 nell'header
2. L'icona diventerà evidenziata
3. Ora i tuoi messaggi includeranno automaticamente:
   - URL della pagina
   - Titolo della pagina
   - Contenuto testuale principale

### 🎚️ Selezione Modello

Usa il menu a tendina nell'header per scegliere tra:

| Modello | Velocità | Qualità | Computer Use | Costo |
|---------|----------|---------|--------------|-------|
| **Haiku 3.5** | ⚡⚡⚡ | ⭐⭐⭐ | ✅ | 💰 |
| **Sonnet 3.5** | ⚡⚡ | ⭐⭐⭐⭐ | ✅ | 💰💰 |
| **Opus 3** | ⚡ | ⭐⭐⭐⭐⭐ | ❌ | 💰💰💰 |

**Raccomandato per Computer Use:** Haiku 3.5 o Sonnet 3.5

## 🔧 Funzionalità Computer Use

### Azioni Supportate

Claude può eseguire queste azioni sulla pagina:

- **`screenshot`** - Cattura lo stato corrente della pagina
- **`mouse_move`** - Muove il cursore a coordinate specifiche
- **`left_click`** - Click sinistro sull'elemento
- **`right_click`** - Click destro (menu contestuale)
- **`double_click`** - Doppio click
- **`type`** - Digita testo nell'elemento attivo
- **`key`** - Preme tasti speciali (Enter, Tab, ecc.)
- **`scroll`** - Scroll up/down nella pagina

### Feedback Visivo

L'estensione mostra:

- **Cursore virtuale viola** - Segue i movimenti del mouse di Claude
- **Action logs** - Lista di tutte le azioni eseguite
- **System messages** - Stato dell'esecuzione
- **Animazioni click** - Feedback visivo sui click

### Safety Features

- **Pulsante Stop** - Interrompi l'esecuzione in qualsiasi momento
- **Limite iterazioni** - Massimo 50 iterazioni per task (sicurezza)
- **No bash commands** - I comandi bash sono disabilitati per sicurezza
- **User control** - L'utente ha sempre il controllo

## 🏗️ Architettura Tecnica

### Struttura del progetto

```
claude-openrouter-extension/
├── manifest.json          # Configurazione estensione (Manifest V3)
├── popup.html            # UI principale
├── popup.js              # Logica UI e gestione modalità
├── computer-use.js       # Controller Computer Use
├── content.js            # Executor azioni sulla pagina
├── options.html          # Pagina impostazioni
├── options.js            # Logica impostazioni
├── background.js         # Service worker
├── icons/                # Icone estensione
└── README.md            # Documentazione
```

### Flow Computer Use

```
1. User Input → popup.js
2. Screenshot Capture → chrome.tabs.captureVisibleTab()
3. API Request → OpenRouter con tool definitions
4. Claude Response → Tool calls (mouse_move, click, type, ecc.)
5. Action Execution → content.js executor
6. New Screenshot → Feedback loop
7. Repeat until task complete
```

### API Integration

L'estensione usa:

- **OpenRouter API** - `/v1/chat/completions` endpoint
- **Beta Header** - `anthropic-beta: computer-use-2025-01-24`
- **Tools**:
  - `computer_20250124` - Screenshot e azioni
  - `text_editor_20250124` - Editing testo
  - `bash_20250124` - Comandi bash (disabilitato)

## 💰 Costi

OpenRouter addebita in base all'uso. I costi per Computer Use:

| Modello | Input (1M token) | Output (1M token) | Screenshot (~10KB) |
|---------|------------------|-------------------|--------------------|
| **Haiku 3.5** | $1 | $5 | ~$0.001 |
| **Sonnet 3.5** | $3 | $15 | ~$0.003 |

**Nota:** Computer Use richiede screenshot ripetuti, il costo può aumentare rapidamente. Usa Haiku 3.5 per task semplici.

OpenRouter offre **$5 crediti gratuiti** per iniziare!

## 🛠️ Sviluppo e Customizzazione

### Debug

- **Popup**: Tasto destro sul popup → Ispeziona
- **Background**: `chrome://extensions/` → Dettagli → Ispeziona service worker
- **Content script**: DevTools su qualsiasi pagina → Console (guarda log con `[Computer Use]`)

### Modificare le Azioni

Aggiungi nuove azioni in `content.js` → `executeComputerAction()`:

```javascript
case 'my_custom_action':
  return await myCustomAction(action.params);
```

### Aggiungere Modelli

Modifica `popup.html` → `#modelSelector`:

```html
<option value="anthropic/claude-haiku-4.5">Haiku 4.5</option>
```

## ❓ FAQ

**Q: Quali modelli supportano Computer Use?**
A: Claude 3.5 Haiku, Sonnet 3.5, Haiku 4.5, Sonnet 4.5, e Opus 4.1 supportano computer use.

**Q: Funziona su tutti i siti web?**
A: Sì, ma alcuni siti con protezioni anti-bot potrebbero bloccare le azioni automatiche.

**Q: Quanto costa usare Computer Use?**
A: Dipende dal modello e dal numero di screenshot. Haiku 3.5 è il più economico (~$0.001 per screenshot).

**Q: È sicuro?**
A: L'estensione ha limiti di sicurezza (max iterazioni, no bash), ma supervisiona sempre Claude per evitare azioni indesiderate.

**Q: Posso usare l'API diretta di Anthropic invece di OpenRouter?**
A: Sì, ma devi modificare l'URL e l'autenticazione in `computer-use.js` e `popup.js`.

**Q: Claude può navigare su più tab?**
A: No, lavora solo sulla tab attiva corrente.

**Q: Posso salvare le sessioni Computer Use?**
A: Al momento no, ma puoi estendere il codice per salvare l'`actionHistory`.

## 🎯 Esempi d'Uso Avanzati

### Ricerca e Raccolta Dati

```
"Cerca 'best pizza restaurants in Milan' su Google e fai uno screenshot dei primi 3 risultati"
```

### Compilazione Form

```
"Compila il form con:
- Nome: Mario Rossi
- Email: mario.rossi@example.com
- Messaggio: Vorrei maggiori informazioni"
```

### Navigation

```
"Vai su news.ycombinator.com, apri il primo articolo, e dimmi di cosa parla"
```

### Comparazione

```
"Cerca 'laptop' su Amazon e eBay e confronta i primi risultati"
```

## ⚠️ Limitazioni

- **No multi-tab** - Lavora solo su una tab alla volta
- **No file upload** - Non può caricare file
- **No download** - Non può scaricare file
- **Rate limits** - OpenRouter ha rate limit API
- **Siti protetti** - Alcuni siti bloccano automazione

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di:

- Segnalare bug
- Proporre nuove funzionalità
- Migliorare la documentazione
- Inviare pull request

## 📄 Licenza

MIT License - Usa liberamente questo codice!

## ⚠️ Disclaimer

Questa è un'estensione **non ufficiale**. Non è affiliata con Anthropic o OpenRouter.

**IMPORTANTE:** L'automazione di siti web può violare i Terms of Service di alcuni siti. Usa responsabilmente e solo su siti dove hai il permesso.

## 🔗 Link utili

- [OpenRouter](https://openrouter.ai/)
- [Documentazione API OpenRouter](https://openrouter.ai/docs)
- [Computer Use Documentation](https://docs.anthropic.com/claude/docs/computer-use)
- [Modelli disponibili](https://openrouter.ai/models)
- [Estensione ufficiale Claude](https://chrome.google.com/webstore/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)

---

**Fatto con ❤️ per la community** | v2.0.0 - Computer Use Edition
