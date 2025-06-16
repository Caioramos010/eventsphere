// Configurações da API - EventSphere
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/login/accept',
    REGISTER: '/register/accept',
      // User endpoints
    USER_UPDATE_EMAIL: '/api/user/update-email',
    USER_UPDATE_USERNAME: '/api/user/update-username',
    USER_UPDATE_PASSWORD: '/api/user/update-passowrd',
    
    // Event endpoints
    EVENT_CREATE: '/api/event/register',
    EVENT_EDIT: '/api/event/edit',
    EVENT_GET: '/api/event/get',
    EVENT_DELETE: '/api/event/delete',
    EVENT_IMAGE: '/api/upload/event-image',
    MY_EVENTS: '/api/event/get-myevents',
    PUBLIC_EVENTS: '/api/event/get-public',
    EVENT_START: '/api/event/start',
    EVENT_FINISH: '/api/event/finish',    EVENT_CANCEL: '/api/event/cancel',
    INVITE_GENERATE: '/api/event/invite/generate',
    INVITE_VALIDATE: '/api/event/invite/validate',// Upload endpoints
    USER_PHOTO: '/api/upload/user-photo',
    FILE_DOWNLOAD: '/api/files',
    
    // Participant endpoints
    PARTICIPANT_ADD: '/api/participant/add',
    PARTICIPANT_REMOVE: '/api/participant/remove',
    
    // Admin endpoints
    ADMIN: '/admin'
  },
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout padrão (30 segundos)
  TIMEOUT: 30000
};

export default API_CONFIG;

// Função utilitária para construir URLs completas
export const buildUrl = (endpoint, params = {}) => {
  // Verifica se o endpoint já é uma URL completa
  if (endpoint.startsWith('http')) {
    console.log('URL já completa detectada:', endpoint);
    
    // Se já for uma URL completa, adicionar apenas os parâmetros
    if (Object.keys(params).length > 0) {
      const url = new URL(endpoint);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
      console.log('URL com parâmetros:', url.toString());
      return url.toString();
    }
    
    return endpoint;
  }
  
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('Building URL from:', API_CONFIG.BASE_URL, endpoint);
  
  // Adicionar parâmetros de query se fornecidos
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  console.log('Final URL:', url);
  return url;
};

// Função para construir URL com path parameters
export const buildUrlWithId = (endpoint, id) => {
  return `${API_CONFIG.BASE_URL}${endpoint}/${id}`;
};
