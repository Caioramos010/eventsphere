import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPersonOutline, IoArrowBack, IoCamera, IoTrash, IoSave, IoMailOutline, IoLockClosedOutline, IoPersonCircleOutline, IoSettingsOutline } from 'react-icons/io5';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserService from '../services/UserService';
import AuthService from '../services/AuthService';
import getUserPhotoUrl from '../utils/getUserPhotoUrl';
import { useUser } from '../contexts/UserContext';
import { useFormState } from '../hooks/useFormState';
import '../styles/UserProfile.css';
import { validateRequired, validateEmail, validatePassword } from '../utils/validators';
import { Button, Message, FormField } from '../components';
import '../styles/UserProfile.css';

export default function UserProfile() {
  const { user: contextUser, updateUser } = useUser();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('photo');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state for user info
  const { values: userForm, errors: userErrors, handleChange: handleUserChange, validate: validateUserForm } = useFormState({
    name: '',
    email: '',
    username: ''
  }, {
    name: [validateRequired('Nome é obrigatório')],
    email: [validateRequired('E-mail é obrigatório'), validateEmail()],
    username: [validateRequired('Login é obrigatório')]
  });

  // Form state for password change
  const { values: passwordForm, errors: passwordErrors, handleChange: handlePasswordChange, validate: validatePasswordForm, reset: resetPasswordForm } = useFormState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }, {
    currentPassword: [validateRequired('Senha atual é obrigatória')],
    newPassword: [validateRequired('Nova senha é obrigatória'), validatePassword()],
    confirmPassword: [validateRequired('Confirmação de senha é obrigatória')]
  });


  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      // Update form values using the new form state
      Object.keys(userForm).forEach(key => {
        if (contextUser[key]) {
          handleUserChange({ target: { name: key, value: contextUser[key] } });
        }
      });
    }
  }, [contextUser, userForm, handleUserChange]);

  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      navigate('/login');
      return;
    }


    async function syncUser() {
      const result = await UserService.fetchCurrentUserProfileAndSync();
      if (result.success && result.user) {
        setUser(result.user);
        // Update form values
        Object.keys(userForm).forEach(key => {
          if (result.user[key]) {
            handleUserChange({ target: { name: key, value: result.user[key] } });
          }
        });
        setPhotoPreview(getUserPhotoUrl(result.user.photo));
      } else {
        const userData = AuthService.getCurrentUser();
        if (userData) {
          setUser(userData);
          Object.keys(userForm).forEach(key => {
            if (userData[key]) {
              handleUserChange({ target: { name: key, value: userData[key] } });
            }
          });
          setPhotoPreview(getUserPhotoUrl(userData.photo));
        }
      }
    }
    syncUser();
  }, [navigate, handleUserChange]);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ text: 'Por favor, selecione apenas arquivos de imagem', type: 'error' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: 'A imagem deve ter no máximo 5MB', type: 'error' });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setMessage({ text: '', type: '' });
    }
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoPreview(user?.photo || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setMessage({ text: '', type: '' });
  }

  async function handleUploadPhoto() {
    if (!photoFile) {
      setMessage({ text: 'Selecione uma foto para fazer o upload', type: 'error' });
      return;
    }
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const result = await UserService.uploadUserPhoto(photoFile, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (result.success) {
        setMessage({ text: 'Foto atualizada com sucesso!', type: 'success' });
        const updatedUser = { ...user, photo: result.photoUrl };
        setUser(updatedUser);
        updateUser(updatedUser);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setMessage({ text: result.message || 'Erro ao fazer upload da foto', type: 'error' });
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setMessage({ 
        text: err.name === 'AbortError' ? 'Tempo de requisição esgotado' : 'Erro ao conectar com o servidor', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateEmail(e) {
    e.preventDefault();
    
    if (!validateUserForm()) {
      setMessage({ text: 'Por favor, corrija os erros no formulário', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!userForm.email || userForm.email === user.email) {
        setMessage({ text: 'Digite um novo email válido', type: 'error' });
        return;
      }
      
      const result = await UserService.updateEmail(userForm.email);
      
      if (result.success) {
        setMessage({ text: result.message || 'Email atualizado com sucesso!', type: 'success' });
        const updatedUser = { ...user, email: userForm.email };
        setUser(updatedUser);
        updateUser(updatedUser);
      } else {
        setMessage({ text: result.message || 'Erro ao atualizar email', type: 'error' });
      }
    } catch (err) {
      console.error('Update email error:', err);
      setMessage({ text: 'Erro ao conectar com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUsername(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!userForm.username || userForm.username === user.username) {
        setMessage({ text: 'Digite um novo login válido', type: 'error' });
        return;
      }
      const result = await UserService.updateUsername(userForm.username);
      if (result.success) {
        setMessage({ text: result.message || 'Login atualizado com sucesso!', type: 'success' });
        const updatedUser = { ...user, username: userForm.username };
        setUser(updatedUser);
        updateUser(updatedUser);
      } else {
        setMessage({ text: result.message || 'Erro ao atualizar login', type: 'error' });
      }
    } catch (err) {
      console.error('Update username error:', err);
      setMessage({ text: 'Erro ao conectar com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    setMessage({ text: '', type: '' });
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setMessage({ text: 'Preencha todos os campos de senha', type: 'error' });
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setMessage({ text: 'A nova senha e confirmação não coincidem', type: 'error' });
        return;
      }
      if (passwordForm.newPassword.length < 8) {
        setMessage({ text: 'A nova senha deve ter pelo menos 8 caracteres', type: 'error' });
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
      if (!passwordRegex.test(passwordForm.newPassword)) {
        setMessage({ text: 'A nova senha deve conter: maiúscula, minúscula, número e caractere especial', type: 'error' });
        return;
      }
      const result = await UserService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        setMessage({ text: result.message || 'Senha atualizada com sucesso!', type: 'success' });
        resetPasswordForm();
      } else {
        setMessage({ text: result.message || 'Erro ao atualizar senha', type: 'error' });
      }
    } catch (err) {
      console.error('Update password error:', err);
      setMessage({ text: 'Erro ao conectar com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="page-main">
            <div className="glass-card">
              <div style={{ textAlign: 'center', color: 'var(--color-text-white)' }}>
                Carregando...
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
            <button className="back-btn" onClick={() => navigate('/main')}>
              <IoArrowBack />
            </button>
            <div className="page-title">
              <IoPersonOutline className="page-icon" />
              <div>
                <h1>Perfil do Usuário</h1>
                <div className="subtitle">Gerencie suas informações</div>
              </div>
            </div>
          </div>
          <div className="glass-card">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'photo' ? 'active' : ''}`}
                onClick={() => setActiveTab('photo')}
              >
                <IoCamera />
                Foto
              </button>
              <button
                className={`profile-tab ${activeTab === 'email' ? 'active' : ''}`}
                onClick={() => setActiveTab('email')}
              >
                <IoMailOutline />
                Email
              </button>
              <button
                className={`profile-tab ${activeTab === 'username' ? 'active' : ''}`}
                onClick={() => setActiveTab('username')}
              >
                <IoPersonCircleOutline />
                Login
              </button>
              <button
                className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                <IoLockClosedOutline />
                Senha
              </button>
              <button
                className={`profile-tab ${activeTab === 'account' ? 'active' : ''}`}
                onClick={() => setActiveTab('account')}
              >
                <IoSettingsOutline />
                Conta
              </button>
            </div>
            {activeTab === 'photo' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Foto de perfil</h3>
                <div className="photo-container">
                  <div className="photo-wrapper">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Foto de perfil"
                        className="profile-photo"
                        onError={() => setPhotoPreview('')}
                      />
                    ) : (
                      <div className="photo-placeholder">
                        <IoPersonOutline size={60} />
                        <br />
                        Nenhuma foto
                      </div>
                    )}
                    <label htmlFor="photo-input" className="photo-upload-btn">
                      <IoCamera />
                    </label>
                    {(photoPreview || photoFile) && (
                      <button
                        className="photo-remove-btn"
                        onClick={handleRemovePhoto}
                        disabled={loading}
                        title="Remover foto"
                      >
                        <IoTrash />
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    id="photo-input"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <div className="photo-info">
                    A foto deve ter no máximo 5MB e estar nos formatos JPG, PNG ou GIF
                  </div>
                  {photoFile && (
                    <div className="photo-actions">
                      <button
                        className="modern-btn photo-action-btn"
                        onClick={handleUploadPhoto}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="loading-spinner" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <IoSave size={16} />
                            Salvar foto
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'email' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Alterar email</h3>
                <form onSubmit={handleUpdateEmail} className="profile-form">
                  <div className="form-group">
                    <label className="modern-label">Email Atual</label>
                    <input
                      type="text"
                      value={user.email || ''}
                      className="modern-input"
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Novo Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={userForm.email}
                      onChange={handleUserChange}
                      className="modern-input"
                      placeholder="Digite o novo email"
                      required
                    />
                  </div>
                  <button className="modern-btn" type="submit" disabled={loading}>
                    {loading && <div className="loading-spinner" />}
                    {loading ? 'Atualizando...' : 'Atualizar Email'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'username' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Alterar login</h3>
                <form onSubmit={handleUpdateUsername} className="profile-form">
                  <div className="form-group">
                    <label className="modern-label">Login Atual</label>
                    <input
                      type="text"
                      value={user.username || ''}
                      className="modern-input"
                      disabled
                      style={{ opacity: 0.7 }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Novo Login *</label>
                    <input
                      type="text"
                      name="username"
                      value={userForm.username}
                      onChange={handleUserChange}
                      className="modern-input"
                      placeholder="Digite o novo login"
                      required
                    />
                  </div>
                  <button className="modern-btn" type="submit" disabled={loading}>
                    {loading && <div className="loading-spinner" />}
                    {loading ? 'Atualizando...' : 'Atualizar Login'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'password' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Alterar senha</h3>
                <form onSubmit={handleUpdatePassword} className="profile-form">
                  <div className="form-group">
                    <label className="modern-label">Senha Atual *</label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      className="modern-input"
                      placeholder="Digite sua senha atual"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Nova Senha *</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      className="modern-input"
                      placeholder="Digite a nova senha"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="modern-label">Confirmar Nova Senha *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      className="modern-input"
                      placeholder="Confirme a nova senha"
                      required
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-gray-light)',
                      marginBottom: '16px',
                      textAlign: 'center',
                    }}
                  >
                    Senha deve ter: 8+ caracteres, maiúscula, minúscula, número e caractere especial (@$!%*?&)
                  </div>
                  <button className="modern-btn" type="submit" disabled={loading}>
                    {loading && <div className="loading-spinner" />}
                    {loading ? 'Atualizando...' : 'Atualizar Senha'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'account' && (
              <div className="profile-section">
                <h3 className="profile-section-title">Configurações da Conta</h3>
                <div className="account-section">
                  <div className="account-warning">
                    <h4 style={{ color: 'var(--color-danger)', marginBottom: '12px' }}>
                      ⚠️ Zona de Perigo
                    </h4>
                    <p style={{ color: 'var(--color-gray-light)', marginBottom: '20px', fontSize: '14px' }}>
                      As ações abaixo são irreversíveis e resultarão na perda permanente de todos os seus dados.
                    </p>
                    <button
                      className="modern-btn danger-btn"
                      style={{ 
                        background: 'var(--color-danger)', 
                        color: '#fff', 
                        border: '2px solid #b00020', 
                        boxShadow: '0 2px 8px #b0002022',
                        padding: '12px 24px',
                        fontWeight: 'bold'
                      }}
                      onClick={async () => {
                        const password = window.prompt('Digite sua senha para confirmar a exclusão da conta:');
                        if (!password) return;
                        if (window.confirm('Tem certeza que deseja deletar sua conta? Esta ação é irreversível.')) {
                          setLoading(true);
                          setMessage({ text: '', type: '' });
                          const result = await UserService.deleteAccount(password);
                          setLoading(false);
                          if (result.success) {
                            alert('Conta deletada com sucesso!');
                            AuthService.logout();
                            navigate('/login');
                          } else {
                            setMessage({ text: result.message || 'Erro ao deletar conta', type: 'error' });
                          }
                        }
                      }}
                      disabled={loading}
                    >
                      🗑️ Deletar Conta Permanentemente
                    </button>
                  </div>
                </div>
              </div>
            )}
            {message.text && message.type === 'error' && <div className="status-message status-error">{message.text}</div>}
            {message.text && message.type === 'success' && <div className="status-message status-success">{message.text}</div>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}