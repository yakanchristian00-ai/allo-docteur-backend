import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPatient.css';

function DashboardPatient() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>Allo Docteur</h1>
                <div className="dashboard-avatar" onClick={handleLogout} title="Déconnexion">
                    👤
                </div>
            </div>

            <div className="dashboard-greeting">
                <h2>Bonjour, {user.prenom}</h2>
                <p>Voici le récapitulatif de votre santé aujourd'hui.</p>
            </div>

            <button className="btn-urgence" onClick={() => navigate('/urgence')}>
                🆘 URGENCE
            </button>

            <div className="card rdv-card">
                <div className="rdv-info">
                    <span className="card-label">Prochain rendez-vous</span>
                    <h3>Dr. Sophie Martin</h3>
                    <p>Cardiologue</p>
                    <span className="rdv-time">🕑 14:30 — Mardi 15 Octobre</span>
                </div>
                <div className="rdv-date-badge">
                    <div className="mois">Oct</div>
                    <div className="jour">15</div>
                </div>
            </div>
            <button className="btn-gerer" style={{ margin: '-8px 20px 16px 20px', width: 'calc(100% - 40px)' }}>
                Gérer
            </button>

            <div className="card">
                <div className="sante-titre">Santé Générale</div>
                <div className="sante-score">
                    <span className="pourcentage">92%</span>
                    <span className="label">Score Vital</span>
                </div>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '92%' }}></div>
                </div>
                <p className="sante-note">"Continuez vos efforts sur l'hydratation."</p>
            </div>

            <div className="section-title">Accès Rapide</div>
            <div className="quick-access">
                <button className="quick-item" onClick={() => navigate('/rendez-vous')}>
                    <div className="icon">📅</div>
                    <span>Prendre RDV</span>
                </button>
                <button className="quick-item" onClick={() => navigate('/conseils')}>
                    <div className="icon">🥗</div>
                    <span>Conseils Diététiques</span>
                </button>
                <button className="quick-item" onClick={() => navigate('/paiements')}>
                    <div className="icon">💳</div>
                    <span>Paiements</span>
                </button>
            </div>

            <div className="article-card">
                <img
                    src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop"
                    alt="Alimentation méditerranéenne"
                    className="article-image"
                />
                <div className="article-content">
                    <span className="article-tag">Nouveau conseil</span>
                    <h3>Les bienfaits du régime méditerranéen</h3>
                    <p>Découvrez comment adapter votre alimentation pour améliorer votre santé.</p>
                    <a href="#" className="article-link">Lire l'article →</a>
                </div>
            </div>

            <div className="bottom-nav">
                <button className="nav-item active">🏠<span>Accueil</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous')}>📅<span>RDV</span></button>
                <button className="nav-item" onClick={() => navigate('/messages')}>💬<span>Messages</span></button>
                <button className="nav-item" onClick={() => navigate('/profil')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default DashboardPatient;