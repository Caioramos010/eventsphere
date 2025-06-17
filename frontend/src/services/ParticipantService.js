// Serviço de Participantes - EventSphere
import { get, post, put } from '../fetchWithAuth';
import API_CONFIG, { buildUrlWithId } from '../config/api';

const ParticipantService = {
  // Convidar participante para evento
  async inviteParticipant(eventId, participantData) {
    try {
      const response = await post(API_CONFIG.ENDPOINTS.PARTICIPANT_INVITE, {
        eventId: eventId,
        ...participantData
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Convite enviado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao enviar convite' };
      }
    } catch (error) {
      console.error('Error inviting participant:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },
  // Atualizar status do participante
  async updateParticipantStatus(participantId, status) {
    try {
      const url = buildUrlWithId(API_CONFIG.ENDPOINTS.PARTICIPANT_STATUS, participantId);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Status atualizado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar status' };
      }
    } catch (error) {
      console.error('Error updating participant status:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },
  
  // Confirmar presença em um evento
  async confirmAttendance(eventId) {
    try {
      const url = `${API_CONFIG.BASE_URL}/api/participant/confirm`;
      const response = await post(url, { eventId });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao confirmar presença' };
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Buscar participantes de um evento
  async getEventParticipants(eventId) {
    try {
      const url = buildUrlWithId(API_CONFIG.ENDPOINTS.EVENTS, eventId) + '/participants';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { success: true, participants: data };
    } catch (error) {
      console.error('Error fetching event participants:', error);
      return { success: false, message: error.message, participants: [] };
    }
  },

  // Confirmar presença no evento
  async confirmPresence(eventId) {
    try {
      const response = await post(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}/confirm`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao confirmar presença' };
      }
    } catch (error) {
      console.error('Error confirming presence:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Cancelar participação no evento
  async cancelParticipation(eventId) {
    try {
      const response = await post(`${API_CONFIG.ENDPOINTS.EVENTS}/${eventId}/cancel`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação cancelada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao cancelar participação' };
      }
    } catch (error) {
      console.error('Error canceling participation:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Marcar presença via QR Code
  async markPresenceByQR(qrCode) {
    try {
      const response = await post(`${API_CONFIG.ENDPOINTS.EVENTS}/qr-presence`, { qrCode });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Presença marcada com sucesso', event: data.event };
      } else {
        return { success: false, message: data.message || 'QR Code inválido' };
      }
    } catch (error) {
      console.error('Error marking presence by QR:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },
  // Buscar estatísticas de participantes
  async getParticipantStats(eventId) {
    try {
      const url = buildUrlWithId(API_CONFIG.ENDPOINTS.EVENTS, eventId) + '/participants/stats';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { success: true, stats: data };
    } catch (error) {
      console.error('Error fetching participant stats:', error);
      return { success: false, message: error.message, stats: {} };
    }
  },

  // Participar diretamente de um evento público
  async joinPublicEvent(eventId) {
    try {
      // Como estamos adicionando o usuário diretamente, vamos usar o endpoint de participantes
      const response = await post(`${API_CONFIG.BASE_URL}/api/participant/join-event`, { eventId });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação no evento confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento' };
      }
    } catch (error) {
      console.error('Error joining public event:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Participar de um evento via convite (eventos privados)
  async joinEventWithInvite(eventId, inviteToken) {
    try {
      const response = await post(`${API_CONFIG.BASE_URL}/api/participant/join-with-invite`, { 
        eventId, 
        inviteToken 
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação no evento confirmada com sucesso via convite' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento via convite' };
      }
    } catch (error) {
      console.error('Error joining event with invite:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Participar de um evento via código (eventos privados)
  async joinEventWithCode(eventId, eventCode) {
    try {
      const response = await post(`${API_CONFIG.BASE_URL}/api/participant/join-with-code`, { 
        eventId, 
        eventCode 
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação no evento confirmada com sucesso via código' };
      } else {
        return { success: false, message: data.message || 'Erro ao participar do evento via código' };
      }
    } catch (error) {
      console.error('Error joining event with code:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Remover participante de um evento
  async removeParticipant(eventId, participantId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/participant/remove/${eventId}/${participantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participante removido com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao remover participante' };
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Confirmar participação de um participante
  async confirmParticipant(eventId, participantId) {
    try {
      const response = await put(`${API_CONFIG.BASE_URL}/api/participant/confirm/${eventId}/${participantId}`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participação confirmada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao confirmar participação' };
      }
    } catch (error) {
      console.error('Error confirming participant:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Promover participante a colaborador
  async promoteToCollaborator(eventId, participantId) {
    try {
      const response = await put(`${API_CONFIG.BASE_URL}/api/participant/promote/${eventId}/${participantId}`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Participante promovido a colaborador' };
      } else {
        return { success: false, message: data.message || 'Erro ao promover participante' };
      }
    } catch (error) {
      console.error('Error promoting participant:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Remover colaborador (rebaixar para participante comum)
  async demoteCollaborator(eventId, participantId) {
    try {
      const response = await put(`${API_CONFIG.BASE_URL}/api/participant/demote/${eventId}/${participantId}`, {});
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Colaborador removido com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao remover colaborador' };
      }
    } catch (error) {
      console.error('Error demoting collaborator:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Gerar QR code para participante
  async generateQrCode(eventId) {
    try {
      const response = await get(`${API_CONFIG.BASE_URL}/api/participant/qr-code/${eventId}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Erro ao gerar QR Code' };
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Obter relatório de presença
  async getAttendanceReport(eventId) {
    try {
      const response = await get(`${API_CONFIG.BASE_URL}/api/participant/attendance-report/${eventId}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, data: data.data };
      } else {
        return { success: false, message: data.message || 'Erro ao obter relatório' };
      }
    } catch (error) {
      console.error('Error getting attendance report:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  }
};

export default ParticipantService;
