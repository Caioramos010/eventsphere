import { get, post, put, del, uploadFile } from '../fetchWithAuth';
import API_CONFIG, { buildUrl } from '../config/api';
import { handleServiceError } from '../utils/errorHandler';

const EventService = {
  
  async getPublicEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.PUBLIC_EVENTS);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      return handleServiceError(error, 'EventService.getPublicEvents');
    }
  },

  async getMyEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.MY_EVENTS);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      return handleServiceError(error, 'EventService.getMyEvents');
    }
  },

  async getAllMyEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.ALL_MY_EVENTS);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      return handleServiceError(error, 'EventService.getAllMyEvents');
    }
  },

  async getEventDetails(eventId) {
    try {
      if (!eventId) {
        return { 
          success: false, 
          message: 'ID do evento não fornecido ou inválido' 
        };
      }

      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_GET, { id: eventId });
      const response = await get(url);
      const data = await response.json();
      
      if (data.success) {
        return { 
          success: true, 
          event: data.data,
          message: data.message 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Erro ao carregar evento' 
        };
      }
    } catch (error) {
      return handleServiceError(error, 'EventService.getEventDetails');
    }
  },

  async createEvent(eventData) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.EVENT_CREATE, eventData);
      const data = await response.json();
      
      return { 
        success: data.success || response.ok, 
        event: data.data || data.event,
        message: data.message || 'Evento criado com sucesso' 
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.createEvent');
    }
  },

  async updateEvent(eventId, eventData) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_UPDATE, { id: eventId });
      const response = await put(url, eventData);
      const data = await response.json();
      
      return { 
        success: data.success || response.ok, 
        message: data.message || 'Evento atualizado com sucesso' 
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.updateEvent');
    }
  },

  async deleteEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_DELETE, { id: eventId });
      const response = await del(url);
      const data = await response.json();
      
      return { 
        success: data.success || response.ok, 
        message: data.message || 'Evento deletado com sucesso' 
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.deleteEvent');
    }
  },

  async generateInviteLink(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.INVITE_GENERATE, { id: eventId });
      const response = await get(url);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        inviteUrl: data.data?.inviteUrl || data.inviteUrl,
        inviteToken: data.data?.inviteToken || data.inviteToken,
        message: data.message || 'Link de convite gerado com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.generateInviteLink');
    }
  },

  async generateEventCode(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_CODE_GENERATE, { id: eventId });
      const response = await get(url);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        eventCode: data.data?.eventCode || data.eventCode,
        message: data.message || 'Código do evento gerado com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.generateEventCode');
    }
  },

  async validateInviteToken(token) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.INVITE_GET, { token });
      const response = await get(url);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        event: data.data || data.event,
        message: data.message || 'Token válido'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.validateInviteToken');
    }
  },

  async joinEventByInvite(inviteToken, inviteCode = null) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.INVITE_JOIN, { token: inviteToken });
      const body = inviteCode ? { inviteCode } : {};
      const response = await post(url, body);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        message: data.message || 'Participação confirmada com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.joinEventByInvite');
    }
  },

  async validateEventCode(eventCode) {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.EVENT_CODE_VALIDATE, { eventCode });
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        event: data.data || data.event,
        message: data.message || 'Código válido'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.validateEventCode');
    }
  },

  async getParticipatingEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.PARTICIPATING_EVENTS);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      return handleServiceError(error, 'EventService.getParticipatingEvents');
    }
  },

  async getNextEvents() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.NEXT_EVENTS);
      const data = await response.json();
      
      const events = (data.data || data || []).map(event => {
        if (!event.id) {
          console.warn('Evento sem ID encontrado:', event);
        }
        return event;
      });
      
      return { success: true, events };
    } catch (error) {
      return handleServiceError(error, 'EventService.getNextEvents');
    }
  },

  async uploadEventImage(eventId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('eventId', eventId);
      
      const response = await uploadFile(API_CONFIG.ENDPOINTS.EVENT_IMAGE, formData);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        imageUrl: data.data?.imageUrl || data.imageUrl,
        message: data.message || 'Imagem enviada com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.uploadEventImage');
    }
  },

  async startEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_START, { id: eventId });
      const response = await put(url);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        message: data.message || 'Evento iniciado com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.startEvent');
    }
  },

  async finishEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_FINISH, { id: eventId });
      const response = await put(url);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        message: data.message || 'Evento finalizado com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.finishEvent');
    }
  },

  async cancelEvent(eventId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.EVENT_CANCEL, { id: eventId });
      const response = await put(url);
      const data = await response.json();
      
      return {
        success: data.success || response.ok,
        message: data.message || 'Evento cancelado com sucesso'
      };
    } catch (error) {
      return handleServiceError(error, 'EventService.cancelEvent');
    }
  }
};

export default EventService;
