import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './ProfilMedecin.css';

function ProfilMedecin() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNom = user.nom;
    const userPrenom = user.prenom;
    const [medecinInfo, setMedecinInfo] = useState(null);

    useEffect(() => {
        api.get('/medecins')
            .then((res) => {
                const moi = res.data.find((m) => m.prenom === userPrenom && m.nom === userNom);
                if (moi) setMedecinInfo(moi);
            })
            .catch(() => { });
    }, [userNom, userPrenom]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="profilmed-page">
            <div className="profilmed-topbar">
                <div className="profilmed-topbar-left">
                    <div className="profilmed-topbar-avatar">👨‍⚕️</div>
                    <h1>Allo Docteur</h1>
                </div>
                <button>🔔</button>
            </div>

            <div className="profilmed-carte-identite">
                <div className="profilmed-avatar-wrapper">
                    <div className="profilmed-avatar-grande">👨‍⚕️</div>
                    <div className="profilmed-avatar-edit">✎</div>
                </div>
                <h2>Dr. {user.prenom} {user.nom}</h2>
                <p>{medecinInfo?.specialite || 'Spécialité non renseignée'}</p>
                <div className="badge-disponible">
                    <span className="dot"></span> Disponible
                </div>
            </div>

            <div className="profilmed-section">
                <h2 className="profilmed-section-titre">👤 Informations personnelles</h2>
                <div className="profilmed-info-row">
                    <div className="profilmed-info-row-texte">
                        <label>Email</label>
                        <span>{user.email}</span>
                    </div>
                    <button className="profilmed-edit-btn">✎</button>
                </div>
                <div className="profilmed-info-row">
                    <div className="profilmed-info-row-texte">
                        <label>Téléphone</label>
                        <span>{user.telephone || 'Non renseigné'}</span>
                    </div>
                    <button className="profilmed-edit-btn">✎</button>
                </div>
                <div className="profilmed-info-row">
                    <div className="profilmed-info-row-texte">
                        <label>Licence professionnelle</label>
                        <span>{medecinInfo?.licence || 'Non renseignée'}</span>
                    </div>
                    <button className="profilmed-edit-btn">✎</button>
                </div>
            </div>

            <div className="profilmed-section">
                <h2 className="profilmed-section-titre">✚ Ma pratique</h2>
                <div className="profilmed-pratique-item">
                    <label>Spécialité</label>
                    <span>{medecinInfo?.specialite || 'Non renseignée'}</span>
                </div>
                <div className="profilmed-pratique-item">
                    <label>Lieu d'exercice</label>
                    <span>📍 Hôpital Général de Douala</span>
                </div>
            </div>

            <div className="action-card-med">
                <div className="action-icone-med">🕐</div>
                <div className="action-texte-med">
                    <h3>Disponibilités</h3>
                    <p>Gérer vos horaires de consultation</p>
                </div>
                <span>›</span>
            </div>

            <button className="btn-deconnexion-med" onClick={handleLogout}>
                ⇥ Déconnexion
            </button>

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-medecin')}>📊<span>Tableau</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous-medecin')}>📅<span>Agenda</span></button>
                <button className="nav-item" onClick={() => navigate('/patients-medecin')}>👥<span>Patients</span></button>
                <button className="nav-item active">👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default ProfilMedecin;
