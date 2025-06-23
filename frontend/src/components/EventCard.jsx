import React from 'react';
import { Link } from '../components/Link';
import './EventCard.css';
import { FaCalendarAlt, FaCrown, FaUserFriends, FaUserPlus } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs';
import API_CONFIG from '../config/api';
import ParticipantService from '../services/ParticipantService';

const EventCard = ({ event, type, linkTo, onParticipate }) => {
  
  console.log('EventCard recebeu evento:', event);
  console.log('EventCard linkTo:', linkTo);

  const handleParticipateClick = async (e) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    if (onParticipate) {
      try {
        const result = await ParticipantService.joinPublicEvent(event.id);
        if (result.success) {
          onParticipate(event.id, true);
        } else {
          console.error('Erro ao participar:', result.message);
          onParticipate(event.id, false, result.message);
        }
      } catch (error) {
        console.error('Erro ao participar:', error);
        onParticipate(event.id, false, 'Erro de conexão');
      }
    }
  };
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_DOWNLOAD}/${imagePath}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    
    
    let date;
    if (typeof dateString === 'string') {
      
      if (dateString.includes('T') || !isNaN(Date.parse(dateString))) {
        date = new Date(dateString);
      } else {
        
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          return dateString; 
        }
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return 'Data inválida';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const getUserStatusIcon = (userStatus) => {
    switch (userStatus) {
      case 'owner':
        return <FaCrown className="status-icon crown-icon" />;
      case 'collaborator':
        return <FaUserFriends className="status-icon collaborator-icon" />;
      case 'participant':
        return <BsPersonFill className="status-icon participant-icon" />;
      default:
        return null; 
    }
  };  
  const getEventImage = () => {
    const imageUrl = formatImageUrl(event.imageUrl || event.photo || event.image);
    if (imageUrl) {
      return <img src={imageUrl} alt={event.name} className="card-image" />;
    }
    
    
    return (
      <div className="default-event-placeholder">
        <div className="placeholder-gradient"></div>
        <div className="placeholder-content">
          <FaCalendarAlt className="placeholder-icon" />
          <span className="placeholder-text">Evento</span>
        </div>
      </div>
    );
  };  return (
    <Link to={linkTo} style={{ textDecoration: 'none' }}>
      <div className={`event-card ${type === 'primary' ? 'primary-card' : 'secondary-card'} ${event.state === 'ACTIVE' ? 'active-event' : ''}`}>
        
        {/* Indicador de evento ativo */}
        {event.state === 'ACTIVE' && (
          <div className="active-indicator">
            <div className="active-pulse"></div>
            <span className="active-text">ATIVO</span>
          </div>
        )}
        
        <div className="card-image-container">
          {getEventImage()}
          <div className="card-image-overlay"></div>
        </div>
          <div className="card-content">
          <div className="card-title">
            {event.name}
          </div>
          <div className="card-date">
            {formatDate(event.dateFixedStart || event.dateStart)}
          </div>          {/* Botão de participar para eventos públicos onde o usuário é visitante */}
          {type === 'secondary' && event.userStatus === 'visitor' && onParticipate && 
           !event.isActive && event.state !== 'FINISHED' && event.state !== 'CANCELED' && (
            <button 
              className="participate-btn"
              onClick={handleParticipateClick}
              title="Participar do evento"
            >
              <FaUserPlus />
              <span>Participar</span>
            </button>
          )}
          
          {/* Mensagem quando evento está ativo */}
          {type === 'secondary' && event.userStatus === 'visitor' && event.isActive && (
            <div className="event-started-message">
              <span>Evento já iniciado</span>
            </div>
          )}
          
          {/* Mensagem quando evento está encerrado */}
          {type === 'secondary' && event.userStatus === 'visitor' && event.state === 'FINISHED' && (
            <div className="event-finished-message">
              <span>Evento encerrado</span>
            </div>
          )}
          
          {/* Mensagem quando evento está cancelado */}
          {type === 'secondary' && event.userStatus === 'visitor' && event.state === 'CANCELED' && (
            <div className="event-canceled-message">
              <span>Evento cancelado</span>
            </div>
          )}
        </div>{event.userStatus && getUserStatusIcon(event.userStatus) && (
          <div className="card-status-icon">
            {getUserStatusIcon(event.userStatus)}
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
