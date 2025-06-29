const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  
  ENDPOINTS: {
    LOGIN: '/login/accept',
    REGISTER: '/register/accept',
    AUTH: '/api/auth/validate',
    USER_UPDATE_EMAIL: '/api/user/update-email',
    USER_UPDATE_USERNAME: '/api/user/update-username',
    USER_UPDATE_PASSWORD: '/api/user/update-password',
    USER_DELETE: '/api/user/delete',
    USER_PROFILE: '/api/user/get',
    USERS: '/api/users',
    
    // Event endpoints - Updated to match backend
    EVENT_CREATE: '/api/event',
    EVENT_GET: '/api/event/{id}',
    EVENT_UPDATE: '/api/event/{id}',
    EVENT_DELETE: '/api/event/{id}',
    EVENT_IMAGE: '/api/upload/event-image',
    MY_EVENTS: '/api/event/my',
    ALL_MY_EVENTS: '/api/event/all-my',
    PUBLIC_EVENTS: '/api/event/public',
    
    EVENT_START: '/api/event/{id}/start',
    EVENT_FINISH: '/api/event/{id}/finish',
    EVENT_CANCEL: '/api/event/{id}/cancel',
    
    // Invite endpoints - Updated to match backend
    INVITE_GENERATE: '/api/event/{id}/invite',
    EVENT_CODE_GENERATE: '/api/event/{id}/code',
    INVITE_GET: '/api/event/invite/{token}',
    INVITE_JOIN: '/api/event/join/{token}',
    EVENT_CODE_VALIDATE: '/api/event/validate-code',
    
    // Participant endpoints
    PARTICIPANT_ADD: '/api/participant/add',
    PARTICIPANT_REMOVE: '/api/participant/remove',
    PARTICIPANT_CONFIRM: '/api/participant/confirm',
    PARTICIPANT_JOIN_EVENT: '/api/participant/join-event',
    PARTICIPANT_JOIN_WITH_INVITE: '/api/participant/join-with-invite',
    PARTICIPANT_JOIN_WITH_CODE: '/api/participant/join-with-code',
    PARTICIPANT_REMOVE_FROM_EVENT: '/api/participant/remove/{eventId}/{participantId}',
    PARTICIPANT_CONFIRM_PARTICIPATION: '/api/participant/confirm/{eventId}/{participantId}',
    PARTICIPANT_PROMOTE: '/api/participant/promote/{eventId}/{participantId}',
    PARTICIPANT_DEMOTE: '/api/participant/demote/{eventId}/{participantId}',
    PARTICIPANT_QR_CODE: '/api/participant/qr-code/{eventId}',
    PARTICIPANT_ATTENDANCE_REPORT: '/api/participant/attendance-report/{eventId}',
    PARTICIPANT_STATUS_UPDATE: '/api/participant/{participantId}/status',
    PARTICIPANT_INVITE: '/api/participant/invite',
    PARTICIPANT_LEAVE_EVENT: '/api/participant/leave-event',
    PARTICIPANT_EVENT_PRESENT: '/api/participant/event/{eventId}/present',
    PARTICIPANT_PRESENCE: '/api/participant/{participantId}/presence',
    PARTICIPATING_EVENTS: '/api/event/participating',
    
    // Other endpoints
    USER_PHOTO: '/api/upload/user-photo',
    FILE_DOWNLOAD: '/api/files',
    ADMIN: '/admin',
    NEXT_EVENTS: '/api/event/next-events'
  },
  
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  TIMEOUT: 30000
};

export default API_CONFIG;

export const buildUrl = (endpoint, params = {}) => {
  if (endpoint.startsWith('http')) {
    if (Object.keys(params).length > 0) {
      const url = new URL(endpoint);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });
      return url.toString();
    }
    
    return endpoint;
  }
  
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;

  // Replace path parameters like {id}, {token}, {eventId}, {participantId}
  url = url.replace(/\{(\w+)\}/g, (match, paramName) => {
    if (params[paramName] !== undefined && params[paramName] !== null) {
      const value = params[paramName];
      delete params[paramName]; // Remove from params so it's not added to query string
      return value;
    }
    return match;
  });

  // Add remaining parameters as query string
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      queryParams.append(key, params[key]);
    }
  });
  
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }
  
  return url;
};

export const buildUrlWithId = (endpoint, id) => {
  return buildUrl(endpoint, { id });
};

export const buildUrlWithParams = (endpoint, pathParams = {}, queryParams = {}) => {
  return buildUrl(endpoint, { ...pathParams, ...queryParams });
};
