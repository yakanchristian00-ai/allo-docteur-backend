import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PrendreRdv.css';

const HORAIRES = ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30'];

function genererDates() {
    const jours = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
    const dates = [];
    for (let i = 0; i < 5; i++) {
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

function PrendreRdv() {
    const navigate = useNavigate();
    const [medecins, setMedecins] = useState([]);
    const [medecinSelectionne, setMedecinSelectionne] = useState(null);
    const [dates] = useState(genererDates());
    const [dateSelectionnee, setDateSelectionnee] = useState(genererDates()[0].iso);
    const [horaireSelectionne, setHoraireSelectionne] = useState('09:30');
    const [motif, setMotif] = useState('');
    const [chargement, setChargement] = useState(false);
    const [chargementMedecins, setChargementMedecins] = useState(true);
    const [erreur, setErreur] = useState('');
    const [succes, setSucces] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        setChargementMedecins(true);
        api.get('/medecins')
            .then((res) => {
                setMedecins(res.data);
                if (res.data && res.data.length > 0) {
                    setMedecinSelectionne(res.data[0].id);
                }
            })
            .catch((err) => {
                console.error(err);
                setErreur('Impossible de charger la liste des médecins.');
            })
            .finally(() => {
                setChargementMedecins(false);
            });
    }, [navigate]);

    const handleConfirmer = async () => {
        if (!medecinSelectionne) {
            setErreur('Veuillez sélectionner un médecin.');
            return;
        }
        setErreur('');
        setSucces('');
        setChargement(true);

        try {
            const date_rdv = `${dateSelectionnee}T${horaireSelectionne}:00`;
            await api.post('/rendez-vous', {
                medecin_id: medecinSelectionne,
                date_rdv,
                motif,
            });
            setSucces('Rendez-vous confirmé avec succès !');
            setTimeout(() => navigate('/dashboard-patient'), 1500);
        } catch (err) {
            setErreur(err.response?.data?.message || 'Erreur lors de la prise de rendez-vous');
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="rdv-page">
            <div className="rdv-header">
                <h1>Prendre un RDV</h1>
                <div className="rdv-avatar" title="Retour au Dashboard" onClick={() => navigate('/dashboard-patient')}>🏠</div>
            </div>

            <div className="rdv-section">
                <h2>Quelle spécialité recherchez-vous ?</h2>
                <div className="rdv-search">
                    🔍
                    <select disabled defaultValue="all">
                        <option value="all">Toutes spécialités</option>
                    </select>
                </div>
            </div>

            <div className="rdv-section">
                <div className="rdv-section-header">
                    <h2>Praticiens disponibles</h2>
                </div>
                {erreur && <p style={{ color: '#DC2626', fontSize: '13px', margin: '6px 0' }}>{erreur}</p>}

                {chargementMedecins ? (
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Chargement des praticiens...</p>
                ) : medecins.length === 0 ? (
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>Aucun médecin disponible pour le moment.</p>
                ) : (
                    <div className="medecins-scroll">
                        {medecins.map((m) => (
                            <div
                                key={m.id}
                                className={`medecin-card ${medecinSelectionne === m.id ? 'selected' : ''}`}
                                onClick={() => setMedecinSelectionne(m.id)}
                            >
                                <div className="medecin-top">
                                    <div className="medecin-avatar">👨‍⚕️</div>
                                    <div className="medecin-info">
                                        <h3>Dr. {m.prenom} {m.nom}</h3>
                                        <p>{m.specialite || 'Médecin Généraliste'}</p>
                                    </div>
                                </div>
                                <div className="medecin-slot">📅 Disponible aujourd'hui</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="rdv-section">
                <h2>Choisir une date</h2>
                <div className="dates-scroll">
                    {dates.map((d) => (
                        <button
                            key={d.iso}
                            className={`date-chip ${dateSelectionnee === d.iso ? 'selected' : ''}`}
                            onClick={() => setDateSelectionnee(d.iso)}
                        >
                            <div className="jour-nom">{d.label}</div>
                            <div className="jour-num">{d.jour}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="rdv-section">
                <h2>Horaires disponibles</h2>
                <div className="horaires-grid">
                    {HORAIRES.map((h) => (
                        <button
                            key={h}
                            className={`horaire-chip ${horaireSelectionne === h ? 'selected' : ''}`}
                            onClick={() => setHoraireSelectionne(h)}
                        >
                            {h}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rdv-section">
                <h2>Motif de consultation</h2>
                <textarea
                    className="motif-textarea"
                    placeholder="Décrivez brièvement vos symptômes..."
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                />
            </div>

            {succes && (
                <p style={{ color: '#16A34A', textAlign: 'center', fontWeight: '600', margin: '10px 20px' }}>
                    {succes}
                </p>
            )}

            <button className="btn-confirmer" onClick={handleConfirmer} disabled={chargement || !medecinSelectionne}>
                ✓ {chargement ? 'Confirmation...' : 'Confirmer le rendez-vous'}
            </button>

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Accueil</span>
                </button>
                <button className="nav-item active" onClick={() => navigate('/mes-rendez-vous')}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-label">Mes RDV</span>
                </button>
                <button className="nav-item" onClick={() => navigate('/messages')}>
                    <span className="nav-icon">💬</span>
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

export default PrendreRdv;