import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Footer, EventCard, PageTitle, StandardButton, StandardCard } from '../components';
import { IoCalendarOutline, IoSearch, IoGridOutline, IoListOutline, IoAddCircleOutline } from 'react-icons/io5';
import './AllEvents.css';
import EventService from '../services/EventService';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); 
  const [filter, setFilter] = useState('all'); 
  const navigate = useNavigate();

  
  const filterEvents = useCallback(() => {
    let filtered = events;

    
    if (filter === 'my-events') {
      filtered = filtered.filter(event => event.source === 'created');
    } else if (filter === 'participating') {
      filtered = filtered.filter(event => event.source === 'participating');
    }

    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.localization?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, filter, searchTerm]);

  useEffect(() => {
    loadAllEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const loadAllEvents = async () => {
    try {
      setLoading(true);
      
      
      const myEventsResult = await EventService.getMyEvents();
      const myEvents = myEventsResult.success ? myEventsResult.events.map(event => ({
        ...event,
        userStatus: 'owner',
        source: 'created'
      })) : [];

      
      const participatingEventsResult = await EventService.getParticipatingEvents();
      const participatingEvents = participatingEventsResult.success ? participatingEventsResult.events.map(event => ({
        ...event,
        userStatus: event.userStatus || 'participant',
        source: 'participating'
      })) : [];

      
      const allEvents = [...myEvents];
      participatingEvents.forEach(event => {
        if (!allEvents.find(e => e.id === event.id)) {
          allEvents.push(event);
        }
      });

      
      allEvents.sort((a, b) => new Date(b.dateCreated || b.createdAt || 0) - new Date(a.dateCreated || a.createdAt || 0));

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Erro ao carregar eventos');
    } finally {      setLoading(false);
    }
  };

  const handleParticipate = async (eventId, success, message) => {
    if (success) {
      
      await loadAllEvents();
    } else {
      alert(message || 'Erro ao participar do evento');
    }
  };

  const getStatusText = (event) => {
    if (event.state === 'ACTIVE') return 'Ativo';
    if (event.state === 'FINISHED') return 'Encerrado';
    if (event.state === 'CANCELED') return 'Cancelado';
    return 'Criado';
  };

  const getEventIcon = (event) => {
    if (event.userStatus === 'owner') return '👑';
    if (event.userStatus === 'collaborator') return '🤝';
    return '👤';
  };
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="page-main">
          <div className="page-header">
            <PageTitle
              icon={IoCalendarOutline}
              title="Meus Eventos"
              subtitle="Eventos criados por você e onde você participa"
            />
            
            <StandardButton
              variant="primary"
              size="large"
              icon={IoAddCircleOutline}
              onClick={() => navigate('/create-event')}
            >
              Criar Evento
            </StandardButton>
          </div>          {/* Filtros e busca */}
          <StandardCard variant="glass" padding="medium" className="events-controls">
            <div className="search-container">
              <IoSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-buttons">
              <StandardButton
                variant={filter === 'all' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilter('all')}
              >
                Todos ({events.length})
              </StandardButton>
              <StandardButton
                variant={filter === 'my-events' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilter('my-events')}
              >
                Criados ({events.filter(e => e.source === 'created').length})
              </StandardButton>
              <StandardButton
                variant={filter === 'participating' ? 'primary' : 'secondary'}
                size="small"
                onClick={() => setFilter('participating')}
              >
                Participando ({events.filter(e => e.source === 'participating').length})
              </StandardButton>
            </div>

            <div className="view-controls">
              <StandardButton
                variant={viewMode === 'grid' ? 'info' : 'secondary'}
                size="small"
                icon={IoGridOutline}
                onClick={() => setViewMode('grid')}
              />
              <StandardButton
                variant={viewMode === 'list' ? 'info' : 'secondary'}
                size="small"
                icon={IoListOutline}
                onClick={() => setViewMode('list')}              />
            </div>
          </StandardCard>

          {/* Lista de eventos */}
          <div className="events-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Carregando eventos...</p>
              </div>
            ) : error ? (              <div className="error-container">
                <div className="error-message">{error}</div>
                <StandardButton variant="primary" onClick={loadAllEvents}>
                  Tentar novamente
                </StandardButton>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="empty-container">
                <IoCalendarOutline className="empty-icon" />
                <h3>
                  {searchTerm ? 'Nenhum evento encontrado' : 
                   filter === 'my-events' ? 'Você ainda não criou eventos' :
                   filter === 'participating' ? 'Você ainda não participa de eventos' :
                   'Você ainda não tem eventos'}
                </h3>
                <p>
                  {searchTerm ? 'Tente buscar por outros termos' :
                   filter === 'my-events' ? 'Crie seu primeiro evento!' :
                   filter === 'participating' ? 'Participe de eventos públicos ou aceite convites' :
                   'Crie eventos ou participe de eventos existentes'}
                </p>
                {!searchTerm && (
                  <button 
                    className="modern-btn"
                    onClick={() => navigate('/create-event')}
                  >
                    <IoAddCircleOutline />
                    <span>Criar Primeiro Evento</span>
                  </button>
                )}
              </div>
            ) : (
              <div className={`events-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {filteredEvents.map(event => (
                  <div key={event.id} className="event-item">
                    <div className="event-meta">
                      <span className="event-role">
                        {getEventIcon(event)} {event.source === 'created' ? 'Organizador' : 'Participante'}
                      </span>
                      <span className={`event-status status-${event.state?.toLowerCase()}`}>
                        {getStatusText(event)}
                      </span>
                    </div>
                    <EventCard
                      event={event}
                      type="primary"
                      linkTo={`/event/${event.id}`}
                      onParticipate={event.userStatus === 'visitor' ? handleParticipate : null}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllEvents;
