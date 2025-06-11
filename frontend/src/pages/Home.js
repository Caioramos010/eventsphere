import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/home-fixed.css';
import CalendarAnimation from '../components/Animation';
import { IoCalendarOutline, IoCreateOutline, IoStatsChartOutline, IoPersonAddOutline } from 'react-icons/io5';
import logo from '../images/logo.png';
import logoFooter from '../images/logo-footer.png';
import { Link } from '../components/Link';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const headerRef = useRef(null);
  
  useEffect(() => {
    const body = document.body;
    body.classList.add('page-fade-in');
    const timeout = setTimeout(() => {
      body.classList.remove('page-fade-in');
    }, 350);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        if (window.scrollY > 50) {
          headerRef.current.classList.add('header-scrolled');
        } else {
          headerRef.current.classList.remove('header-scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header" ref={headerRef}>
        <div className="header-content">
          <img src={logo} alt="EventSphere" className="header-logo" />
          <div className="header-actions">
            <button 
              className="home-btn btn-outline" 
              onClick={() => navigate('/login')}
            >
              LOGIN
            </button>
            <button 
              className="home-btn btn-solid" 
              onClick={() => navigate('/register')}
            >
              REGISTRO
            </button>
          </div>
        </div>
      </header>      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>        <div className="hero-content">
          <h1 className="hero-title">Transforme Seus Eventos em Experiências Memoráveis</h1>
          <p className="hero-subtitle">
            Organize, gerencie e conecte pessoas com facilidade. 
            Seu evento, do planejamento ao sucesso, com uma plataforma completa e intuitiva.
          </p>
          <button 
            className="hero-cta-btn" 
            onClick={() => navigate('/register')}
          >
            CRIAR MEU EVENTO AGORA
          </button>
        </div>
        <div className="scroll-indicator" onClick={scrollToFeatures}>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" ref={featuresRef}>
        <h2 className="section-title">Tudo o que você precisa para eventos incríveis</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <IoCalendarOutline />
            </div>
            <h3 className="feature-title">Planejamento Simplificado</h3>
            <p className="feature-desc">
              Crie e configure eventos em minutos com nossa interface intuitiva.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <IoPersonAddOutline />
            </div>
            <h3 className="feature-title">Gestão de Participantes</h3>
            <p className="feature-desc">
              Envie convites, confirme presenças e gerencie check-ins com facilidade.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <IoStatsChartOutline />
            </div>
            <h3 className="feature-title">Relatórios Detalhados</h3>
            <p className="feature-desc">
              Acompanhe métricas para entender o impacto e sucesso dos seus eventos.
            </p>
          </div>
        </div>
      </section>

      {/* Animation Section */}
      <section className="animation-section">
        <div className="animation-container">
          <CalendarAnimation />
        </div>
        <div className="animation-content">
          <h2 className="animation-title">Evento Criado em Um Clique</h2>
          <p className="animation-desc">
            Crie, personalize e visualize eventos com facilidade em nossa 
            interface moderna e intuitiva. Economize tempo com nossas ferramentas avançadas.
          </p>
          <button 
            className="animation-cta-btn" 
            onClick={() => navigate('/register')}
          >
            COMECE AGORA
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <img src={logoFooter} alt="EventSphere" className="footer-logo" />
        <p className="footer-copyright">
          © {new Date().getFullYear()} EventSphere. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}

export default Home;
