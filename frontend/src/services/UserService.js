// Serviço de Usuários - EventSphere
import { get, put, uploadFile } from '../fetchWithAuth';
import API_CONFIG from '../config/api';
import AuthService from './AuthService';

// Função utilitária para construir URL com ID
const buildUrlWithId = (baseUrl, id) => {
  return `${baseUrl}/${id}`;
};

const UserService = {  // Atualizar email do usuário
  async updateEmail(newEmail) {
    try {
      const response = await put(`${API_CONFIG.ENDPOINTS.USER_UPDATE_EMAIL}?newEmail=${encodeURIComponent(newEmail)}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        // Atualizar email no localStorage usando AuthService
        AuthService.updateCurrentUser({ email: newEmail });
        
        return { success: true, message: data.message || 'Email atualizado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar email' };
      }
    } catch (error) {
      console.error('Error updating email:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },
  // Atualizar username do usuário
  async updateUsername(newUsername) {
    try {
      const response = await put(`${API_CONFIG.ENDPOINTS.USER_UPDATE_USERNAME}?newUsername=${encodeURIComponent(newUsername)}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        // Atualizar username no localStorage usando AuthService
        AuthService.updateCurrentUser({ username: newUsername });
        
        return { success: true, message: data.message || 'Login atualizado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar login' };
      }
    } catch (error) {
      console.error('Error updating username:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Atualizar senha do usuário
  async updatePassword(currentPassword, newPassword) {
    try {
      const response = await put(`${API_CONFIG.ENDPOINTS.USER_UPDATE_PASSWORD}?currentPassword=${encodeURIComponent(currentPassword)}&newPassword=${encodeURIComponent(newPassword)}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: data.message || 'Senha atualizada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao atualizar senha' };
      }
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Upload de foto do usuário
  async uploadUserPhoto(imageFile) {
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);
        const response = await uploadFile(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/photo`, formData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        // Atualizar foto no localStorage usando AuthService
        AuthService.updateCurrentUser({ photo: data.photoUrl || data.url });
        
        return { success: true, photoUrl: data.photoUrl || data.url };
      } else {
        return { success: false, message: data.message || 'Erro ao fazer upload da foto' };
      }
    } catch (error) {
      console.error('Error uploading user photo:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Buscar usuário por ID
  async getUserById(userId) {
    try {
      const url = buildUrlWithId(API_CONFIG.ENDPOINTS.USERS, userId);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      return { success: true, user: data };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return { success: false, message: error.message };
    }
  },

  // Buscar usuários (para busca de participantes)
  async searchUsers(query) {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.USERS, { search: query });
      const data = await response.json();
      return { success: true, users: data };
    } catch (error) {
      console.error('Error searching users:', error);
      return { success: false, message: error.message, users: [] };
    }
  },

  // Alterar senha do usuário
  async changePassword(passwordData) {
    try {
      const response = await put(`${API_CONFIG.ENDPOINTS.USER_PROFILE}/password`, passwordData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        return { success: true, message: 'Senha alterada com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro ao alterar senha' };
      }
    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Deletar conta do usuário
  async deleteAccount() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_PROFILE}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Limpar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: true, message: 'Conta deletada com sucesso' };
      } else {
        const data = await response.json();
        return { success: false, message: data.message || 'Erro ao deletar conta' };
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  }
};

export default UserService;
