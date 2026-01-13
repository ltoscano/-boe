# Claude via OpenRouter - Chrome Extension

Un'estensione Chrome che ti permette di chattare con Claude (e altri modelli AI) usando OpenRouter. Questa estensione replica le funzionalità dell'estensione ufficiale Claude, ma offre la flessibilità di scegliere tra diversi modelli, incluso Claude Haiku 4.5.

## ✨ Caratteristiche

- 💬 **Chat interattiva** con Claude direttamente dal browser
- 🔄 **Cambio rapido modello** - scegli tra Haiku, Sonnet, Opus e altri
- 📄 **Context awareness** - includi il contenuto della pagina corrente nelle tue domande
- 💾 **Cronologia conversazioni** - le tue chat vengono salvate automaticamente
- 🎨 **Interfaccia moderna** - design pulito e intuitivo
- 🔒 **Sicuro** - la tua API key è salvata localmente nel browser

## 🚀 Installazione

### 1. Ottieni una API Key di OpenRouter

1. Visita [openrouter.ai/keys](https://openrouter.ai/keys)
2. Crea un account o accedi
3. Genera una nuova API key
4. Copia la chiave (inizia con `sk-or-v1-...`)

### 2. Installa l'estensione

#### Opzione A: Da repository locale

1. Scarica o clona questo repository
2. Apri Chrome e vai su `chrome://extensions/`
3. Abilita la "Modalità sviluppatore" (toggle in alto a destra)
4. Clicca su "Carica estensione non pacchettizzata"
5. Seleziona la cartella dell'estensione

#### Opzione B: Da file .zip

1. Scarica il file .zip dell'estensione
2. Estrai il contenuto in una cartella
3. Segui i passi dell'Opzione A dal punto 2

### 3. Configura l'estensione

1. Clicca sull'icona dell'estensione nella toolbar
2. Clicca su "Apri Impostazioni" o sull'icona ⚙️
3. Incolla la tua API key di OpenRouter
4. Scegli il modello predefinito (consigliato: Claude 3.5 Haiku)
5. Clicca su "Salva Impostazioni"

## 📖 Come usare

### Chat base

1. Clicca sull'icona dell'estensione nella toolbar
2. Scrivi il tuo messaggio nella casella di input
3. Premi "Invia" o Invio
4. Attendi la risposta di Claude

### Includere il contesto della pagina

1. Apri l'estensione
2. Clicca sull'icona 📄 nell'header
3. L'icona diventerà evidenziata
4. Ora i tuoi messaggi includeranno automaticamente:
   - URL della pagina
   - Titolo della pagina
   - Contenuto testuale principale

### Cambiare modello

Usa il menu a tendina nell'header per scegliere tra:

- **Claude 3.5 Haiku** - Veloce ed economico, ottimo per task quotidiani
- **Claude 3.5 Sonnet** - Bilanciato tra velocità e qualità
- **Claude 3 Opus** - Massima intelligenza per task complessi
- **Claude 3 Sonnet** - Versione precedente di Sonnet
- **Claude 3 Haiku** - Versione precedente di Haiku

### Menu contestuale

1. Seleziona del testo su qualsiasi pagina web
2. Tasto destro → "Chiedi a Claude: [testo selezionato]"
3. Apri l'estensione per vedere la risposta

## 🔧 Funzionalità avanzate

### Cancellare la cronologia

1. Apri le Impostazioni (⚙️)
2. Clicca su "Cancella Cronologia Chat"
3. Conferma l'azione

### Personalizzare le icone

Le icone predefinite sono placeholder. Per personalizzarle:

1. Crea tre immagini PNG:
   - `icon16.png` (16x16 px)
   - `icon48.png` (48x48 px)
   - `icon128.png` (128x128 px)
2. Sostituisci i file nella cartella `icons/`
3. Ricarica l'estensione da `chrome://extensions/`

Puoi usare il file `icons/icon.svg` come base per creare le tue icone.

## 💰 Costi

OpenRouter addebita in base all'uso. I costi variano per modello:

- **Haiku 3.5**: ~$0.001 per 1K token (molto economico)
- **Sonnet 3.5**: ~$0.003 per 1K token (medio)
- **Opus 3**: ~$0.015 per 1K token (premium)

Controlla i prezzi aggiornati su [openrouter.ai/models](https://openrouter.ai/models)

OpenRouter offre crediti gratuiti per iniziare!

## 🛠️ Sviluppo

### Struttura del progetto

```
claude-openrouter-extension/
├── manifest.json          # Configurazione estensione
├── popup.html            # UI principale
├── popup.js              # Logica chat e API
├── options.html          # Pagina impostazioni
├── options.js            # Logica impostazioni
├── background.js         # Service worker
├── content.js            # Script pagina
├── icons/                # Icone estensione
└── README.md            # Questo file
```

### Personalizzazione

Per modificare l'estensione:

1. Modifica i file necessari
2. Vai su `chrome://extensions/`
3. Clicca sull'icona di ricarica per l'estensione
4. Testa le modifiche

### Debug

- Popup: Tasto destro sul popup → Ispeziona
- Background: `chrome://extensions/` → Dettagli → Ispeziona visualizzazioni → service worker
- Content script: Apri DevTools su qualsiasi pagina → Console

## ❓ FAQ

**Q: Posso usare altri modelli oltre a Claude?**
A: Sì! OpenRouter supporta molti modelli. Modifica il file `popup.html` per aggiungere altre opzioni al menu `modelSelector`.

**Q: La mia API key è sicura?**
A: Sì, viene salvata localmente nel browser usando Chrome Storage. Non viene mai inviata a server esterni (tranne OpenRouter per le API call).

**Q: Posso usare questa estensione con l'API diretta di Anthropic?**
A: No, questa estensione è progettata specificamente per OpenRouter. Per usare l'API diretta, dovresti modificare l'URL e l'autenticazione in `popup.js`.

**Q: Funziona offline?**
A: No, richiede una connessione internet per comunicare con OpenRouter.

## 🤝 Contributi

I contributi sono benvenuti! Sentiti libero di:

- Segnalare bug
- Proporre nuove funzionalità
- Migliorare la documentazione
- Inviare pull request

## 📄 Licenza

MIT License - Usa liberamente questo codice per i tuoi progetti!

## ⚠️ Disclaimer

Questa è un'estensione non ufficiale. Non è affiliata con Anthropic o OpenRouter. Usa a tuo rischio.

## 🔗 Link utili

- [OpenRouter](https://openrouter.ai/)
- [Documentazione API OpenRouter](https://openrouter.ai/docs)
- [Modelli disponibili](https://openrouter.ai/models)
- [Estensione ufficiale Claude](https://chrome.google.com/webstore/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)

---

Fatto con ❤️ per la community
