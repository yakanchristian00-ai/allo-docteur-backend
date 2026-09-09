import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MessagesListe.css';

function MessagesListe() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.get('/messages/conversations')
      .then((res) => setConversations(res.data))
      .catch(() => setConversations([]))
      .finally(() => setChargement(false));
  }, []);

  const conversationsFiltrees = conversations.filter((c) => {
    const nomComplet = `${c.contact_prenom} ${c.contact_nom} ${c.contact_specialite || ''}`.toLowerCase();
    return nomComplet.includes(recherche.toLowerCase());
  });

  return (
    <div className="msgliste-page">
      <div className="msgliste-header">
        <div className="header-top">
          <button className="back-btn" onClick={() => navigate('/dashboard-patient')}>←</button>
          <div>
            <h1>Messagerie Médicale</h1>
            <p className="subtitle">Échangez en toute sécurité avec vos praticiens</p>
          </div>
        </div>
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-bar"
            placeholder="Rechercher une discussion ou un médecin..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          {recherche && (
            <button className="clear-btn" onClick={() => setRecherche('')}>✕</button>
          )}
        </div>
      </div>

      <div className="msgliste-content">
        {chargement && <div className="loading-state">Chargement...</div>}

        {!chargement && conversationsFiltrees.length === 0 && (
          <div className="empty-messages-state">
            <div className="empty-icon">💬</div>
            <h3>Aucune conversation</h3>
            <p>Vous n'avez pas encore échangé de messages.</p>
            <button className="btn-nouveau-msg" onClick={() => navigate('/rendez-vous')}>
              Prendre un rendez-vous
            </button>
          </div>
        )}

        {!chargement && conversationsFiltrees.length > 0 && (
          <div className="conversations-wrapper">
            {conversationsFiltrees.map((c) => (
              <div
                key={c.contact_id}
                className={`conversation-item ${!c.lu && c.expediteur_id !== user.id ? 'unread-item' : ''}`}
                onClick={() => navigate(`/messages/${c.contact_id}`)}
              >
                <div className="avatar-wrapper">
                  {c.contact_photo_url ? (
                    <img src={`http://localhost:5000/api/fichiers${c.contact_photo_url.replace('/uploads', '')}?token=${localStorage.getItem('token')}`} alt="Contact" className="avatar-fallback" style={{ objectFit: 'cover' }} />
                  ) : (
                    <div className="avatar-fallback">{c.contact_role === 'medecin' ? '👨‍⚕️' : '🙂'}</div>
                  )}
                  <span className="online-indicator"></span>
                </div>
                <div className="conversation-content">
                  <div className="conversation-top">
                    <h3 className="contact-name">
                      {c.contact_role === 'medecin' ? 'Dr. ' : ''}{c.contact_prenom} {c.contact_nom}
                    </h3>
                    <span className="message-time">
                      {new Date(c.date_dernier_message).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  {c.contact_specialite && (
                    <span className="contact-specialite">{c.contact_specialite}</span>
                  )}
                  <div className="conversation-bottom">
                    <p className="conversation-preview">{c.dernier_message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Accueil</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/mes-rendez-vous')}>
          <span className="nav-icon">📅</span>
          <span className="nav-label">Mes RDV</span>
        </button>
        <button className="nav-item active">
          <span className="nav-icon">💬</span>
          <span className="nav-label">Messages</span>
        </button>
        <button className="nav-item" onClick={() => navigate('/urgence')}>
          <span className="nav-icon">🆘</span>
          <span className="nav-label">Urgence</span>
        </button>
      </div>
    </div>
  );
}

export default MessagesListe;