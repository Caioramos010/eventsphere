const ERROR_MESSAGES = {
  400: 'Dados inválidos fornecidos',
  401: 'Sessão expirada. Faça login novamente',
  403: 'Você não tem permissão para esta operação',
  404: 'Recurso não encontrado',
  409: 'Conflito: o recurso já existe',
  422: 'Dados não puderam ser processados',
  500: 'Erro interno do servidor',
  'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet',
  'TIMEOUT': 'Operação demorou muito para responder'
};

export const handleServiceError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  let message = 'Erro inesperado';
  let shouldRedirect = false;
  
  if (error.response) {
    const status = error.response.status;
    message = ERROR_MESSAGES[status] || `Erro ${status}`;
    shouldRedirect = status === 401;
  } else if (error.message) {
    if (error.message.includes('Failed to fetch')) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
    } else if (error.message.includes('timeout')) {
      message = ERROR_MESSAGES.TIMEOUT;
    } else {
      message = error.message;
    }
  }
  
  if (shouldRedirect) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }, 1000);
  }
  
  return {
    success: false,
    message,
    shouldRedirect,
    originalError: error
  };
};

export const validateResponse = (response) => {
  if (!response) {
    throw new Error('Resposta vazia do servidor');
  }
  
  if (response.success === false) {
    throw new Error(response.message || 'Operação falhou');
  }
  
  return response;
};

export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      const result = await fn(...args);
      return validateResponse(result);
    } catch (error) {
      return handleServiceError(error, context);
    }
  };
};
