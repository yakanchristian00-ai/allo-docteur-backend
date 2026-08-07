import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './RendezVousMedecin.css';

function initiales(nom, prenom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function genererDates() {
    const jours = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];
    const dates = [];
    for (let i = -1; i < 4; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        dates.push({
            label: jours[d.getDay()],
            jour: d.getDate(),
            iso: d.toISOString().split('T')[0],
        });
    }
    return dates;
}

function RendezVousMedecin() {
    const navigate = useNavigate();
    const [dates] = useState(genererDates());
    const [dateSelectionnee, setDateSelectionnee] = useState(new Date().toISOString().split('T')[0]);
    const [rendezVous, setRendezVous] = useState([]);
    const [chargement, setChargement] = useState(true);

    const charger = () => {
        setChargement(true);
        api.get('/rendez-vous/medecin/mes-rendez-vous')
            .then((res) => setRendezVous(res.data))
            .catch(() => setRendezVous([]))
            .finally(() => setChargement(false));
    };

    useEffect(() => {
        charger();
    }, []);

    const confirmer = async (id) => {
        try {
            await api.patch(`/rendez-vous/${id}/confirmer`);
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    const rdvDuJour = rendezVous.filter(
        (r) => r.date_rdv.split('T')[0] === dateSelectionnee
    );

    return (
        <div className="rdvmed-page">
            <div className="rdvmed-topbar">
                <div className="rdvmed-topbar-left">
                    <div className="rdvmed-topbar-avatar">👨‍⚕️</div>
                    <h1>Allo Docteur</h1>
                </div>
                <button>🔔</button>
            </div>

            <div className="rdvmed-titre-section">
                <h2>Mes Rendez-vous</h2>
                <p>Gérez vos consultations de la journée.</p>
            </div>

            <div className="dates-scroll-med">
                {dates.map((d) => (
                    <button
                        key={d.iso}
                        className={`date-chip-med ${dateSelectionnee === d.iso ? 'selected' : ''}`}
                        onClick={() => setDateSelectionnee(d.iso)}
                    >
                        <div className="jour-nom">{d.label}</div>
                        <div className="jour-num">{d.jour}</div>
                    </button>
                ))}
            </div>

            {chargement && <p className="rdvmed-empty">Chargement...</p>}

            {!chargement && rdvDuJour.length === 0 && (
                <p className="rdvmed-empty">Aucun rendez-vous ce jour-là.</p>
            )}

            {rdvDuJour.map((r) => {
                const heure = new Date(r.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                const enAttente = r.statut === 'en_attente';

                return (
                    <div key={r.id} className={`rdvmed-card ${enAttente ? 'attente' : ''}`}>
                        <div className="rdvmed-card-top">
                            <div className="rdvmed-card-avatar">{initiales(r.patient_nom, r.patient_prenom)}</div>
                            <div className="rdvmed-card-nom">
                                <h3>{r.patient_prenom} {r.patient_nom}</h3>
                                <p>{r.motif || 'Consultation'}</p>
                            </div>
                            <div className={`rdvmed-card-heure ${enAttente ? 'attente' : ''}`}>
                                <div className="heure">{heure}</div>
                                <div className="duree">30 min</div>
                            </div>
                        </div>

                        <hr className="rdvmed-separateur" />

                        {r.statut === 'termine' && (
                            <span className="rdvmed-statut-chip termine">✓ Terminé</span>
                        )}

                        {r.statut === 'confirme' && (
                            <span className="rdvmed-statut-chip confirme">📅 Confirmé</span>
                        )}

                        {r.statut === 'annule' && (
                            <span className="rdvmed-statut-chip termine">✕ Annulé</span>
                        )}

                        {enAttente && (
                            <>
                                <span className="rdvmed-statut-chip attente">◔ En attente de confirmation</span>
                                <div className="rdvmed-card-actions">
                                    <button className="btn-confirmer-med" onClick={() => confirmer(r.id)}>Confirmer</button>
                                    <button className="btn-reporter">Reporter</button>
                                </div>
                            </>
                        )}
                    </div>
                );
            })}

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-medecin')}>📊<span>Tableau de bord</span></button>
                <button className="nav-item active">📅<span>Calendrier</span></button>
                <button className="nav-item" onClick={() => navigate('/patients-medecin')}>👥<span>Patients</span></button>
                <button className="nav-item" onClick={() => navigate('/profil-medecin')}>👤<span>Profil</span></button>
            </div>
        </div>
    );
}

export default RendezVousMedecin;