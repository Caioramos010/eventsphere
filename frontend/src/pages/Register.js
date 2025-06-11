import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline, IoCamera, IoTrash } from 'react-icons/io5';
import '../styles/auth.css';
import logo from '../images/logo-login.png';
import AuthService from '../services/AuthService';

const Register = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [foto, setFoto] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Verificar se usuário já está logado
  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      navigate('/main');
    }
  }, [navigate]);

  // Handler para upload de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result;
        setFoto(base64);
        setFotoPreview(base64);
        setError(''); // Limpar erro se havia
      };
      reader.readAsDataURL(file);
    }
  };

  // Remover foto
  const handleRemoveFoto = () => {
    setFoto('');
    setFotoPreview('');
    // Limpar o input file
    const fileInput = document.getElementById('foto-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const userData = {
        name: nome,
        email: email,
        username: login,
        password: senha,
        photo: foto
      };
      
      const result = await AuthService.register(userData);
      
      if (result.success) {
        setSuccess(result.message || 'Registro realizado com sucesso!');
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(result.message || 'Erro ao registrar usuário');
      }
    } catch (err) {
      console.error('Register error:', err);
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
          <div className="auth-photo-section">
            {fotoPreview ? (
              <div className="auth-photo-preview">
                <img src={fotoPreview} alt="Preview" className="auth-photo-img" />
                <button 
                  type="button" 
                  className="auth-photo-remove"
                  onClick={handleRemoveFoto}
                >
                  <IoTrash size={14} />
                </button>
              </div>
            ) : (
              <div className="auth-photo-placeholder">
                <IoCamera size={30} />
                <p>Adicionar foto</p>
              </div>
            )}
            <input
              id="foto-input"
              type="file"
              accept="image/*"
              onChange={handleFotoChange}
              className="auth-photo-input"
            />
          </div>
          
          <div className="form-group">
            <label className="auth-label">NOME</label>
            <input
              className="auth-input"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              placeholder="Digite seu nome completo"
            />
          </div>
          
          <div className="form-group">
            <label className="auth-label">E-MAIL</label>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Digite seu e-mail"
            />
          </div>
          
          <div className="form-group">
            <label className="auth-label">LOGIN</label>
            <input
              className="auth-input"
              type="text"
              value={login}
              onChange={e => setLogin(e.target.value)}
              required
              placeholder="Escolha um login"
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
                placeholder="Crie uma senha"
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
            <div className="auth-password-requirements">
              Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial (@$!%*?&)
            </div>
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}
          
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="auth-spinner"></div>
                REGISTRANDO...
              </>
            ) : 'REGISTRO'}
          </button>
        </form>
        
        <div className="auth-switch">
          Já possui login? <span className="auth-link" onClick={() => navigate('/login')}>Logue agora</span>
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

export default Register;
