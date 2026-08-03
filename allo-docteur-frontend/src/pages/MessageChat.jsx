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
    const finRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const chargerMessages = () => {
        api.get(`/messages/conversation/${contactId}`)
            .then((res) => setMessages(res.data))
            .catch(() => setMessages([]));
    };

    useEffect(() => {
        chargerMessages();
        api.get('/messages/conversations')
            .then((res) => {
                const c = res.data.find((c) => String(c.contact_id) === String(contactId));
                if (c) setContact(c);
            });
    }, [contactId]);

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

    return (
        <div className="chat-page">
            <div className="chat-header">
                <button className="chat-back" onClick={() => navigate('/messages')}>←</button>
                <div className="chat-avatar">{contact?.contact_role === 'medecin' ? '👨‍⚕️' : '🙂'}</div>
                <div className="chat-header-info">
                    <h2>{contact ? `${contact.contact_role === 'medecin' ? 'Dr. ' : ''}${contact.contact_prenom} ${contact.contact_nom}` : 'Conversation'}</h2>
                    <p>{contact?.contact_role === 'medecin' ? 'Cardiologue' : ''}</p>
                </div>
            </div>

            <div className="chat-messages">
                <div className="chat-date-badge">Aujourd'hui</div>
                {messages.map((m) => {
                    const estMoi = m.expediteur_id === user.id;
                    return (
                        <div key={m.id} className={`bulle-wrapper ${estMoi ? 'moi' : 'autre'}`}>
                            <div className={`bulle ${estMoi ? 'moi' : 'autre'}`}>{m.contenu}</div>
                            <span className="bulle-heure">
                                {new Date(m.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={finRef}></div>
            </div>

            <div className="chat-input-zone">
                <button className="chat-attach">📎</button>
                <input
                    className="chat-input"
                    placeholder="Écrivez votre message..."
                    value={nouveauMessage}
                    onChange={(e) => setNouveauMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && envoyer()}
                />
                <button className="chat-send" onClick={envoyer}>➤</button>
            </div>
        </div>
    );
}

export default MessageChat;