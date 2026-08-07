import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './UrgencesMedecin.css';

const LABELS_GRAVITE = {
    critique: 'Critique',
    serieuse: 'Élevée',
    moderee: 'Modérée',
};

function tempsEcoule(date) {
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    const heures = Math.floor(minutes / 60);
    return `Il y a ${heures}h`;
}

function UrgencesMedecin() {
    const navigate = useNavigate();
    const [urgences, setUrgences] = useState([]);
    const [chargement, setChargement] = useState(true);

    const charger = () => {
        setChargement(true);
        api.get('/urgences')
            .then((res) => setUrgences(res.data))
            .catch(() => setUrgences([]))
            .finally(() => setChargement(false));
    };

    useEffect(() => {
        charger();
    }, []);

    const prendreEnCharge = async (id) => {
        try {
            await api.patch(`/urgences/${id}/prise-en-charge`);
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    const cloturer = async (id) => {
        try {
            await api.patch(`/urgences/${id}/cloturer`);
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="urgmed-page">
            <div className="urgmed-header">
                <div className="urgmed-header-left">
                    <button>☰</button>
                    <h1>Allo Docteur</h1>
                </div>
                <div className="urgmed-header-right">
                    <button>
                        🔔
                        {urgences.length > 0 && <span className="badge-dot"></span>}
                    </button>
                </div>
            </div>

            <div className="urgmed-titre-row">
                <h2>Liste des Urgences</h2>
                <div className="actives-badge">⚠ {urgences.length} Active{urgences.length !== 1 ? 's' : ''}</div>
            </div>

            {chargement && <p className="urgmed-empty">Chargement...</p>}

            {!chargement && urgences.length === 0 && (
                <p className="urgmed-empty">Aucune urgence en attente pour le moment.</p>
            )}

            {urgences.map((u) => (
                <div key={u.id} className={`urgmed-card ${u.gravite}`}>
                    <div className="urgmed-card-content">
                        <div className="urgmed-card-top">
                            <h3>{u.patient_prenom} {u.patient_nom}</h3>
                            <span className={`urgmed-gravite-badge ${u.gravite}`}>{LABELS_GRAVITE[u.gravite] || u.gravite}</span>
                        </div>
                        <p className="urgmed-symptome">{u.symptomes}</p>
                        <div className="urgmed-meta">
                            <span>🕐 {tempsEcoule(u.date_creation)}</span>
                            <span>📍 {u.position || 'Position non précisée'}</span>
                        </div>

                        {u.statut === 'en_attente' && (
                            <div className="urgmed-actions">
                                <button className="btn-prendre-charge" onClick={() => prendreEnCharge(u.id)}>
                                    ✓ Prendre en charge
                                </button>
                                <button className="btn-cloturer" onClick={() => cloturer(u.id)}>
                                    ✕ Clôturer
                                </button>
                            </div>
                        )}

                        {u.statut === 'prise_en_charge' && (
                            <div className="urgmed-actions">
                                <span className="urgmed-statut-tag">✓ Prise en charge</span>
                                <button className="btn-cloturer" onClick={() => cloturer(u.id)}>
                                    ✕ Clôturer
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ))}

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-medecin')}>📊<span>Dashboard</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous-medecin')}>📅<span>Calendrier</span></button>
                <button className="nav-item" onClick={() => navigate('/patients-medecin')}>👥<span>Patients</span></button>
                <button className="nav-item" onClick={() => navigate('/profil-medecin')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default UrgencesMedecin;