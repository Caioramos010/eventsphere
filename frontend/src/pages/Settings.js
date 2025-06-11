import React from 'react';
import '../styles/common.css';
import './Settings.css';

const Settings = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <h1 className="page-title">Configurações</h1>
        <div className="settings-container">
          <div className="settings-section">
            <h2 className="settings-section-title">Conta</h2>
            <div className="settings-option">
              <h3>Alterar senha</h3>
              <p>Atualize sua senha para manter sua conta segura</p>
              <button className="btn-primary">Alterar senha</button>
            </div>
            <div className="settings-option">
              <h3>Alterar email</h3>
              <p>Atualize seu endereço de email</p>
              <button className="btn-primary">Alterar email</button>
            </div>
          </div>
          
          <div className="settings-section">
            <h2 className="settings-section-title">Notificações</h2>
            <div className="settings-option">
              <h3>Notificações por email</h3>
              <p>Receba atualizações sobre seus eventos por email</p>
              <div className="toggle-switch">
                <input type="checkbox" id="email-notifications" />
                <label htmlFor="email-notifications"></label>
              </div>
            </div>
            <div className="settings-option">
              <h3>Lembretes de eventos</h3>
              <p>Receba lembretes antes dos seus eventos</p>
              <div className="toggle-switch">
                <input type="checkbox" id="event-reminders" defaultChecked />
                <label htmlFor="event-reminders"></label>
              </div>
            </div>
          </div>
          
          <div className="settings-section">
            <h2 className="settings-section-title">Privacidade</h2>
            <div className="settings-option">
              <h3>Perfil público</h3>
              <p>Permitir que outros usuários vejam seu perfil</p>
              <div className="toggle-switch">
                <input type="checkbox" id="public-profile" defaultChecked />
                <label htmlFor="public-profile"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
