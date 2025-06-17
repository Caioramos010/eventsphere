import React from 'react';
import { Link } from '../components/Link';
import './EventCard.css';
import { FaCalendarAlt, FaCrown, FaUserFriends, FaUserPlus } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs';
import API_CONFIG from '../config/api';
import ParticipantService from '../services/ParticipantService';

const EventCard = ({ event, type, linkTo, onParticipate }) => {
  // Log do evento recebido para debug
  console.log('EventCard recebeu evento:', event);
  console.log('EventCard linkTo:', linkTo);

  const handleParticipateClick = async (e) => {
    e.preventDefault(); // Evita o redirecionamento do Link
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
  };// Função para formatar URL de imagem
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Se for Base64 (data:image/...), retornar diretamente
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    
    // Se já for uma URL completa, retornar como está
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Caso contrário, é um nome de arquivo armazenado no servidor (legacy)
    return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILE_DOWNLOAD}/${imagePath}`;
  };
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    
    // Se for uma string ISO ou objeto Date
    let date;
    if (typeof dateString === 'string') {
      // Verificar se é no formato ISO (2023-04-15) ou um timestamp
      if (dateString.includes('T') || !isNaN(Date.parse(dateString))) {
        date = new Date(dateString);
      } else {
        // Para datas no formato dd/mm/yyyy
        const parts = dateString.split('/');
        if (parts.length === 3) {
          date = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          return dateString; // Retorna a string original se não conseguir parsear
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
  // Função para retornar o ícone correto baseado no status do usuário
  const getUserStatusIcon = (userStatus) => {
    switch (userStatus) {
      case 'owner':
        return <FaCrown className="status-icon crown-icon" />;
      case 'collaborator':
        return <FaUserFriends className="status-icon collaborator-icon" />;
      case 'participant':
        return <BsPersonFill className="status-icon participant-icon" />;
      default:
        return null; // Não mostra ícone se não estiver participando
    }
  };  // Função para obter a imagem do evento ou o placeholder padrão
  const getEventImage = () => {
    const imageUrl = formatImageUrl(event.imageUrl || event.photo || event.image);
    if (imageUrl) {
      return <img src={imageUrl} alt={event.name} className="card-image" />;
    }
    
    // Placeholder padrão clean com gradiente
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
