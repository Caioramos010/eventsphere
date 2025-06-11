import React, { useEffect, useState } from 'react';
import './Main.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from '../components/Link';
import EventService from '../services/EventService';
import AuthService from '../services/AuthService';
import { useNavigate } from 'react-router-dom';
import eventImg from '../images/event.png'
import userImg from '../images/user.png'
import ownerImg from '../images/crown.png'
import colaboratorImg from '../images/colaborator.png'
import Calendar from '../components/Calendar';
import publicEventsImg from '../images/public.png'
import myEventsImg from '../images/private.png'
import EventCard from '../components/EventCard';

function Main() {  
  const [myEvents, setMyEvents] = useState([]);
  const [publicEvents, setPublicEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Carregar dados dos eventos
    loadEvents();
  }, [navigate]);  const loadEvents = async () => {
    try {
      setLoading(true);
      
      // Carregar meus eventos e eventos públicos em paralelo
      const [myEventsResult, publicEventsResult] = await Promise.all([
        EventService.getMyEvents(),
        EventService.getPublicEvents()
      ]);

      if (myEventsResult.success) {
        console.log('Meus eventos carregados:', myEventsResult.events);
        // Filtrar eventos sem ID (embora agora eles devem ter IDs temporários)
        const validMyEvents = myEventsResult.events.filter(event => {
          if (!event.id) {
            console.warn('Evento ainda sem ID após processamento:', event);
            return false;
          }
          return true;
        });
        
        // Armazenar eventos no cache local para uso posterior
        try {
          localStorage.setItem('myEventsCache', JSON.stringify(validMyEvents));
        } catch (e) {
          console.error('Erro ao salvar cache de eventos:', e);
        }
        
        setMyEvents(validMyEvents);
      } else {
        console.error('Error loading my events:', myEventsResult.message);
      }

      if (publicEventsResult.success) {
        console.log('Eventos públicos carregados:', publicEventsResult.events);
        // Filtrar eventos sem ID (embora agora eles devem ter IDs temporários)
        const validPublicEvents = publicEventsResult.events.filter(event => {
          if (!event.id) {
            console.warn('Evento público ainda sem ID após processamento:', event);
            return false;
          }
          return true;
        });
        
        // Armazenar eventos no cache local para uso posterior
        try {
          localStorage.setItem('publicEventsCache', JSON.stringify(validPublicEvents));
        } catch (e) {
          console.error('Erro ao salvar cache de eventos públicos:', e);
        }
        
        setPublicEvents(validPublicEvents);
      } else {
        console.error('Error loading public events:', publicEventsResult.message);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não definida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');  };  
  
  return (
    <>
      <Header />
      <div className="main-container">
        <div className="main-content">
          {/* Cabeçalho da página */}
          <div className="page-header">
            <div className="header-content">
              <h1 className="page-title">Painel Principal</h1>
            </div>
          </div>
          
          {/* Calendário e Ações */}
          <div className="glass-card-large main-top-card">
            <div className="main-top-section">
              <Calendar events={[...myEvents, ...publicEvents]} />             
              <div className="actions-section">
                <h3 className="actions-title">Ações Rápidas</h3>
                <Link to="/event/enter">
                  <button className="modern-btn modern-btn-secondary action-btn">
                    <img src={eventImg} alt="Evento" className="action-icon" />
                    <span>PARTICIPAR DE UM EVENTO</span>
                  </button>
                </Link>
                
                <Link to="/create-event">
                  <button className="modern-btn action-btn">
                    <img src={eventImg} alt="Criar evento" className="action-icon" />
                    <span>CRIAR EVENTO</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Meus Eventos */}
          <section className="events-section">
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">
                  <img src={myEventsImg} alt="Meus eventos" className="section-icon" />
                  <span>MEUS EVENTOS</span>
                </div>
                <div className="search-row">
                  <input 
                    className="modern-input search-input" 
                    placeholder="Pesquise pelo nome, descrição ou local do evento..." 
                  />
                </div>
              </div>
                <div className="events-grid">
                {loading ? (
                  <div className="loading-message">Carregando...</div>
                ) : error ? (
                  <div className="status-message status-error">{error}</div>                ) : myEvents.length === 0 ? (
                  <div className="empty-message">Nenhum evento encontrado</div>
                ) : (
                  myEvents.filter(ev => !!ev.id).map(ev => (
                    <EventCard 
                      key={ev.id} 
                      event={ev} 
                      type="primary" 
                      linkTo={`/edit_event/${ev.id}`} 
                    />
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Eventos Públicos */}
          <section className="events-section">
            <div className="glass-card">
              <div className="section-header">
                <div className="section-title">
                  <img src={publicEventsImg} alt="Eventos públicos" className="section-icon" />
                  <span>EVENTOS PÚBLICOS</span>
                </div>
                <div className="search-row">
                  <input 
                    className="modern-input search-input" 
                    placeholder="Pesquise pelo nome, descrição ou local do evento..." 
                  />
                </div>
              </div>
                <div className="events-grid">
                {loading ? (
                  <div className="loading-message">Carregando...</div>
                ) : error ? (
                  <div className="status-message status-error">{error}</div>                ) : publicEvents.length === 0 ? (
                  <div className="empty-message">Nenhum evento público encontrado</div>
                ) : (
                  publicEvents.filter(ev => !!ev.id).map(ev => (
                    <EventCard 
                      key={ev.id} 
                      event={ev} 
                      type="secondary" 
                      linkTo={`/event/${ev.id}`} 
                    />
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default Main;