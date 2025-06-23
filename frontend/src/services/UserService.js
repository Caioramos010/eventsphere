import { get, put, uploadFile, fetchWithAuth } from '../fetchWithAuth';
import API_CONFIG from '../config/api';
import AuthService from './AuthService';


const buildUrlWithId = (baseUrl, id) => {
  return `${baseUrl}/${id}`;
};

const UserService = {  
  async updateEmail(newEmail) {
    try {
      const response = await put(`${API_CONFIG.ENDPOINTS.USER_UPDATE_EMAIL}?newEmail=${encodeURIComponent(newEmail)}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        
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
  
  async updateUsername(newUsername) {
    try {
      const response = await put(`${API_CONFIG.ENDPOINTS.USER_UPDATE_USERNAME}?newUsername=${encodeURIComponent(newUsername)}`);
      const data = await response.json();
      
      if (data.success || response.ok) {
        
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
  async uploadUserPhoto(imageFile) {
    try {
      const formData = new FormData();
      formData.append('photo', imageFile);
      const response = await uploadFile(API_CONFIG.ENDPOINTS.USER_PHOTO, formData);
      const data = await response.json();
      
      if (data.success || response.ok) {
        
        const photoBase64 = data.data?.photoBase64 || data.photoBase64;
        
        
        AuthService.updateCurrentUser({ photo: photoBase64 });
        
        return { 
          success: true, 
          photoUrl: photoBase64, 
          photoBase64: photoBase64 
        };
      } else {
        return { success: false, message: data.message || 'Erro ao fazer upload da foto' };
      }
    } catch (error) {
      console.error('Error uploading user photo:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  
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

  
  async deleteAccount(password) {
    try {
      const url = `${API_CONFIG.ENDPOINTS.USER_DELETE}?password=${encodeURIComponent(password)}`;
      // Use fetchWithAuth to ensure Authorization header is included
      const response = await fetchWithAuth(url, {
        method: 'DELETE',
        // No need to set credentials or headers, fetchWithAuth handles it
      });
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }
      if ((data && (data.success || response.ok)) || response.status === 204) {
        AuthService.logout();
        return { success: true, message: (data && data.message) || 'Conta deletada com sucesso' };
      } else if (response.status === 401 || response.status === 403) {
        return { success: false, message: (data && data.message) || 'Acesso negado. Faça login novamente.' };
      } else {
        return { success: false, message: (data && data.message) || 'Erro ao deletar conta' };
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  /**
   * Busca o perfil do usuário autenticado e atualiza o AuthService/localStorage,
   * garantindo que o campo da foto seja persistido na sessão.
   */
  async fetchCurrentUserProfileAndSync() {
    try {
      const response = await get(API_CONFIG.ENDPOINTS.USER_PROFILE);
      const data = await response.json();
      const userData = data.data || data; // pega o objeto do usuário dentro de ApiResponse
      if (userData && (data.success === undefined || data.success === true)) {
        AuthService.updateCurrentUser({
          username: userData.username,
          email: userData.email,
          photo: userData.photo || userData.photoBase64 || '',
          id: userData.id,
          name: userData.name,
        });
        return { success: true, user: userData };
      } else {
        return { success: false, message: data.message || 'Erro ao buscar perfil do usuário' };
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  }
};

export default UserService;
