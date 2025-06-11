import React from 'react';
import { Link } from '../components/Link';
import './EventCard.css';
import eventImg from '../images/event.png';
import ownerImg from '../images/crown.png';
import colaboratorImg from '../images/colaborator.png';
import userImg from '../images/user.png';

const EventCard = ({ event, type, linkTo }) => {
  // Log do evento recebido para debug
  console.log('EventCard recebeu evento:', event);
  console.log('EventCard linkTo:', linkTo);
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
        return ownerImg;
      case 'collaborator':
        return colaboratorImg;
      case 'participant':
        return userImg;
      default:
        return null; // Não mostra ícone se não estiver participando
    }  };
  
  // Função para obter a URL da imagem do evento
  const getEventImageUrl = () => {
    // Simplesmente retorna a URL da imagem se disponível, ou a imagem padrão
    if (event.imageUrl) return event.imageUrl;
    if (event.image) return event.image;
    return eventImg; // Imagem padrão
  };
  return (
    <Link to={linkTo} style={{ textDecoration: 'none' }}>
      <div className={`event-card ${type === 'primary' ? 'primary-card' : 'secondary-card'}`}>
        <div className="card-image-container">
          <img 
            src={getEventImageUrl()} 
            alt={event.name} 
            className="card-image" 
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = eventImg;
            }}          />
          <div className="card-image-overlay"></div>
        </div>
        
        <div className="card-content">
          <div className="card-title">
            {event.name}
          </div>
          <div className="card-date">
            {formatDate(event.dateFixedStart || event.dateStart)}
          </div>
        </div>
          {event.userStatus && getUserStatusIcon(event.userStatus) && (
          <div className="card-status-icon">
            <img src={getUserStatusIcon(event.userStatus)} alt="Status" />
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;
