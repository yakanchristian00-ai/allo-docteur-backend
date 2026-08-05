import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MessagesListe.css';

// Liste fictive de médecins par défaut si l'API ne renvoie pas encore de conversations
const MOCK_CONVERSATIONS = [
    {
        contact_id: 1,
        contact_nom: "Martin",
        contact_prenom: "Sophie",
        contact_role: "medecin",
        specialite: "Cardiologue",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        dernier_message: "Bonjour, vos derniers résultats d'ECG sont excellents. Prenez soin de vous.",
        date_dernier_message: new Date().toISOString(),
        non_lus: 2,
        enLigne: true
    },
    {
        contact_id: 2,
        contact_nom: "Bernard",
        contact_prenom: "Thomas",
        contact_role: "medecin",
        specialite: "Médecin Généraliste",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
        dernier_message: "Je vous ai envoyé votre ordonnance en pièce jointe.",
        date_dernier_message: new Date(Date.now() - 3600000 * 4).toISOString(),
        non_lus: 0,
        enLigne: false
    },
    {
        contact_id: 3,
        contact_nom: "Dubois",
        contact_prenom: "Claire",
        contact_role: "medecin",
        specialite: "Dermatologue",
        avatar: "https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&h=150&fit=crop&crop=face",
        dernier_message: "N'hésitez pas à reprendre RDV si la rougeur persiste.",
        date_dernier_message: new Date(Date.now() - 86400000 * 2).toISOString(),
        non_lus: 0,
        enLigne: true
    }
];

function MessagesListe() {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [chargement, setChargement] = useState(true);
    const [notificationNouvelle, setNotificationNouvelle] = useState(null);
    const prevNonLusCount = useRef(0);

    const chargerConversations = () => {
        api.get('/messages/conversations')
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    setConversations(res.data);
                } else {
                    setConversations(MOCK_CONVERSATIONS);
                }
                setChargement(false);
            })
            .catch(() => {
                setConversations(MOCK_CONVERSATIONS);
                setChargement(false);
            });
    };

    useEffect(() => {
        chargerConversations();
        // Polling automatique toutes les 6 secondes pour les notifications de nouveaux messages
        const interval = setInterval(() => {
            api.get('/messages/non-lus/count')
                .then((res) => {
                    const count = res.data?.unreadCount || 0;
                    if (count > prevNonLusCount.current && prevNonLusCount.current !== 0) {
                        setNotificationNouvelle('🔔 Vous avez reçu un nouveau message !');
                        setTimeout(() => setNotificationNouvelle(null), 4000);
                    }
                    prevNonLusCount.current = count;
                })
                .catch(() => {});
            chargerConversations();
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    // Filtrage des conversations
    const conversationsFiltrees = conversations.filter(c => {
        const nomComplet = `${c.contact_prenom} ${c.contact_nom}`.toLowerCase();
        const spe = (c.specialite || '').toLowerCase();
        const msg = (c.dernier_message || '').toLowerCase();
        const q = recherche.toLowerCase();
        return nomComplet.includes(q) || spe.includes(q) || msg.includes(q);
    });

    const totalNonLus = conversations.reduce((acc, c) => acc + (c.non_lus || 0), 0);

    const formaterHeure = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const maintenant = new Date();
        const estAujourdhui = d.toDateString() === maintenant.toDateString();

        if (estAujourdhui) {
            return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="msgliste-page">
            {/* Notification Toast de Nouveau Message */}
            {notificationNouvelle && (
                <div className="toast-notification animate-bounce">
                    {notificationNouvelle}
                </div>
            )}

            {/* En-tête de la Messagerie */}
            <div className="msgliste-header">
                <div className="header-top">
                    <button className="back-btn" onClick={() => navigate('/dashboard-patient')}>←</button>
                    <div>
                        <h1>Messagerie Médicale</h1>
                        <p className="subtitle">Échangez en toute sécurité avec vos praticiens</p>
                    </div>
                </div>

                {/* Barre de Recherche */}
                <div className="search-bar-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Rechercher une discussion ou un médecin..."
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                    />
                    {recherche && <button className="clear-btn" onClick={() => setRecherche('')}>✕</button>}
                </div>
            </div>

            {/* Liste des discussions */}
            <div className="msgliste-content">
                {chargement ? (
                    <div className="loading-state">Chargement de vos conversations...</div>
                ) : conversationsFiltrees.length === 0 ? (
                    <div className="empty-messages-state">
                        <div className="empty-icon">💬</div>
                        <h3>Aucune conversation trouvée</h3>
                        <p>Vos échanges récents avec vos médecins apparaîtront ici.</p>
                        <button className="btn-nouveau-msg" onClick={() => navigate('/rendez-vous')}>
                            Contacter un médecin
                        </button>
                    </div>
                ) : (
                    <div className="conversations-wrapper">
                        {conversationsFiltrees.map((c) => (
                            <div
                                key={c.contact_id}
                                className={`conversation-item ${c.non_lus > 0 ? 'unread-item' : ''}`}
                                onClick={() => navigate(`/messages/${c.contact_id}`)}
                            >
                                <div className="avatar-wrapper">
                                    {c.avatar ? (
                                        <img src={c.avatar} alt={c.contact_nom} className="avatar-img" />
                                    ) : (
                                        <div className="avatar-fallback">
                                            {c.contact_role === 'medecin' ? '👨‍⚕️' : '👤'}
                                        </div>
                                    )}
                                    {c.enLigne !== false && <span className="online-indicator" title="En ligne"></span>}
                                </div>

                                <div className="conversation-content">
                                    <div className="conversation-top">
                                        <h3 className="contact-name">
                                            {c.contact_role === 'medecin' ? `Dr. ${c.contact_prenom} ${c.contact_nom}` : `${c.contact_prenom} ${c.contact_nom}`}
                                        </h3>
                                        <span className="message-time">{formaterHeure(c.date_dernier_message)}</span>
                                    </div>

                                    {c.specialite && (
                                        <span className="contact-specialite">{c.specialite}</span>
                                    )}

                                    <div className="conversation-bottom">
                                        <p className="conversation-preview">
                                            {c.dernier_message || 'Nouvelle conversation'}
                                        </p>
                                        {c.non_lus > 0 && (
                                            <span className="unread-badge">{c.non_lus}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Barre de navigation inférieure avec badge de notification */}
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
                    <div className="nav-icon-container">
                        <span className="nav-icon">💬</span>
                        {totalNonLus > 0 && <span className="nav-unread-dot">{totalNonLus}</span>}
                    </div>
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