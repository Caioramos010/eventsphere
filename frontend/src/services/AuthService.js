// Serviço de Autenticação - EventSphere
import { post } from '../fetchWithAuth';
import API_CONFIG from '../config/api';

const AuthService = {
  // Login do usuário
  async login(credentials) {
    try {
      // Validação básica dos dados
      if (!credentials.username || !credentials.password) {
        return { success: false, message: 'Username e senha são obrigatórios' };
      }

      const response = await post(API_CONFIG.ENDPOINTS.LOGIN, credentials);
      const data = await response.json();
      
      if (data.success && data.data && data.data.token) {
        // Salvar token
        localStorage.setItem('token', data.data.token);
        // Como o backend só retorna o token, vamos criar um objeto user básico
        const user = { username: credentials.username };
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user: user, token: data.data.token };
      } else {
        return { success: false, message: data.message || 'Credenciais inválidas' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Tratamento específico de erros
      if (error.message.includes('404')) {
        return { success: false, message: 'Serviço de autenticação não encontrado' };
      } else if (error.message.includes('401')) {
        return { success: false, message: 'Username ou senha incorretos' };
      } else if (error.message.includes('500')) {
        return { success: false, message: 'Erro interno do servidor. Tente novamente.' };
      } else if (error.message.includes('Failed to fetch')) {
        return { success: false, message: 'Erro de conexão. Verifique sua internet.' };
      }
      
      return { success: false, message: error.message || 'Erro de conexão' };
    }
  },

  // Registro do usuário
  async register(userData) {
    try {
      // Validação básica dos dados
      const validation = this.validateRegisterData(userData);
      if (!validation.isValid) {
        return { success: false, message: validation.message };
      }

      const response = await post(API_CONFIG.ENDPOINTS.REGISTER, userData);
      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: data.message || 'Usuário registrado com sucesso' };
      } else {
        return { success: false, message: data.message || 'Erro no registro' };
      }    } catch (error) {
      console.error('Register error:', error);
      
      // Se o erro contém uma mensagem específica do backend, usá-la
      if (error.message && !error.message.includes('HTTP error!')) {
        return { success: false, message: error.message };
      }
      
      // Tratamento específico de erros HTTP
      if (error.message.includes('400')) {
        return { success: false, message: 'Dados inválidos. Verifique os campos e tente novamente.' };
      } else if (error.message.includes('409')) {
        return { success: false, message: 'Username ou email já estão em uso' };
      } else if (error.message.includes('500')) {
        return { success: false, message: 'Erro interno do servidor. Tente novamente.' };
      } else if (error.message.includes('Failed to fetch')) {
        return { success: false, message: 'Erro de conexão. Verifique sua internet.' };
      }
      
      return { success: false, message: 'Erro inesperado. Tente novamente.' };
    }
  },
  // Validação básica dos dados de registro (apenas UX)
  validateRegisterData(userData) {
    if (!userData.name || userData.name.trim().length === 0) {
      return { isValid: false, message: 'Nome é obrigatório' };
    }
    
    if (!userData.username || userData.username.trim().length === 0) {
      return { isValid: false, message: 'Username é obrigatório' };
    }
    
    if (!userData.email || userData.email.trim().length === 0) {
      return { isValid: false, message: 'Email é obrigatório' };
    }
    
    if (!userData.password || userData.password.length === 0) {
      return { isValid: false, message: 'Senha é obrigatória' };
    }
    
    return { isValid: true };
  },

  // Logout do usuário
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Verificar se usuário está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obter dados do usuário atual
  getCurrentUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  // Obter token atual
  getToken() {
    return localStorage.getItem('token');
  },

  // Atualizar dados do usuário atual no localStorage
  updateCurrentUser(updatedUserData) {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updatedUserData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      }
      return { success: false, message: 'Usuário não encontrado no localStorage' };
    } catch (error) {
      console.error('Erro ao atualizar usuário no localStorage:', error);
      return { success: false, message: 'Erro ao atualizar dados do usuário' };
    }
  },

  // Recarregar dados do usuário do servidor (se necessário)
  async refreshUserData() {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'Token não encontrado' };
      }

      // Se o backend tiver um endpoint para obter dados do usuário atual
      // const response = await get(API_CONFIG.ENDPOINTS.GET_CURRENT_USER);
      // const data = await response.json();
      
      // Por enquanto, mantemos os dados que temos
      const currentUser = this.getCurrentUser();
      return { success: true, user: currentUser };
    } catch (error) {
      console.error('Erro ao recarregar dados do usuário:', error);
      return { success: false, message: 'Erro ao recarregar dados do usuário' };
    }
  }
};

export default AuthService;
