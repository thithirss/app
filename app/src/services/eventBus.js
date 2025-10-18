import { reactive } from 'vue';

// Criando um barramento de eventos simples para Vue 3
export const eventBus = {
  events: reactive({}),
  
  /**
   * Registra um ouvinte para um evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função a ser executada quando o evento for emitido
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  /**
   * Remove um ouvinte de um evento
   * @param {string} event - Nome do evento
   * @param {Function} callback - Função a ser removida
   */
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  },
  
  /**
   * Emite um evento com os dados fornecidos
   * @param {string} event - Nome do evento
   * @param  {...any} args - Argumentos a serem passados para os callbacks
   */
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(...args);
      });
    }
  }
};