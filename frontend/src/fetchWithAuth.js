// Utilitário para requisições autenticadas - EventSphere
import API_CONFIG, { buildUrl } from './config/api';

// Função principal para requisições autenticadas
export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token');
  
  // Configurar headers padrão
  const headers = {
    ...API_CONFIG.DEFAULT_HEADERS,
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  // Configurar opções da requisição
  const config = {
    ...options,
    headers,
    timeout: options.timeout || API_CONFIG.TIMEOUT
  };

  try {
    // Fazer a requisição
    const response = await fetch(url, config);
    
    // Verificar se a resposta é válida
    if (!response.ok) {
      // Se token expirou, remover do localStorage
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirecionar para login se necessário
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Tentar extrair mensagem de erro do corpo da resposta
      let errorMessage = `HTTP error! status: ${response.status}`;      try {
        const errorData = await response.clone().json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Se não conseguir parse do JSON, usar mensagem padrão baseada no status
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
    
    // Melhorar mensagens de erro de rede
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    } else if (error.name === 'AbortError') {
      throw new Error('Requisição cancelada pelo usuário.');
    } else if (error.name === 'TimeoutError') {
      throw new Error('Tempo limite da requisição excedido. Tente novamente.');
    }
    
    throw error;
  }
}

// Função para fazer requisições GET
export async function get(endpoint, params = {}) {
  let url;
  
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    // Se já for uma URL completa, usa diretamente
    url = endpoint;
    console.log('GET: URL completa fornecida:', url);
  } else {
    // Caso contrário, constrói a URL
    url = buildUrl(endpoint, params);
    console.log('GET: URL construída:', url, 'de endpoint:', endpoint, 'e params:', params);
  }
  
  return fetchWithAuth(url, { method: 'GET' });
}

// Função para fazer requisições POST
export async function post(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  console.log('POST request to:', url);
  console.log('POST data:', data);
  
  return fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Função para fazer requisições PUT
export async function put(endpoint, data = {}) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Função para fazer requisições DELETE
export async function del(endpoint) {
  const url = buildUrl(endpoint);
  return fetchWithAuth(url, { method: 'DELETE' });
}

// Função para upload de arquivos
export async function uploadFile(endpoint, formData) {
  const token = localStorage.getItem('token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {})
    // Não definir Content-Type para FormData - o browser fará isso automaticamente
  };

  const url = buildUrl(endpoint);
  
  // Remove o Content-Type padrão para permitir que o browser defina o boundary correto
  return fetch(url, {
    method: 'POST',
    headers,
    body: formData
  });
}
