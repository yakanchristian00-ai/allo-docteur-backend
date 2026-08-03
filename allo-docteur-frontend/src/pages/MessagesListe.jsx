import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MessagesListe.css';

function MessagesListe() {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        api.get('/messages/conversations')
            .then((res) => setConversations(res.data))
            .catch(() => setConversations([]));
    }, []);

    return (
        <div className="msgliste-page">
            <div className="msgliste-header">
                <h1>Messages</h1>
            </div>

            {conversations.length === 0 && (
                <p className="conversation-empty">Aucune conversation pour le moment.</p>
            )}

            {conversations.map((c) => (
                <div
                    key={c.contact_id}
                    className="conversation-item"
                    onClick={() => navigate(`/messages/${c.contact_id}`)}
                >
                    <div className="conversation-avatar">
                        {c.contact_role === 'medecin' ? '👨‍⚕️' : '🙂'}
                    </div>
                    <div className="conversation-content">
                        <div className="conversation-top">
                            <h3>{c.contact_role === 'medecin' ? 'Dr. ' : ''}{c.contact_prenom} {c.contact_nom}</h3>
                            <span>{new Date(c.date_dernier_message).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                        </div>
                        <p className="conversation-preview">{c.dernier_message}</p>
                    </div>
                </div>
            ))}

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>🏠<span>Accueil</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous')}>📅<span>RDV</span></button>
                <button className="nav-item active">💬<span>Messages</span></button>
                <button className="nav-item" onClick={() => navigate('/profil')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default MessagesListe;