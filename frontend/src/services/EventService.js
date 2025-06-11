// Serviço de Eventos - EventSphere
import { get, post, put, del, uploadFile } from '../fetchWithAuth';
import API_CONFIG, { buildUrl } from '../config/api';
import tempIdManager from '../utils/tempIdManager';

const EventService = {
  // Buscar todos os eventos públicos
  async getPublicEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.PUBLIC_EVENTS);
      const data = await response.json();
      console.log('Dados de eventos públicos recebidos:', data);
      
      // Processar os eventos recebidos
      const events = (data.data || data || []).map(event => {
        // Se não tiver ID, geramos um log de aviso
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching public events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  // Buscar meus eventos
  async getMyEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.MY_EVENTS);
      const data = await response.json();
      console.log('Dados de meus eventos recebidos:', data);
      
      // Processar os eventos recebidos
      const events = (data.data || data || []).map(event => {
        // Se não tiver ID, geramos um log de aviso
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      console.error('Error fetching my events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  // Buscar detalhes de um evento específico
  async getEventDetails(eventId) {
    try {
      // Verificar se o ID é válido
      if (!eventId) {
        console.error('ID do evento não fornecido');
        return { 
          success: false, 
          message: 'ID do evento não fornecido ou inválido' 
        };
      }
      
      console.log('Fetching event details for ID:', eventId);
      
      // Verificar se é um ID temporário
      if (eventId.startsWith('temp_')) {
        console.log('ID temporário detectado. Buscando do cache local...');
        
        // Buscar evento do cache local
        try {
          const myEventsCache = localStorage.getItem('myEventsCache');
          const publicEventsCache = localStorage.getItem('publicEventsCache');
          
          let events = [];
          if (myEventsCache) {
            events = events.concat(JSON.parse(myEventsCache));
          }
          if (publicEventsCache) {
            events = events.concat(JSON.parse(publicEventsCache));
          }
          
          const event = events.find(e => e.id === eventId);
          
          if (event) {
            console.log('Evento encontrado no cache:', event);
            return { success: true, event };
          } else {
            console.warn('Evento com ID temporário não encontrado no cache');
          }
        } catch (cacheError) {
          console.error('Erro ao buscar evento do cache:', cacheError);
        }
      }
      
      // Construir a URL manualmente para evitar problemas
      const endpoint = API_CONFIG.ENDPOINTS.EVENT_GET;
      let url = `${API_CONFIG.BASE_URL}${endpoint}?eventID=${eventId}`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // Verificar se o evento tem ID, se não tiver, usar o ID da URL
      if (data.success || response.ok) {
        const eventData = data.data || data.event || data;
        if (!eventData.id && eventId) {
          console.log('Evento sem ID recebido do servidor. Usando ID da URL:', eventId);
          eventData.id = eventId;
        }
        return { success: true, event: eventData };
      } else {
        return { success: false, message: data.message || 'Erro ao buscar evento' };
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },
  
  // Criar novo evento
  async createEvent(eventData) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.EVENT_CREATE, eventData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, event: data.data || data.event || data, message: data.message || 'Evento criado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao criar evento' };
      }
    } catch (error) {
      console.error('Error creating event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Atualizar evento
  async updateEvent(eventId, eventData) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_EDIT, { eventID: eventId });
      const response = await put(url, eventData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, event: data.data || data.event || data, message: data.message || 'Evento atualizado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar evento' };
      }
    } catch (error) {
      console.error('Error updating event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Deletar evento
  async deleteEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_DELETE, { eventID: eventId });
      const response = await del(url);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message || 'Evento deletado com sucesso' };
      } else {
        const data = await response.json();
        return { success: false, message: data.message || 'Erro ao deletar evento' };
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Validar convite
  async validateInvite(token, code) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.INVITE_VALIDATE, { token, code });
      const response = await get(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: data.message || 'Convite válido' };
      } else {
        return { success: false, message: data.message || 'Convite inválido' };
      }
    } catch (error) {
      console.error('Error validating invite:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Participar de evento por convite
  async joinEventByInvite(inviteToken, inviteCode) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.PARTICIPANT_ADD, {
        inviteToken,
        inviteCode
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: data.message || 'Participação confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento' };
      }
    } catch (error) {
      console.error('Error joining event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Upload de imagem do evento
  async uploadEventImage(eventId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_IMAGE, { eventID: eventId });
      const response = await uploadFile(url, formData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          imageUrl: data.imageUrl || data.image || data.url,
          message: 'Imagem carregada com sucesso'
        };
      } else {
        return { success: false, message: data.message || 'Erro ao fazer upload da imagem' };
      }
    } catch (error) {
      console.error('Error uploading event image:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Buscar eventos por filtros
  async searchEvents(filters = {}) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_GET, filters);
      const response = await get(url);
      const data = await response.json();
      return { success: true, events: data.data || data };
    } catch (error) {
      console.error('Error searching events:', error);
      return { success: false, message: error.message, events: [] };
    }
  },

  // Iniciar um evento
  async startEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_START, { eventID: eventId });
      const response = await post(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          message: data.message || 'Evento iniciado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao iniciar o evento' };
      }
    } catch (error) {
      console.error('Error starting event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Finalizar um evento
  async finishEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_FINISH, { eventID: eventId });
      const response = await post(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          message: data.message || 'Evento finalizado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao finalizar o evento' };
      }
    } catch (error) {
      console.error('Error finishing event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Cancelar um evento
  async cancelEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_CANCEL, { eventID: eventId });
      const response = await post(url);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { 
          success: true, 
          message: data.message || 'Evento cancelado com sucesso' 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao cancelar o evento' };
      }
    } catch (error) {
      console.error('Error cancelling event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  }
};

export default EventService;

