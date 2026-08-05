import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './DashboardMedecin.css';

function initiales(nom, prenom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function DashboardMedecin() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [urgences, setUrgences] = useState([]);
    const [rendezVous, setRendezVous] = useState([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));

        api.get('/urgences').then((res) => setUrgences(res.data)).catch(() => setUrgences([]));
        api.get('/rendez-vous/medecin/mes-rendez-vous').then((res) => setRendezVous(res.data)).catch(() => setRendezVous([]));
    }, [navigate]);

    if (!user) return null;

    const urgenceCritique = urgences.find((u) => u.gravite === 'critique') || urgences[0];

    return (
        <div className="dashmed-page">
            <div className="dashmed-header">
                <div className="dashmed-header-left">
                    <div className="dashmed-avatar">👨‍⚕️</div>
                    <div>
                        <h1>Ma Consultation</h1>
                        <p>Dr. {user.prenom} {user.nom}</p>
                    </div>
                </div>
                <button className="dashmed-bell">🔔</button>
            </div>

            <div className="dashmed-greeting">
                <p className="dashmed-specialite">Cardiologue</p>
                <h2>Bonjour, Dr. {user.prenom}</h2>
            </div>

            {urgences.length > 0 && (
                <div className="urgence-banner" onClick={() => navigate('/urgences-medecin')}>
                    <div className="urgence-banner-icone">🚨</div>
                    <div className="urgence-banner-texte">
                        <h3>{urgences.length} Urgence{urgences.length > 1 ? 's' : ''} en attente</h3>
                        <p>{urgenceCritique?.position || 'Position non précisée'} — Cas {urgenceCritique?.gravite}</p>
                    </div>
                    <span className="urgence-banner-chevron">›</span>
                </div>
            )}

            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-box-top">
                        <span className="stat-box-icone">👥</span>
                        <span className="stat-box-badge">+12%</span>
                    </div>
                    <p className="stat-box-label">Patients ce mois</p>
                    <div className="stat-box-value">{rendezVous.length}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-box-top">
                        <span className="stat-box-icone">💰</span>
                        <span className="stat-box-badge">+8%</span>
                    </div>
                    <p className="stat-box-label">Revenus</p>
                    <div className="stat-box-value">— FCFA</div>
                </div>
            </div>

            <div className="rdv-jour-header">
                <h2>Rendez-vous du jour</h2>
                <a onClick={() => navigate('/rendez-vous-medecin')}>Voir tout</a>
            </div>

            {rendezVous.length === 0 && (
                <p className="dashmed-empty">Aucun rendez-vous pour le moment.</p>
            )}

            {rendezVous.slice(0, 4).map((r) => (
                <div key={r.id} className="rdvmed-item">
                    <div className="rdvmed-avatar">{initiales(r.patient_nom, r.patient_prenom)}</div>
                    <div className="rdvmed-infos">
                        <h3>{r.patient_prenom} {r.patient_nom}</h3>
                        <p>🕒 {new Date(r.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — {r.motif || 'Consultation'}</p>
                    </div>
                    <span className={`rdvmed-statut ${r.statut}`}>
                        {r.statut === 'en_attente' ? 'En attente' : r.statut === 'confirme' ? 'Confirmé' : r.statut === 'termine' ? 'Terminé' : 'Annulé'}
                    </span>
                </div>
            ))}

            <div className="bottom-nav">
                <button className="nav-item active">📊<span>Tableau</span></button>
                <button className="nav-item">📅<span>Calendrier</span></button>
                <button className="nav-item">👥<span>Patients</span></button>
                <button className="nav-item" onClick={() => navigate('/profil-medecin')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default DashboardMedecin;