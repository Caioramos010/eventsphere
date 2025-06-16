import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from '../components/Link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { IoArrowBack, IoLocationOutline, IoCalendarOutline, IoTimeOutline, IoLinkOutline, IoCopyOutline, IoCheckmarkOutline, IoQrCodeOutline, IoShareOutline } from 'react-icons/io5';
import './EventInvite.css';
import EventService from '../services/EventService';

const EventInvite = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inviteUrl, setInviteUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadEventAndGenerateInvite = async () => {
      try {
        setLoading(true);
        
        // Primeiro, carrega os dados do evento
        const eventResult = await EventService.getEventDetails(id);
        if (!eventResult.success) {
          setError(eventResult.message || 'Evento não encontrado');
          return;
        }
        
        setEvent(eventResult.event);
        
        // Depois, gera o link de convite
        const inviteResult = await EventService.generateInviteLink(id);
        if (inviteResult.success) {
          setInviteUrl(inviteResult.inviteUrl);
        } else {
          setError(inviteResult.message || 'Erro ao gerar link de convite');
        }
        
      } catch (error) {
        console.error('Error loading event and invite:', error);
        setError('Erro ao carregar dados do evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEventAndGenerateInvite();
    }
  }, [id]);
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      // Fallback para navegadores que não suportam clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = inviteUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackError) {
        console.error('Erro no fallback de cópia:', fallbackError);
      }
    }
  };

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Convite para: ${event.name}`,
          text: `Você foi convidado para participar do evento "${event.name}"`,
          url: inviteUrl,
        });
      } catch (error) {
        console.error('Erro ao compartilhar:', error);
      }
    } else {
      // Fallback para navegadores sem Web Share API
      handleCopyLink();
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para formatar hora
  const formatTime = (timeString) => {
    if (!timeString) return 'Horário não definido';
    
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    return timeString;
  };
  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="loading-message">Carregando...</div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div className="error-message">{error || 'Evento não encontrado'}</div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button className="modern-btn" onClick={() => navigate('/main')}>
                  Voltar para o início
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate(`/event/${id}`)}>
              <IoArrowBack />
            </button>
            <div className="page-title">
              <IoShareOutline className="page-icon" />
              <div>
                <h1>Convite do Evento</h1>
                <div className="subtitle">Compartilhe com seus convidados</div>
              </div>
            </div>
          </div>

          <div className="glass-card-large">
            {/* Event Header with Background Image */}
            <div 
              className="event-header-mini" 
              style={{
                backgroundImage: event.photo ? `url(${event.photo.startsWith('data:') ? event.photo : `data:image/jpeg;base64,${event.photo}`})` : 'none'
              }}
            >
              <div className="event-header-overlay-mini"></div>
              <div className="event-info-mini">
                <h2 className="event-title-mini">{event.name}</h2>
                <div className="event-details-mini">
                  <div className="event-detail-item">
                    <IoLocationOutline />
                    <span>{event.location || event.localization || 'Local não informado'}</span>
                  </div>
                  <div className="event-detail-item">
                    <IoCalendarOutline />
                    <span>{formatDate(event.dateFixedStart || event.dateStart)}</span>
                  </div>
                  <div className="event-detail-item">
                    <IoTimeOutline />
                    <span>{formatTime(event.timeFixedStart || event.timeStart)} - {formatTime(event.timeFixedEnd || event.timeEnd)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="invite-content">
              <div className="invite-section">
                <h3>Link de Convite</h3>
                <div className="url-container">
                  <div className="url-display">
                    <span className="url-text">{inviteUrl}</span>
                    <button className="url-icon-btn">
                      <IoLinkOutline />
                    </button>
                  </div>
                  
                  <div className="action-buttons">
                    <button 
                      className={`action-btn copy-btn ${copySuccess ? 'success' : ''}`}
                      onClick={handleCopyLink}
                    >
                      {copySuccess ? <IoCheckmarkOutline /> : <IoCopyOutline />}
                      <span>{copySuccess ? 'Copiado!' : 'Copiar Link'}</span>
                    </button>
                    
                    <button className="action-btn share-btn" onClick={handleShareLink}>
                      <IoShareOutline />
                      <span>Compartilhar</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="invite-instructions">
                <h4>Como usar:</h4>
                <ul>
                  <li>Copie o link acima e envie para seus convidados</li>
                  <li>Os convidados poderão acessar o link para se inscrever no evento</li>
                  <li>Você receberá notificações quando alguém confirmar presença</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventInvite;
