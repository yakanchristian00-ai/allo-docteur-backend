import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useParametresPublic from '../hooks/useParametresPublic';
import './PatientsMedecin.css';

function initiales(nom, prenom) {
  return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

const FILTRES = ['Tous', "Aujourd'hui", 'Urgence', 'En attente'];

function PatientsMedecin() {
  const navigate = useNavigate();
  const { parametresPublic } = useParametresPublic();
  const [rendezVous, setRendezVous] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('Tous');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    api.get('/rendez-vous/medecin/mes-rendez-vous')
      .then((res) => setRendezVous(res.data))
      .catch(() => setRendezVous([]))
      .finally(() => setChargement(false));
  }, []);

  const patients = Object.values(
    rendezVous.reduce((acc, r) => {
      const existant = acc[r.patient_id];
      if (!existant || new Date(r.date_rdv) > new Date(existant.date_rdv)) {
        acc[r.patient_id] = r;
      }
      return acc;
    }, {})
  );

  const aujourdHui = new Date().toISOString().split('T')[0];

  const patientsFiltres = patients.filter((p) => {
    const nomComplet = `${p.patient_prenom} ${p.patient_nom}`.toLowerCase();
    const matchRecherche = !recherche || nomComplet.includes(recherche.toLowerCase());

    let matchFiltre = true;
    if (filtre === "Aujourd'hui") matchFiltre = p.date_rdv.split('T')[0] === aujourdHui;
    else if (filtre === 'En attente') matchFiltre = p.statut === 'en_attente';
    else if (filtre === 'Urgence') matchFiltre = false;

    return matchRecherche && matchFiltre;
  });

  const badgeStatut = (statut) => {
    if (statut === 'en_attente') return { classe: 'attente', label: 'En attente' };
    if (statut === 'termine') return { classe: 'suivi', label: 'Suivi' };
    return { classe: 'suivi', label: 'Confirmé' };
  };

  return (
    <div className="patmed-page">
      <div className="patmed-topbar">
        <div className="patmed-topbar-left">
          <div className="patmed-logo">✚</div>
          <h1>Allo Docteur</h1>
        </div>
        <div className="patmed-topbar-right">
          <button>🔍</button>
          <button>🔔</button>
        </div>
      </div>

      <div className="patmed-titre-section">
        <h2>Patients</h2>
        <p>Retrouvez et gérez vos patients rapidement.</p>
      </div>

      <div className="patmed-search">
        🔍
        <input
          placeholder="Rechercher un patient..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
      </div>

      <div className="patmed-filtres">
        {FILTRES.map((f) => (
          <button
            key={f}
            className={`patmed-filtre-chip ${filtre === f ? 'active' : ''}`}
            onClick={() => setFiltre(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {chargement && <p className="patmed-empty">Chargement...</p>}
      {!chargement && patientsFiltres.length === 0 && (
        <p className="patmed-empty">Aucun patient trouvé.</p>
      )}

      {patientsFiltres.map((p) => {
        const badge = badgeStatut(p.statut);
        return (
          <div key={p.patient_id} className="patient-card">
            <div className="patient-card-top">
              <div className="patient-avatar">{initiales(p.patient_nom, p.patient_prenom)}</div>
              <div className="patient-nom-bloc">
                <h3>{p.patient_prenom} {p.patient_nom}</h3>
              </div>
              <span className={`patient-statut-badge ${badge.classe}`}>{badge.label}</span>
            </div>

            <div className="patient-info-row">
              📅 Dernière : {new Date(p.date_rdv).toLocaleDateString('fr-FR')}
            </div>
            <div className="patient-info-row">
              🩺 {p.motif || 'Consultation'}
            </div>

            <div className="patient-contacts">
              <button onClick={() => navigate(`/messages/${p.patient_id}`)}>💬</button>
            </div>

            <div className="patient-card-actions">
              <button
                className="btn-voir-dossier"
                onClick={() => navigate(`/messages/${p.patient_id}`)}
                disabled={parametresPublic.maintenance}
                style={parametresPublic.maintenance ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {parametresPublic.maintenance ? 'Indisponible (maintenance)' : 'Voir dossier'}
              </button>
              <button className="btn-prendre-rdv-patient" onClick={() => navigate('/rendez-vous-medecin')}>
                Voir RDV
              </button>
            </div>
          </div>
        );
      })}

      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard-medecin')}>📊<span>Tableau</span></button>
        <button className="nav-item" onClick={() => navigate('/rendez-vous-medecin')}>📅<span>Calendrier</span></button>
        <button className="nav-item active">👥<span>Patients</span></button>
        <button className="nav-item" onClick={() => navigate('/profil-medecin')}>👤<span>Profil</span></button>
      </div>
    </div>
  );
}

export default PatientsMedecin;