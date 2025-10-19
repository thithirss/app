import { reactive } from 'vue';


export const eventBus = {
  events: reactive({}),
  
  /**
   * 
   * @param {string} event 
   * @param {Function} callback 
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  /**
   * o
   * @param {string} event 
   * @param {Function} callback 
   */
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  },
  
  /**
   * 
   * @param {string} event 
   * @param  {...any} args 
   */
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(...args);
      });
    }
  }
};