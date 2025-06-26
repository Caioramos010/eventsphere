import API_CONFIG, { buildUrl } from './config/api';

(function checkTokenOnLoad() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const isPublicPage = window.location.pathname === '/login' || 
                         window.location.pathname === '/register' ||
                         window.location.pathname === '/';

    if (token && !isPublicPage) {
      console.log('Verificando token na inicialização...');
      return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          console.warn('Token inválido detectado. Limpando sessão...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.replace('/login');
        }
      })
      .catch(error => {
        console.error('Erro ao validar token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
      });
    }
  }
})();

export function forceTokenValidation() {
  const token = localStorage.getItem('token');
  if (!token) {
    if (window.location.pathname !== '/login' && 
        window.location.pathname !== '/register' && 
        window.location.pathname !== '/') {
      window.location.replace('/login');
    }
    return Promise.resolve(false);
  }
  
  return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login' && 
          window.location.pathname !== '/register' && 
          window.location.pathname !== '/') {
        window.location.replace('/login');
      }
      return false;
    }
    return true;
  })
  .catch(error => {
    console.error('Erro ao validar token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    if (window.location.pathname !== '/login' && 
        window.location.pathname !== '/register' && 
        window.location.pathname !== '/') {
      window.location.replace('/login');
    }
    return false;
  });
}
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  // Verificar se o URL não é de login/registro
  const isAuthenticationEndpoint = url.includes('/login') || url.includes('/register');
  
  // Se não for login/registro e tivermos um token, verificar token antes de fazer a requisição
  if (token && !isAuthenticationEndpoint) {
    try {
      const isValid = await forceTokenValidation();
      if (!isValid) {
        throw new Error('Token inválido ou expirado');
      }
    } catch (error) {
      // Token inválido, já tratado na função forceTokenValidation
      return Promise.reject(error);
    }
  }
  
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const config = {
    ...options,
    headers,
    timeout: options.timeout || API_CONFIG.TIMEOUT
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Não limpar token nas tentativas de login
        if (!isAuthenticationEndpoint) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          if (window.location.pathname !== '/login') {
            window.location.replace('/login');
            return Promise.reject(new Error('Sessão expirada. Redirecionando...'));
          }
        }
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.clone().json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        switch (response.status) {
          case 400:
            errorMessage = 'Dados inválidos enviados para o servidor';
            break;
          case 401:
            errorMessage = 'Não autorizado - credenciais inválidas';
            break;
          case 403:
            errorMessage = 'Acesso negado - permissões insuficientes';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 409:
            errorMessage = 'Conflito - dados já existem';
            break;
          case 422:
            errorMessage = 'Dados inválidos - verifique os campos';
            break;
          case 429:
            errorMessage = 'Muitas tentativas - aguarde um momento';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor - tente novamente';
            break;
          case 502:
            errorMessage = 'Servidor indisponível';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível';
            break;
          case 504:
            errorMessage = 'Tempo limite do servidor excedido';
            break;
          default:
            errorMessage = `Erro do servidor (${response.status})`;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    return response;
  } catch (error) {
    console.error('Request failed:', error);

    // Se for erro relacionado a JWT, tratar como sessão expirada
    if (error.message && (
        error.message.includes('JWT') || 
        error.message.includes('token') || 
        error.message.includes('Token') ||
        error.message.includes('signature')
    )) {
      if (!isAuthenticationEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
      return Promise.reject(new Error('Sessão expirada. Redirecionando...'));
    }
    
    // Erros de rede
    if (
      (error.name === 'TypeError' && error.message.includes('Failed to fetch')) ||
      error.message.includes('Erro de conexão') ||
      error.message.includes('Servidor indisponível') ||
      error.message.includes('Tempo limite') ||
      error.message.includes('NetworkError')
    ) {
      if (window.location.pathname !== '/server-off') {
        window.location.href = '/server-off';
      }
      
      return Promise.reject(error);
    } else if (error.name === 'AbortError') {
      throw new Error('Requisição cancelada pelo usuário.');
    } else if (error.name === 'TimeoutError') {
      throw new Error('Tempo limite da requisição excedido. Tente novamente.');
    }
    
    throw error;
  }
}

export async function get(endpoint, params = {}) {
  let url;
  
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    url = endpoint;
    console.log('GET: URL completa fornecida:', url);
  } else {
    url = buildUrl(endpoint, params);
    console.log('GET: URL construída:', url, 'de endpoint:', endpoint, 'e params:', params);
  }
  
  return fetchWithAuth(url, { method: 'GET' });
}

export async function post(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  console.log('POST request to:', url);
  console.log('POST data:', data);
  
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function put(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function del(endpoint) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, { method: 'DELETE' });
}

export async function uploadFile(endpoint, formData) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const url = buildUrl(endpoint);
  
  try {
    // Verificar token antes do upload
    if (token) {
      await forceTokenValidation();
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData
    });
    
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
        return Promise.reject(new Error('Sessão expirada. Redirecionando...'));
      }
    }
    
    return response;
  } catch (error) {
    console.error('Upload failed:', error);
    
    // Se for erro de JWT, tratar como sessão expirada
    if (error.message && (
        error.message.includes('JWT') || 
        error.message.includes('token') || 
        error.message.includes('Token') ||
        error.message.includes('signature')
    )) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
      return Promise.reject(new Error('Sessão expirada. Redirecionando...'));
    }
    
    throw error;
  }
}