import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './PrendreRdv.css';

const JOURS_SEMAINE = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

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
    const [horaireSelectionne, setHoraireSelectionne] = useState('');
    const [motif, setMotif] = useState('');
    const [chargement, setChargement] = useState(false);
    const [chargementMedecins, setChargementMedecins] = useState(true);
    const [erreur, setErreur] = useState('');
    const [succes, setSucces] = useState('');
    const [disponibilites, setDisponibilites] = useState([]);

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

    // Charge les disponibilités du médecin sélectionné
    useEffect(() => {
        if (medecinSelectionne) {
            api.get(`/disponibilites/medecin/${medecinSelectionne}`)
                .then((res) => setDisponibilites(res.data))
                .catch(() => setDisponibilites([]));
        }
    }, [medecinSelectionne]);

    // Calcule les créneaux réels disponibles pour le jour choisi
    function genererCreneauxDisponibles() {
        const dateObj = new Date(dateSelectionnee);
        const nomJour = JOURS_SEMAINE[dateObj.getDay()];

        const dispoDuJour = disponibilites.filter((d) => d.jour_semaine === nomJour);
        if (dispoDuJour.length === 0) return [];

        const creneaux = [];
        dispoDuJour.forEach((d) => {
            let [heure, minute] = d.heure_debut.slice(0, 5).split(':').map(Number);
            const [heureFin, minuteFin] = d.heure_fin.slice(0, 5).split(':').map(Number);

            while (heure < heureFin || (heure === heureFin && minute < minuteFin)) {
                creneaux.push(`${String(heure).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
                minute += 30;
                if (minute >= 60) { minute = 0; heure += 1; }
            }
        });

        return creneaux;
    }

    const creneauxDisponibles = genererCreneauxDisponibles();

    let contenuMedecins;
    if (chargementMedecins) {
        contenuMedecins = <p style={{ color: '#6B7280', fontSize: '14px' }}>Chargement des praticiens...</p>;
    } else if (medecins.length === 0) {
        contenuMedecins = <p style={{ color: '#6B7280', fontSize: '14px' }}>Aucun médecin disponible pour le moment.</p>;
    } else {
        contenuMedecins = (
            <div className="medecins-scroll">
                {medecins.map((m) => (
                    <button
                        type="button"
                        key={m.id}
                        className={`medecin-card ${medecinSelectionne === m.id ? 'selected' : ''}`}
                        onClick={() => { setMedecinSelectionne(m.id); setHoraireSelectionne(''); }}
                    >
                        <div className="medecin-top">
                            <div className="medecin-avatar">👨‍⚕️</div>
                            <div className="medecin-info">
                                <h3>Dr. {m.prenom} {m.nom}</h3>
                                <p>{m.specialite || 'Médecin Généraliste'}</p>
                            </div>
                        </div>
                        <div className="medecin-slot">📅 Disponible aujourd'hui</div>
                    </button>
                ))}
            </div>
        );
    }

    const handleConfirmer = async () => {
        if (!medecinSelectionne) {
            setErreur('Veuillez sélectionner un médecin.');
            return;
        }
        if (!horaireSelectionne) {
            setErreur('Veuillez sélectionner un horaire.');
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
                <button type="button" className="rdv-avatar" title="Retour au Dashboard" onClick={() => navigate('/dashboard-patient')}>🏠</button>
            </div>

            <div className="rdv-section">
                <h2>Quelle spécialité recherchez-vous ?</h2>
                <div className="rdv-search">
                    <span aria-hidden="true">🔍</span>
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

                {contenuMedecins}
            </div>

            <div className="rdv-section">
                <h2>Choisir une date</h2>
                <div className="dates-scroll">
                    {dates.map((d) => (
                        <button
                            type="button"
                            key={d.iso}
                            className={`date-chip ${dateSelectionnee === d.iso ? 'selected' : ''}`}
                            onClick={() => { setDateSelectionnee(d.iso); setHoraireSelectionne(''); }}
                        >
                            <div className="jour-nom">{d.label}</div>
                            <div className="jour-num">{d.jour}</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="rdv-section">
                <h2>Horaires disponibles</h2>
                {creneauxDisponibles.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Aucune disponibilité ce jour-là pour ce médecin.</p>
                ) : (
                    <div className="horaires-grid">
                        {creneauxDisponibles.map((h) => (
                            <button
                                type="button"
                                key={h}
                                className={`horaire-chip ${horaireSelectionne === h ? 'selected' : ''}`}
                                onClick={() => setHoraireSelectionne(h)}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                )}
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

            <button type="button" className="btn-confirmer" onClick={handleConfirmer} disabled={chargement || !medecinSelectionne || !horaireSelectionne}>
                ✓ {chargement ? 'Confirmation...' : 'Confirmer le rendez-vous'}
            </button>

            <div className="bottom-nav">
                <button type="button" className="nav-item" onClick={() => navigate('/dashboard-patient')}>
                    <span className="nav-icon">🏠</span>
                    <span className="nav-label">Accueil</span>
                </button>
                <button type="button" className="nav-item active" onClick={() => navigate('/mes-rendez-vous')}>
                    <span className="nav-icon">📅</span>
                    <span className="nav-label">Mes RDV</span>
                </button>
                <button type="button" className="nav-item" onClick={() => navigate('/messages')}>
                    <span className="nav-icon">💬</span>
                    <span className="nav-label">Messages</span>
                </button>
                <button type="button" className="nav-item" onClick={() => navigate('/urgence')}>
                    <span className="nav-icon">🆘</span>
                    <span className="nav-label">Urgence</span>
                </button>
            </div>
        </div>
    );
}

export default PrendreRdv;