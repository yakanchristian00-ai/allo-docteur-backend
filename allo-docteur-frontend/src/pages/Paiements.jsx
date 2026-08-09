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
    const [tarifs, setTarifs] = useState([]);
    const [rdvSelectionne, setRdvSelectionne] = useState('');
    const [serviceSelectionne, setServiceSelectionne] = useState('');
    const [methode, setMethode] = useState('mtn_momo');
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
        api.get('/tarifs')
            .then((res) => setTarifs(res.data))
            .catch(() => setTarifs([]));
    }, []);

    const tarifChoisi = tarifs.find((t) => String(t.id) === String(serviceSelectionne));
    const montantAPayer = tarifChoisi ? Number(tarifChoisi.prix) : 0;

    const handlePayer = async () => {
        if (!rdvSelectionne || !serviceSelectionne) {
            setErreur('Merci de sélectionner un rendez-vous et un service.');
            return;
        }
        setErreur('');
        setSucces('');
        setChargement(true);

        try {
            await api.post('/paiements', {
                rendez_vous_id: Number(rdvSelectionne),
                montant: montantAPayer,
                methode,
            });
            setSucces('Paiement initié avec succès !');
            setRdvSelectionne('');
            setServiceSelectionne('');
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

                    <p className="champ-label">Service / Type de consultation</p>
                    <select
                        className="champ-select"
                        value={serviceSelectionne}
                        onChange={(e) => setServiceSelectionne(e.target.value)}
                    >
                        <option value="">Sélectionner un service</option>
                        {tarifs.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.icone} {t.service} — {Number(t.prix).toLocaleString('fr-FR')} FCFA
                            </option>
                        ))}
                    </select>

                    {tarifChoisi && (
                        <p style={{ fontSize: '14px', color: '#2563EB', fontWeight: 700, marginBottom: '16px' }}>
                            Montant à payer : {montantAPayer.toLocaleString('fr-FR')} FCFA
                        </p>
                    )}

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
                        {chargement ? 'Traitement...' : `Payer ${montantAPayer ? montantAPayer.toLocaleString('fr-FR') + ' FCFA' : ''}`}
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