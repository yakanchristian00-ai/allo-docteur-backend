import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Paiements.css';

const METHODES = [
    { valeur: 'orange_money', label: 'Orange Money', icone: '🟠' },
    { valeur: 'mtn_momo', label: 'MTN MoMo', icone: '🟡' },
    { valeur: 'moov_money', label: 'Moov Money', icone: '🔵' },
    { valeur: 'wave', label: 'Wave', icone: '🌊' },
    { valeur: 'carte_bancaire', label: 'Carte', icone: '💳' },
    { valeur: 'especes', label: 'Espèces', icone: '💵' },
];

function Paiements() {
    const navigate = useNavigate();
    const [historique, setHistorique] = useState([]);
    const [rendezVous, setRendezVous] = useState([]);
    const [rdvSelectionne, setRdvSelectionne] = useState('');
    const [methode, setMethode] = useState('mtn_momo');
    const [montant, setMontant] = useState('');
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState('');
    const [succes, setSucces] = useState('');

    const chargerHistorique = () => {
        api.get('/paiements/patient/historique')
            .then((res) => setHistorique(res.data))
            .catch(() => setHistorique([]));
    };

    useEffect(() => {
        chargerHistorique();
        api.get('/rendez-vous/mes-rendez-vous')
            .then((res) => setRendezVous(res.data))
            .catch(() => setRendezVous([]));
    }, []);

    const handlePayer = async () => {
        if (!rdvSelectionne || !montant) {
            setErreur('Merci de sélectionner un rendez-vous et un montant.');
            return;
        }
        setErreur('');
        setSucces('');
        setChargement(true);

        try {
            await api.post('/paiements', {
                rendez_vous_id: Number(rdvSelectionne),
                montant: Number(montant),
                methode,
            });
            setSucces('Paiement initié avec succès !');
            setMontant('');
            setRdvSelectionne('');
            chargerHistorique();
        } catch (err) {
            setErreur(err.response?.data?.message || "Erreur lors de l'initiation du paiement");
        } finally {
            setChargement(false);
        }
    };

    return (
        <div className="paiements-page">
            <div className="paiements-header">
                <button className="paiements-back" onClick={() => navigate('/dashboard-patient')}>←</button>
                <h1>Paiements</h1>
            </div>

            <div className="paiements-section">
                <h2>Nouveau paiement</h2>
                <div className="nouveau-paiement-card">
                    <p className="champ-label">Rendez-vous concerné</p>
                    <select
                        className="champ-select"
                        value={rdvSelectionne}
                        onChange={(e) => setRdvSelectionne(e.target.value)}
                    >
                        <option value="">Sélectionner un rendez-vous</option>
                        {rendezVous.map((r) => (
                            <option key={r.id} value={r.id}>
                                Dr. {r.medecin_prenom} {r.medecin_nom} — {new Date(r.date_rdv).toLocaleDateString('fr-FR')}
                            </option>
                        ))}
                    </select>

                    <p className="champ-label">Montant (FCFA)</p>
                    <input
                        type="number"
                        className="champ-input"
                        placeholder="Ex: 15000"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                    />

                    <p className="champ-label">Méthode de paiement</p>
                    <div className="methodes-grid">
                        {METHODES.map((m) => (
                            <div
                                key={m.valeur}
                                className={`methode-chip ${methode === m.valeur ? 'selected' : ''}`}
                                onClick={() => setMethode(m.valeur)}
                            >
                                <span className="methode-icone">{m.icone}</span>
                                {m.label}
                            </div>
                        ))}
                    </div>

                    {erreur && <p style={{ color: 'red', fontSize: '13px', marginBottom: '10px' }}>{erreur}</p>}
                    {succes && <p style={{ color: 'green', fontSize: '13px', marginBottom: '10px' }}>{succes}</p>}

                    <button className="btn-payer" onClick={handlePayer} disabled={chargement}>
                        {chargement ? 'Traitement...' : 'Payer maintenant'}
                    </button>
                </div>
            </div>

            <div className="paiements-section">
                <h2>Historique</h2>
                {historique.length === 0 && (
                    <p className="paiements-empty">Aucun paiement pour le moment.</p>
                )}
                {historique.map((p) => {
                    const methodeInfo = METHODES.find((m) => m.valeur === p.methode);
                    return (
                        <div key={p.id} className="paiement-item">
                            <div className="paiement-gauche">
                                <div className="paiement-icone">{methodeInfo?.icone || '💳'}</div>
                                <div className="paiement-infos">
                                    <h3>{methodeInfo?.label || p.methode}</h3>
                                    <p>{new Date(p.date_paiement).toLocaleDateString('fr-FR')}</p>
                                </div>
                            </div>
                            <div className="paiement-droite">
                                <div className="paiement-montant">{Number(p.montant).toLocaleString('fr-FR')} FCFA</div>
                                <span className={`paiement-statut ${p.statut}`}>{p.statut.replace('_', ' ')}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bottom-nav">
                <button className="nav-item" onClick={() => navigate('/dashboard-patient')}>🏠<span>Accueil</span></button>
                <button className="nav-item" onClick={() => navigate('/rendez-vous')}>📅<span>RDV</span></button>
                <button className="nav-item" onClick={() => navigate('/messages')}>💬<span>Messages</span></button>
                <button className="nav-item active">💳<span>Paiements</span></button>
            </div>
        </div>
    );
}

export default Paiements;