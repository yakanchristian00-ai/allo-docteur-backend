import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import './MessageChat.css';

function MessageChat() {
  const navigate = useNavigate();
  const { contactId } = useParams();
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [contact, setContact] = useState(null);
  const [fichierEnCours, setFichierEnCours] = useState(false);
  const [imageAgrandie, setImageAgrandie] = useState(null);
  const [abonnementActif, setAbonnementActif] = useState(false);
  const finRef = useRef(null);
  const inputFileRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const chargerMessages = () => {
    api.get(`/messages/conversation/${contactId}`)
      .then((res) => setMessages(res.data))
      .catch(() => setMessages([]));
  };

  useEffect(() => {
    chargerMessages();
    api.get('/messages/conversations').then((res) => {
      const c = res.data.find((c) => String(c.contact_id) === String(contactId));
      if (c) setContact(c);
    });
  }, [contactId]);

  useEffect(() => {
    if (user.role === 'patient') {
      api.get('/abonnements/statut').then((res) => setAbonnementActif(res.data.actif)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const envoyer = async () => {
    if (!nouveauMessage.trim()) return;
    try {
      await api.post('/messages', {
        destinataire_id: Number(contactId),
        contenu: nouveauMessage,
      });
      setNouveauMessage('');
      chargerMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFichier = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setFichierEnCours(true);
    try {
      const formData = new FormData();
      formData.append('fichier', fichier);

      const uploadRes = await api.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await api.post('/messages', {
        destinataire_id: Number(contactId),
        contenu: '',
        piece_jointe_url: uploadRes.data.url,
        piece_jointe_nom: uploadRes.data.nom,
      });

      chargerMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setFichierEnCours(false);
      e.target.value = '';
    }
  };

  const demarrerAppel = () => {
    const salle = `allodocteur-${Math.min(user.id, Number(contactId))}-${Math.max(user.id, Number(contactId))}`;
    window.open(`https://meet.jit.si/${salle}`, '_blank');
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <button className="chat-back" onClick={() => navigate(user.role === 'medecin' ? '/patients-medecin' : '/messages')}>←</button>
        <div className="chat-avatar-wrapper">
          {contact?.contact_photo_url ? (
            <img src={`http://localhost:5000/api/fichiers${contact.contact_photo_url.replace('/uploads', '')}?token=${localStorage.getItem('token')}`} alt="Contact" className="chat-avatar" style={{ objectFit: 'cover' }} />
          ) : (
            <div className="chat-avatar">{contact?.contact_role === 'medecin' ? '👨‍⚕️' : '🙂'}</div>
          )}
          <span className="online-badge"></span>
        </div>
        <div className="chat-header-info">
          <h2>{contact ? `${contact.contact_role === 'medecin' ? 'Dr. ' : ''}${contact.contact_prenom} ${contact.contact_nom}` : 'Conversation'}</h2>
          <p>{contact?.contact_specialite || <span className="text-online">En ligne</span>}</p>
        </div>
        {(user.role === 'medecin' || abonnementActif) && (
          <div className="chat-header-actions">
            <button className="icon-btn" onClick={demarrerAppel}>📹</button>
          </div>
        )}
      </div>

      <div className="chat-messages">
        <div className="chat-date-badge">Aujourd'hui</div>
        {messages.map((m) => {
          const estMoi = m.expediteur_id === user.id;
          const estImage = m.piece_jointe_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(m.piece_jointe_url);
          const urlComplete = m.piece_jointe_url ? `http://localhost:5000/api/fichiers${m.piece_jointe_url.replace('/uploads', '')}?token=${localStorage.getItem('token')}` : null;

          return (
            <div key={m.id} className={`bulle-wrapper ${estMoi ? 'moi' : 'autre'}`}>
              <div className={`bulle ${estMoi ? 'moi' : 'autre'}`}>
                {m.contenu && <div className="bulle-texte">{m.contenu}</div>}

                {estImage && (
                  <div className="attachment-image-wrapper" onClick={() => setImageAgrandie(urlComplete)}>
                    <img src={urlComplete} alt={m.piece_jointe_nom} className="attachment-img" />
                    <div className="image-overlay-zoom">Cliquer pour agrandir</div>
                  </div>
                )}

                {m.piece_jointe_url && !estImage && (
                  <a href={urlComplete} target="_blank" rel="noopener noreferrer" className="attachment-doc-card">
                    <span className="doc-icon">📄</span>
                    <div className="doc-info">
                      <span className="doc-name">{m.piece_jointe_nom}</span>
                      <span className="doc-action">Ouvrir le document</span>
                    </div>
                  </a>
                )}
              </div>
              <div className="bulle-meta">
                <span className="bulle-heure">
                  {new Date(m.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {estMoi && m.lu && <span className="read-status">✓✓</span>}
              </div>
            </div>
          );
        })}
        <div ref={finRef}></div>
      </div>

      <div className="chat-input-zone">
        <input
          type="file"
          ref={inputFileRef}
          style={{ display: 'none' }}
          onChange={handleFichier}
        />
        <button className="chat-attach" onClick={() => inputFileRef.current.click()} disabled={fichierEnCours}>
          {fichierEnCours ? '…' : '📎'}
        </button>
        <input
          className="chat-input"
          placeholder="Écrivez votre message..."
          value={nouveauMessage}
          onChange={(e) => setNouveauMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && envoyer()}
        />
        <button className="chat-send" onClick={envoyer}>➤</button>
      </div>

      {imageAgrandie && (
        <div className="lightbox-overlay" onClick={() => setImageAgrandie(null)}>
          <div className="lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setImageAgrandie(null)}>✕</button>
            <img src={imageAgrandie} alt="Aperçu" className="lightbox-full-img" />
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageChat;