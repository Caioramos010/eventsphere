import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import '../styles/auth.css';
import logo from '../images/logo-login.png';
import AuthService from '../services/AuthService';
import { useUser } from '../contexts/UserContext';
import { useFormState } from '../hooks/useFormState';
import { 
  validateRequired } from '../utils/validators';
import { Button, Message, FormField } from '../components';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadUserProfile } = useUser();

  const { values, errors, handleChange, validate, isValid } = useFormState({
    login: '',
    senha: ''
  }, {
    login: [validateRequired('Login é obrigatório')],
    senha: [validateRequired('Senha é obrigatória')]
  });

  
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
    
    if (!validate()) {
      setMessage({ text: 'Por favor, corrija os erros no formulário', type: 'error' });
      return;
    }
    
    setMessage({ text: '', type: '' });
    setLoading(true);
    
    try {
      const credentials = {
        username: values.login,
        password: values.senha
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
        setMessage({ text: result.message || 'Login ou senha inválidos', type: 'error' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage({ text: 'Erro ao conectar com o servidor', type: 'error' });
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
          <FormField
            label="LOGIN"
            type="text"
            name="login"
            value={values.login}
            onChange={handleChange}
            error={errors.login}
            placeholder="Digite seu login"
            required
          />
          
          <div className="form-group">
            <label className="auth-label">SENHA</label>
            <div className="auth-password-wrapper">
              <input
                className={`auth-input ${errors.senha ? 'auth-input-error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                name="senha"
                value={values.senha}
                onChange={handleChange}
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
            {errors.senha && <div className="auth-field-error">{errors.senha}</div>}
          </div>
          
          {message.text && (
            <Message 
              message={message.text} 
              type={message.type} 
              onClose={() => setMessage({ text: '', type: '' })}
            />
          )}
          
          <Button 
            type="submit" 
            variant="primary" 
            fullWidth 
            loading={loading}
            disabled={loading || !isValid}
          >
            LOGIN
          </Button>
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