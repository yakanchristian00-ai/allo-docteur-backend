import { useNavigate } from 'react-router-dom';
import './Profil.css';
import { useState, useEffect } from 'react';
import api from '../api/axios';


function Profil() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [abonnement, setAbonnement] = useState(null);
    const [chargementAbo, setChargementAbo] = useState(false);

    useEffect(() => {
        api.get('/abonnements/statut').then((res) => setAbonnement(res.data)).catch(() => { });
    }, []);

    const souscrire = async () => {
        setChargementAbo(true);
        try {
            await api.post('/abonnements/souscrire', { methode: 'mtn_momo' });
            const res = await api.get('/abonnements/statut');
            setAbonnement(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setChargementAbo(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="profil-page">
            <div className="profil-header">
                <div className="profil-header-left">
                    <div className="profil-avatar-header">🙂</div>
                    <h1>Mon Profil</h1>
                </div>
                <button className="profil-logout" onClick={handleLogout} title="Déconnexion">⏻</button>
            </div>

            <div className="profil-identite">
                <h2>{user.prenom} {user.nom}</h2>
                <p>Patient ID: #{String(user.id).padStart(5, '0')}</p>
            </div>

            <div className="profil-section">
                <h2>Informations personnelles</h2>
                <div className="info-card">
                    <div className="info-row">
                        <div className="info-row-texte">
                            <label>Email</label>
                            <span>{user.email}</span>
                        </div>
                        <button className="info-row-edit">✎</button>
                    </div>
                    <div className="info-row">
                        <div className="info-row-texte">
                            <label>Téléphone</label>
                            <span>{user.telephone || 'Non renseigné'}</span>
                        </div>
                        <button className="info-row-edit">✎</button>
                    </div>
                    <div className="info-row">
                        <div className="info-row-texte">
                            <label>Adresse</label>
                            <span>Non renseignée</span>
                        </div>
                        <button className="info-row-edit">✎</button>
                    </div>
                </div>
            </div>

            <div className="profil-section">
                <h2>Sécurité & Documents</h2>
                <div className="action-card">
                    <div className="action-icone">🔒</div>
                    <div className="action-texte">Changer le mot de passe</div>
                    <span className="action-chevron">›</span>
                </div>
                <div className="action-card">
                    <div className="action-icone bleu">🪪</div>
                    <div className="action-texte">Accéder à ma Carte Vitale</div>
                    <span className="action-chevron">›</span>
                </div>
            </div>
            <div className="profil-section">
                <h2>Appels vidéo</h2>
                <div className="action-card">
                    <div className="action-icone bleu">📹</div>
                    <div className="action-texte">
                        {abonnement?.actif ? (
                            <>
                                <div>Abonnement actif</div>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                                    Valide jusqu'au {new Date(abonnement.abonnement.date_fin).toLocaleDateString('fr-FR')}
                                </p>
                            </>
                        ) : (
                            <>
                                <div>Débloquez les appels vidéo</div>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#6B7280' }}>
                                    2 000 FCFA / mois
                                </p>

                            </>
                        )}
                    </div>
                    {!abonnement?.actif && (
                        <button
                            onClick={souscrire}
                            disabled={chargementAbo}
                            style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            {chargementAbo ? '...' : "S'abonner"}
                        </button>
                    )}
                </div>
            </div>

            <div className="map-card">
                <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&h=300&fit=crop"
                    alt="Carte du quartier"
                />
                <div className="map-pin">📍</div>
                <div className="map-overlay">
                    <h3>Localiser mon centre</h3>
                    <p>Douala, Cameroun</p>
                </div>
            </div>

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>🏠<span>Accueil</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous')}>📅<span>Rendez-vous</span></button>
                <button className="nav-item" onClick={() => navigate('/mes-rendez-vous')}>📄<span>Documents</span></button>
                <button className="nav-item active">👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default Profil;