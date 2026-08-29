import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, Users, DollarSign, Clock, Salad } from 'lucide-react';
import api from '../api/axios';
import './DashboardMedecin.css';
import Avatar from '../components/Avatar';

function initiales(nom, prenom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function DashboardMedecin() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [urgences, setUrgences] = useState([]);
    const [rendezVous, setRendezVous] = useState([]);
    const [specialite, setSpecialite] = useState('');


    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));

        api.get('/urgences').then((res) => setUrgences(res.data)).catch(() => setUrgences([]));
        api.get('/rendez-vous/medecin/mes-rendez-vous').then((res) => setRendezVous(res.data)).catch(() => setRendezVous([]));
        api.get('/profil-medecin/moi').then((res) => setSpecialite(res.data.specialite)).catch(() => {});
    }, [navigate]);

    if (!user) return null;

    const urgenceCritique = urgences.find((u) => u.gravite === 'critique') || urgences[0];
    const statutLabels = {
        en_attente: 'En attente',
        confirme: 'Confirmé',
        termine: 'Terminé',
    };

    return (
        <div className="dashmed-page">
            <div className="dashmed-header">
                <div className="dashmed-header-left">
                    <Avatar photoUrl={user.photo_url} emoji="👨‍⚕️" size={40} />
                    <div>
                        <h1>Ma Consultation</h1>
                        <p>Dr. {user.prenom} {user.nom}</p>
                    </div>
                </div>
                <button type="button" className="dashmed-bell"><Bell size={20} /></button>
            </div>

            <div className="dashmed-greeting">
                <p className="dashmed-specialite">{specialite || 'Spécialité non renseignée'}</p>
                <h2>Bonjour, Dr. {user.prenom}</h2>
            </div>

            {urgences.length > 0 && (
                <button type="button" className="urgence-banner" onClick={() => navigate('/urgences-medecin')}>
                    <div className="urgence-banner-icone"><AlertTriangle size={20} /></div>
                    <div className="urgence-banner-texte">
                        <h3>{urgences.length} Urgence{urgences.length > 1 ? 's' : ''} en attente</h3>
                        <p>{urgenceCritique?.position || 'Position non précisée'} — Cas {urgenceCritique?.gravite}</p>
                    </div>
                    <span className="urgence-banner-chevron">›</span>
                </button>
            )}

            <div className="stats-row">
                <div className="stat-box">
                    <div className="stat-box-top">
                        <span className="stat-box-icone"><Users size={18} /></span>
                        <span className="stat-box-badge">+12%</span>
                    </div>
                    <p className="stat-box-label">Patients ce mois</p>
                    <div className="stat-box-value">{rendezVous.length}</div>
                </div>
                <div className="stat-box">
                    <div className="stat-box-top">
                        <span className="stat-box-icone"><DollarSign size={18} /></span>
                        <span className="stat-box-badge">+8%</span>
                    </div>
                    <p className="stat-box-label">Revenus</p>
                    <div className="stat-box-value">— FCFA</div>
                </div>
            </div>

            <div className="rdv-jour-header">
                <h2>Rendez-vous du jour</h2>
                <button type="button" onClick={() => navigate('/rendez-vous-medecin')}>Voir tout</button>
            </div>

            {rendezVous.length === 0 && (
                <p className="dashmed-empty">Aucun rendez-vous pour le moment.</p>
            )}

            {rendezVous.slice(0, 4).map((r) => (
                <div key={r.id} className="rdvmed-item">
                    <div className="rdvmed-avatar">{initiales(r.patient_nom, r.patient_prenom)}</div>
                    <div className="rdvmed-infos">
                        <h3>{r.patient_prenom} {r.patient_nom}</h3>
                        <p><Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{new Date(r.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} — {r.motif || 'Consultation'}</p>
                    </div>
                    <span className={`rdvmed-statut ${r.statut}`}>
                        {statutLabels[r.statut] || 'Annulé'}
                    </span>
                </div>
            ))}
                         <button
                             type="button"
               onClick={() => navigate('/gestion-conseils')}
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '8px',
                 width: 'calc(100% - 40px)',
                 margin: '0 20px 16px 20px',
                 padding: '14px',
                 background: '#2563EB',
                 color: 'white',
                 border: 'none',
                 borderRadius: '14px',
                 fontSize: '14px',
                 fontWeight: 700,
                 cursor: 'pointer'
                }}
            >
              <Salad size={16} /> Gérer les conseils
            </button>           

            <div className="bottom-nav">
                <button type="button" className="nav-item active">📊<span>Tableau</span></button>
                <button type="button" className="nav-item" onClick={() => navigate('/rendez-vous-medecin')}>📅<span>Calendrier</span></button>
                <button type="button" className="nav-item" onClick={() => navigate('/patients-medecin')}>👥<span>Patients</span></button>
                <button type="button" className="nav-item" onClick={() => navigate('/profil-medecin')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default DashboardMedecin;