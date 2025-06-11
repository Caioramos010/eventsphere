/**
 * Utilidade para gerenciar IDs temporários - EventSphere
 * 
 * Este módulo oferece funções para gerar, validar e gerenciar IDs temporários
 * para eventos que não possuem um ID do servidor.
 */

/**
 * Gera um ID temporário para um evento baseado no nome e timestamp
 * @param {Object} event - O objeto do evento
 * @returns {string} - O ID temporário gerado
 */
export const generateTemporaryId = (event) => {
  const timestamp = Date.now();
  const randomPart = Math.floor(Math.random() * 10000);
  
  // Usar o nome do evento para criar um ID mais legível, se disponível
  if (event && event.name) {
    // Limpar o nome para usar como parte do ID
    const cleanName = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .substring(0, 20); // Limitar tamanho
    
    return `temp_${cleanName}_${timestamp}_${randomPart}`;
  }
  
  // Fallback para quando não há nome do evento
  return `temp_event_${timestamp}_${randomPart}`;
};

/**
 * Verifica se um ID é temporário
 * @param {string} id - O ID a ser verificado
 * @returns {boolean} - Verdadeiro se for um ID temporário
 */
export const isTemporaryId = (id) => {
  return id && typeof id === 'string' && id.startsWith('temp_');
};

/**
 * Salva eventos no cache local
 * @param {string} cacheKey - A chave para armazenar no localStorage
 * @param {Array} events - Array de eventos para armazenar
 */
export const cacheEvents = (cacheKey, events) => {
  try {
    localStorage.setItem(cacheKey, JSON.stringify(events));
    console.log(`${events.length} eventos salvos no cache ${cacheKey}`);
  } catch (error) {
    console.error(`Erro ao salvar cache de eventos ${cacheKey}:`, error);
  }
};

/**
 * Recupera eventos do cache local
 * @param {string} cacheKey - A chave para recuperar do localStorage
 * @returns {Array} - Array de eventos ou array vazio se não houver cache
 */
export const getEventsFromCache = (cacheKey) => {
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error(`Erro ao recuperar cache de eventos ${cacheKey}:`, error);
  }
  return [];
};

/**
 * Procura um evento em todos os caches
 * @param {string} eventId - O ID do evento a ser procurado
 * @returns {Object|null} - O evento encontrado ou null se não for encontrado
 */
export const findEventInCache = (eventId) => {
  if (!eventId) return null;
  
  try {
    // Lista de caches a verificar
    const cacheKeys = ['myEventsCache', 'publicEventsCache'];
    
    for (const cacheKey of cacheKeys) {
      const events = getEventsFromCache(cacheKey);
      const event = events.find(e => e.id === eventId);
      if (event) {
        console.log(`Evento ${eventId} encontrado no cache ${cacheKey}`);
        return event;
      }
    }
  } catch (error) {
    console.error(`Erro ao buscar evento ${eventId} nos caches:`, error);
  }
  
  return null;
};

/**
 * Atualiza o ID de um evento (quando o servidor retorna um ID permanente)
 * @param {string} tempId - O ID temporário do evento
 * @param {string} permanentId - O novo ID permanente
 */
export const updateEventId = (tempId, permanentId) => {
  if (!tempId || !permanentId) return;
  
  try {
    // Lista de caches a atualizar
    const cacheKeys = ['myEventsCache', 'publicEventsCache'];
    
    for (const cacheKey of cacheKeys) {
      const events = getEventsFromCache(cacheKey);
      const updated = events.map(e => {
        if (e.id === tempId) {
          console.log(`Atualizando ID temporário ${tempId} para ID permanente ${permanentId}`);
          return { ...e, id: permanentId, isTemporaryId: false };
        }
        return e;
      });
      
      cacheEvents(cacheKey, updated);
    }
  } catch (error) {
    console.error(`Erro ao atualizar ID do evento ${tempId}:`, error);
  }
};

// Exportar todas as funções
export default {
  generateTemporaryId,
  isTemporaryId,
  cacheEvents,
  getEventsFromCache,
  findEventInCache,
  updateEventId
};
