import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  IoPeopleOutline, 
  IoPlayOutline, 
  IoCreateOutline, 
  IoCloseOutline, 
  IoRemoveCircleOutline, 
  IoPrintOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline, 
  IoQrCodeOutline, 
  IoStopOutline,
  IoCalendarOutline,
  IoArrowBack,
  IoLocationOutline,
  IoTimeOutline,
  IoInformationCircleOutline,
  IoCheckmarkOutline
} from 'react-icons/io5';
import './EventDetails.css';
import userIcon from '../images/user.png';
import eventImg from '../images/event.png';
import getUserStatusIcon from '../utils/getUserStatusIcon';
import EventService from '../services/EventService';
import ParticipantService from '../services/ParticipantService';

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

// Função para formatar hora
const formatTime = (timeString) => {
  if (!timeString) return 'Horário não definido';
  
  // Se for um objeto de hora Java (LocalTime)
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const parts = timeString.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
  }
  
  // Se for um Date
  if (timeString instanceof Date) {
    return timeString.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return timeString; // Retorna a string original se não conseguir parsear
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [confirmationList, setConfirmationList] = useState([]);
  const [isEventActive, setIsEventActive] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      try {
        console.log('EventDetails - ID do evento:', id);
        
        if (!id) {
          setError('ID do evento não especificado');
          setLoading(false);
          return;
        }
        
        // Tentativa com ID numérico
        let result = await EventService.getEventDetails(id);
        
        // Se falhar e o ID parecer ser uma string, tente removendo possíveis aspas
        if (!result.success && typeof id === 'string' && (id.startsWith('"') || id.startsWith("'"))) {
          const cleanId = id.replace(/['"]/g, '');
          console.log('Tentando novamente com ID limpo:', cleanId);
          result = await EventService.getEventDetails(cleanId);
        }
        
        if (result.success) {
          console.log('Evento carregado com sucesso:', result.event);
          
          // Garantir que o evento tenha o ID da URL se não tiver ID próprio
          if (!result.event.id) {
            result.event.id = id;
          }
          
          setEvent(result.event);
          
          // Verificar se o evento está ativo
          if (result.event.state === 'ACTIVE' || result.event.status === 'active') {
            setIsEventActive(true);
          }
          
          // Verificar se o usuário atual confirmou presença
          if (result.event.participants) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            if (currentUser) {
              const userParticipant = result.event.participants.find(
                p => p.userId === currentUser.id || p.id === currentUser.id
              );
              setUserConfirmed(!!userParticipant && userParticipant.confirmed);
            }
          }
          
          // Configurar colaboradores e participantes
          setCollaborators(result.event.collaborators || []);
          setConfirmationList(result.event.participants || []);
        } else {
          setError(result.message || 'Não foi possível carregar os detalhes do evento');
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Erro ao carregar os detalhes do evento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const handleInviteClick = () => {
    navigate(`/event/${id}/invite`);
  };

  const handleStartEvent = async () => {
    try {
      const result = await EventService.startEvent(id);
      if (result.success) {
        setIsEventActive(true);
        setEvent(prev => ({...prev, status: 'active', state: 'ACTIVE'}));
        alert('Evento iniciado com sucesso!');
      } else {
        alert(result.message || 'Erro ao iniciar o evento');
      }
    } catch (error) {
      console.error('Error starting event:', error);
      alert('Erro ao iniciar o evento');
    }
  };

  const handleEndEvent = async () => {
    try {
      const result = await EventService.finishEvent(id);
      if (result.success) {
        setIsEventActive(false);
        setEvent(prev => ({...prev, status: 'finished', state: 'FINISHED'}));
        alert('Evento encerrado com sucesso!');
      } else {
        alert(result.message || 'Erro ao encerrar o evento');
      }
    } catch (error) {
      console.error('Error ending event:', error);
      alert('Erro ao encerrar o evento');
    }
  };

  const handleScanQRCode = () => {
    navigate(`/event/${id}/qr-scanner`);
  };

  const handleEditEvent = () => {
    navigate(`/edit_event/${id}`);
  };

  const handleCancelEvent = async () => {
    if (window.confirm('Tem certeza que deseja cancelar este evento?')) {
      try {
        const result = await EventService.cancelEvent(id);
        if (result.success) {
          alert('Evento cancelado com sucesso');
          navigate('/main');
        } else {
          alert(result.message || 'Erro ao cancelar o evento');
        }
      } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Erro ao cancelar o evento');
      }
    }
  };
  const handleConfirmAttendance = async () => {
    try {
      const result = await ParticipantService.confirmAttendance(id);
      if (result.success) {
        alert('Confirmação de presença enviada!');
        setUserConfirmed(true);
        // Atualizar a lista de participantes
        const updatedEvent = await EventService.getEventDetails(id);
        if (updatedEvent.success) {
          setEvent(updatedEvent.event);
        }
      } else {
        alert(result.message || 'Erro ao confirmar presença');
      }
    } catch (error) {
      console.error('Error confirming attendance:', error);
      alert('Erro ao confirmar presença');
    }
  };

  const handleGenerateQRCode = () => {
    // Navegar para a página de QR Code do participante
    navigate(`/event/${id}/my-qrcode`);
  };

  const handlePrintList = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                Carregando...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                {error}
              </div>
              <div style={{textAlign: 'center', marginTop: '20px'}}>
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

  if (!event) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{textAlign: 'center', color: 'var(--color-text-white)'}}>
                Evento não encontrado
              </div>
              <div style={{textAlign: 'center', marginTop: '20px'}}>
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

  const canEdit = event.userStatus === 'owner' || event.userStatus === 'collaborator';

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <button className="back-btn" onClick={() => navigate('/main')}>
              <IoArrowBack />
            </button>
            <div className="page-title">
              <IoCalendarOutline className="page-icon" />
              <div>
                <h1>Detalhes do Evento</h1>
                <div className="subtitle">Gerencie seu evento</div>
              </div>
            </div>
          </div>
          
          {/* Event Info Card */}          
          <div className={`glass-card-large ${isEventActive ? 'event-active' : ''}`}>
            <div className="event-header">
              <div className="event-header-left">
                <h2 className="event-title">{event.name}</h2>
              </div>
              {isEventActive ? (
                <div className="event-active-badge">
                  <div className="event-active-pulse"></div>
                  <span>EVENTO ATIVO</span>
                </div>
              ) : (
                <div className="event-access-badge">{event.access || event.acess || event.type || 'PÚBLICO'}</div>
              )}
            </div>
            
            <div className="event-content">
              <div className="event-info">
                <div className="event-info-item">
                  <IoLocationOutline />
                  <span>{event.location || event.localization || 'Local não informado'}</span>
                </div>
                <div className="event-info-item">
                  <IoCalendarOutline />
                  <span>{formatDate(event.dateFixedStart || event.dateStart)}</span>
                </div>
                <div className="event-info-item">
                  <IoTimeOutline />
                  <span>{formatTime(event.timeFixedStart || event.timeStart)} - {formatTime(event.timeFixedEnd || event.timeEnd)}</span>
                </div>
                <div className="event-info-item">
                  <IoInformationCircleOutline />
                  <span>{event.classification || event.ageRestriction || 'Livre'}</span>
                </div>
                
                <div className="event-description">
                  <h3>Descrição</h3>
                  <p>{event.description || 'Sem descrição'}</p>
                </div>
                
                {(event.maxParticipants || event.confirmedParticipants || event.participants) && (
                  <div className="event-capacity">
                    <div className="capacity-text">
                      <span className="capacity-confirmed">{event.confirmedParticipants || (event.participants ? event.participants.length : 0)}</span>
                      <span className="capacity-separator">/</span>
                      <span className="capacity-total">{event.maxParticipants || 'Ilimitado'}</span>
                    </div>
                    {event.maxParticipants > 0 && (
                      <div className="capacity-bar">
                        <div 
                          className="capacity-progress" 
                          style={{width: `${(event.confirmedParticipants || (event.participants ? event.participants.length : 0)) / event.maxParticipants * 100}%`}}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="event-actions">
                {/* Botão para convidar pessoas (visível para todos) */}
                <button className="modern-btn event-action-btn" onClick={handleInviteClick}>
                  <IoPeopleOutline />
                  <span>Convidar Pessoas</span>
                </button>
                
                {/* Botões para donos e colaboradores */}
                {canEdit && (
                  <>
                    {!isEventActive ? (
                      <>                        
                        <button className="modern-btn event-action-btn start-btn" onClick={handleStartEvent}>
                          <IoPlayOutline />
                          <span>Iniciar Evento</span>
                        </button>
                        <button className="modern-btn event-action-btn edit-btn" onClick={handleEditEvent}>
                          <IoCreateOutline />
                          <span>Editar Evento</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="modern-btn event-action-btn qrcode-btn" onClick={handleScanQRCode}>
                          <IoQrCodeOutline />
                          <span>Escanear QR-Code</span>
                        </button>
                        <button className="modern-btn event-action-btn end-btn" onClick={handleEndEvent}>
                          <IoStopOutline />
                          <span>Encerrar Evento</span>
                        </button>
                      </>
                    )}
                    <button className="modern-btn event-action-btn cancel-btn" onClick={handleCancelEvent}>
                      <IoCloseOutline />
                      <span>Cancelar Evento</span>
                    </button>
                  </>
                )}
                
                {/* Botão para participantes confirmarem presença */}
                {!canEdit && !userConfirmed && event.state !== 'FINISHED' && event.state !== 'CANCELED' && (
                  <button className="modern-btn event-action-btn confirm-btn" onClick={handleConfirmAttendance}>
                    <IoCheckmarkOutline />
                    <span>Confirmar Presença</span>
                  </button>
                )}
                
                {/* Botão para gerar QR Code para participantes confirmados */}
                {!canEdit && userConfirmed && isEventActive && (
                  <button className="modern-btn event-action-btn qrcode-btn" onClick={handleGenerateQRCode}>
                    <IoQrCodeOutline />
                    <span>Meu QR Code</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Collaborators Section - Visível apenas para donos e colaboradores */}
          {canEdit && collaborators && collaborators.length > 0 && (
            <div className="glass-card">
              <div className="section-header">
                <h3>Colaboradores ({collaborators.length})</h3>
                <button className="modern-btn-secondary small-btn" onClick={handlePrintList}>
                  <IoPrintOutline />
                  <span>Imprimir</span>
                </button>
              </div>
              
              <div className="participant-list">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id || `collab-${Math.random()}`} className="participant-item">
                    <div className="participant-avatar">
                      <img src={collaborator.imageUrl || userIcon} alt="User" />
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{collaborator.name || collaborator.username || 'Colaborador'}</div>
                      <div className="participant-details">
                        {collaborator.email && <span>{collaborator.email}</span>}
                      </div>
                    </div>
                    <button className="participant-action remove-btn">
                      <IoRemoveCircleOutline />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirmation List Section - Visível apenas para donos e colaboradores */}
          {canEdit && confirmationList && confirmationList.length > 0 && (
            <div className="glass-card">
              <div className="section-header">
                <h3>Lista de Participantes ({confirmationList.length})</h3>
                <button className="modern-btn-secondary small-btn" onClick={handlePrintList}>
                  <IoPrintOutline />
                  <span>Imprimir</span>
                </button>
              </div>
              
              <div className="participant-list">
                {confirmationList.map(participant => (
                  <div key={participant.id || `part-${Math.random()}`} className="participant-item">
                    <div className="participant-avatar">
                      <img src={participant.imageUrl || userIcon} alt="User" />
                    </div>
                    <div className="participant-info">
                      <div className="participant-name">{participant.name || participant.username || 'Participante'}</div>
                      <div className="participant-details">
                        {participant.email && <span>{participant.email}</span>}
                      </div>
                    </div>
                    <div className={`participant-status ${participant.confirmed ? 'confirmed' : 'not-confirmed'}`}>
                      {participant.confirmed ? 
                        <IoCheckmarkCircleOutline /> : 
                        <IoCloseCircleOutline />
                      }
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="list-footer">
                <span>Confirmados: {confirmationList.filter(p => p.confirmed).length}</span>
                <span>Pendentes: {confirmationList.filter(p => !p.confirmed).length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventDetails;
