/**
 * Computer Use - Logica per l'automazione browser con Claude
 * Implementa screenshot capture, tool calling, e action execution
 */

class ComputerUseController {
  constructor() {
    this.isRunning = false;
    this.currentTabId = null;
    this.actionHistory = [];
    this.conversationHistory = [];
  }

  /**
   * Cattura screenshot della tab corrente
   */
  async captureScreenshot() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTabId = tab.id;

      // Cattura come data URL
      const dataUrl = await chrome.tabs.captureVisibleTab(null, {
        format: 'png'
      });

      // Converti in base64 senza prefix
      const base64 = dataUrl.split(',')[1];

      return {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: base64
        }
      };
    } catch (error) {
      console.error('Screenshot capture error:', error);
      throw error;
    }
  }

  /**
   * Definizioni dei tool per computer use
   */
  getToolDefinitions() {
    return [
      {
        type: 'computer_20250124',
        name: 'computer',
        display_width_px: 1920,
        display_height_px: 1080,
        display_number: 1
      },
      {
        type: 'text_editor_20250124',
        name: 'str_replace_editor'
      },
      {
        type: 'bash_20250124',
        name: 'bash'
      }
    ];
  }

  /**
   * Invia richiesta a OpenRouter con computer use
   */
  async sendComputerUseRequest(apiKey, model, userMessage, screenshot) {
    const messages = [
      ...this.conversationHistory,
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: screenshot.source
          },
          {
            type: 'text',
            text: userMessage
          }
        ]
      }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'Claude via OpenRouter - Computer Use',
        'anthropic-beta': 'computer-use-2025-01-24'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        tools: this.getToolDefinitions(),
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Esegue un'azione sulla pagina
   */
  async executeAction(action) {
    if (!this.currentTabId) {
      throw new Error('No active tab');
    }

    // Invia l'azione al content script per l'esecuzione
    const response = await chrome.tabs.sendMessage(this.currentTabId, {
      action: 'executeComputerAction',
      data: action
    });

    // Salva nella cronologia
    this.actionHistory.push({
      timestamp: Date.now(),
      action: action,
      result: response
    });

    return response;
  }

  /**
   * Processa la risposta dell'API e esegue tool calls
   */
  async processResponse(response) {
    const message = response.choices[0].message;
    const results = [];

    // Se ci sono tool calls, eseguili
    if (message.tool_calls && message.tool_calls.length > 0) {
      for (const toolCall of message.tool_calls) {
        const result = await this.executeToolCall(toolCall);
        results.push({
          toolCall,
          result
        });
      }
    }

    return {
      message,
      toolResults: results,
      hasToolCalls: message.tool_calls && message.tool_calls.length > 0
    };
  }

  /**
   * Esegue una singola tool call
   */
  async executeToolCall(toolCall) {
    const { name, input } = toolCall.function;

    switch (name) {
      case 'computer':
        return await this.executeComputerTool(input);

      case 'bash':
        return await this.executeBashTool(input);

      case 'str_replace_editor':
        return await this.executeEditorTool(input);

      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  /**
   * Esegue computer tool (screenshot, mouse, keyboard)
   */
  async executeComputerTool(input) {
    const { action, ...params } = input;

    switch (action) {
      case 'screenshot':
        const screenshot = await this.captureScreenshot();
        return { success: true, screenshot: screenshot.source.data };

      case 'mouse_move':
        await this.executeAction({
          type: 'mouse_move',
          x: params.coordinate[0],
          y: params.coordinate[1]
        });
        return { success: true };

      case 'left_click':
        await this.executeAction({ type: 'left_click' });
        return { success: true };

      case 'right_click':
        await this.executeAction({ type: 'right_click' });
        return { success: true };

      case 'double_click':
        await this.executeAction({ type: 'double_click' });
        return { success: true };

      case 'type':
        await this.executeAction({
          type: 'type',
          text: params.text
        });
        return { success: true };

      case 'key':
        await this.executeAction({
          type: 'key',
          key: params.text
        });
        return { success: true };

      case 'scroll':
        await this.executeAction({
          type: 'scroll',
          direction: params.direction || 'down'
        });
        return { success: true };

      default:
        return { error: `Unknown action: ${action}` };
    }
  }

  /**
   * Esegue bash tool (limitato per sicurezza)
   */
  async executeBashTool(input) {
    // Per sicurezza, non eseguiamo comandi bash in un'estensione browser
    return {
      error: 'Bash commands not supported in browser extension',
      output: ''
    };
  }

  /**
   * Esegue editor tool (per editing form/textarea)
   */
  async executeEditorTool(input) {
    // Potrebbe essere usato per modificare contenuto di textarea
    const { command, path, old_str, new_str } = input;

    if (command === 'str_replace') {
      await this.executeAction({
        type: 'edit_text',
        selector: path,
        oldText: old_str,
        newText: new_str
      });
      return { success: true };
    }

    return { error: 'Editor tool not fully implemented' };
  }

  /**
   * Loop principale di esecuzione autonoma
   */
  async runAutonomous(apiKey, model, initialPrompt, onUpdate) {
    this.isRunning = true;
    this.conversationHistory = [];

    try {
      // Cattura screenshot iniziale
      const screenshot = await this.captureScreenshot();

      onUpdate({
        type: 'status',
        message: 'Screenshot catturato, invio richiesta...'
      });

      // Prima richiesta
      let response = await this.sendComputerUseRequest(
        apiKey,
        model,
        initialPrompt,
        screenshot
      );

      onUpdate({
        type: 'response',
        data: response
      });

      // Loop fino a quando non ci sono più tool calls o stop
      let iterations = 0;
      const MAX_ITERATIONS = 50; // Safety limit

      while (this.isRunning && iterations < MAX_ITERATIONS) {
        const processed = await this.processResponse(response);

        onUpdate({
          type: 'action',
          data: processed
        });

        if (!processed.hasToolCalls) {
          // Nessun'altra azione da fare
          break;
        }

        // Aggiorna conversazione con tool results
        this.conversationHistory.push({
          role: 'assistant',
          content: response.choices[0].message.content,
          tool_calls: response.choices[0].message.tool_calls
        });

        this.conversationHistory.push({
          role: 'user',
          content: processed.toolResults.map(r => ({
            type: 'tool_result',
            tool_use_id: r.toolCall.id,
            content: JSON.stringify(r.result)
          }))
        });

        // Attendi un po' prima della prossima iterazione
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Cattura nuovo screenshot
        const newScreenshot = await this.captureScreenshot();

        // Continua la conversazione
        response = await this.sendComputerUseRequest(
          apiKey,
          model,
          'Continue',
          newScreenshot
        );

        iterations++;
      }

      onUpdate({
        type: 'complete',
        message: 'Task completato'
      });

    } catch (error) {
      onUpdate({
        type: 'error',
        message: error.message
      });
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Ferma l'esecuzione
   */
  stop() {
    this.isRunning = false;
  }

  /**
   * Reset dello stato
   */
  reset() {
    this.isRunning = false;
    this.currentTabId = null;
    this.actionHistory = [];
    this.conversationHistory = [];
  }
}

// Esporta per uso globale
window.ComputerUseController = ComputerUseController;
