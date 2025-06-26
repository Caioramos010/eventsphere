  import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import '../styles/auth.css';
import logo from '../images/logo-login.png';
import AuthService from '../services/AuthService';
import { useUser } from '../contexts/UserContext';

const Login = () => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUserProfile } = useUser();

  
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      
      const inviteToken = searchParams.get('token');
      if (inviteToken) {
        navigate(`/join-event/${inviteToken}`);
      } else {
        navigate('/main');
      }
    }
  }, [navigate, searchParams]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const credentials = {
        username: login,
        password: senha
      };
        const result = await AuthService.login(credentials);
      
      if (result.success) {

        await loadUserProfile();
        
        const inviteToken = searchParams.get('token');
        if (inviteToken) {
          navigate(`/join-event/${inviteToken}`);
        } else {
          navigate('/main');
        }
      } else {
        setError(result.message || 'Login ou senha inválidos');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <img src={logo} alt="EventSphere" className="auth-logo" />
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="auth-label">LOGIN</label>
            <input
              className="auth-input"
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              required
              placeholder="Digite seu login"
            />
          </div>
          
          <div className="form-group">
            <label className="auth-label">SENHA</label>
            <div className="auth-password-wrapper">
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                value={senha}
                onChange={e => setSenha(e.target.value)}
                required
                placeholder="Digite sua senha"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPassword(s => !s)}
                tabIndex={0}
                aria-label="Mostrar/ocultar senha"
              >
                {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
              </button>
            </div>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                ENTRANDO...
              </>
            ) : 'LOGIN'}
          </button>
        </form>
          <div className="auth-switch">
          Não possui login? <span className="auth-link" onClick={() => {
            const inviteToken = searchParams.get('token');
            if (inviteToken) {
              navigate(`/register?token=${inviteToken}`);
            } else {
              navigate('/register');
            }
          }}>Faça o registro agora</span>
        </div>
      </div>
      
      <div className="auth-shapes">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
      </div>
    </div>
  );
};

export default Login;