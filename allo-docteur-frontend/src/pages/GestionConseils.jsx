import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './GestionConseils.css';

const CATEGORIES = [
  { valeur: 'general', label: 'Général' },
  { valeur: 'perte_de_poids', label: 'Perte de poids' },
  { valeur: 'diabete', label: 'Diabète' },
];

const VIDE = { titre: '', contenu: '', categorie: 'general', patient_id: '' };

function GestionConseils() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [conseils, setConseils] = useState([]);
  const [patients, setPatients] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modal, setModal] = useState(null); // { mode: 'creer' | 'editer', data }
  const [erreur, setErreur] = useState('');

  const charger = () => {
    setChargement(true);
    api.get('/conseils').then((res) => setConseils(res.data)).catch(() => setConseils([])).finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();

    if (user.role === 'medecin') {
      // Patients dérivés des rendez-vous du médecin
      api.get('/rendez-vous/medecin/mes-rendez-vous').then((res) => {
        const uniques = Object.values(
          res.data.reduce((acc, r) => {
            acc[r.patient_id] = { id: r.patient_id, nom: r.patient_nom, prenom: r.patient_prenom };
            return acc;
          }, {})
        );
        setPatients(uniques);
      }).catch(() => setPatients([]));
    } else if (user.role === 'admin') {
      api.get('/users').then((res) => {
        setPatients(res.data.filter((u) => u.role === 'patient'));
      }).catch(() => setPatients([]));
    }
  }, []);

  const ouvrirCreation = () => setModal({ mode: 'creer', data: { ...VIDE } });
  const ouvrirEdition = (c) => setModal({
    mode: 'editer',
    data: { id: c.id, titre: c.titre, contenu: c.contenu, categorie: c.categorie, patient_id: c.patient_id || '' }
  });

  const enregistrer = async () => {
    setErreur('');
    const { titre, contenu, categorie, patient_id } = modal.data;
    if (!titre || !contenu) {
      setErreur('Le titre et le contenu sont obligatoires.');
      return;
    }

    try {
      const payload = { titre, contenu, categorie, patient_id: patient_id || null };
      if (modal.mode === 'creer') {
        await api.post('/conseils', payload);
      } else {
        await api.put(`/conseils/${modal.data.id}`, payload);
      }
      setModal(null);
      charger();
    } catch (err) {
      setErreur(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const supprimer = async (id) => {
    try {
      await api.delete(`/conseils/${id}`);
      charger();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="gestion-conseils-page">
      <div className="gc-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <button
            onClick={() => navigate(user.role === 'admin' ? '/dashboard-admin' : '/dashboard-medecin')}
            style={{
              background: '#F1F1F1',
              border: 'none',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              fontSize: '18px',
              color: '#1A1F36',
              cursor: 'pointer',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ←
          </button>
       
         <div>
           <h1>Gestion des Conseils</h1>
           <p>Publiez des conseils généraux ou personnalisez-en pour un patient précis.</p>
         </div>
        </div>
        <button className="btn-nouveau-conseil" onClick={ouvrirCreation}>+ Nouveau conseil</button>
      </div>

      {chargement && <p className="gc-empty">Chargement...</p>}
      {!chargement && conseils.length === 0 && <p className="gc-empty">Aucun conseil pour le moment.</p>}

      {conseils.map((c) => (
        <div key={c.id} className="gc-card">
          <div className="gc-card-content">
            <div className="gc-card-top">
              <h3>{c.titre}</h3>
              <div className="gc-tags">
                {c.patient_id ? (
                  <span className="gc-tag personnalise">Pour {c.patient_prenom} {c.patient_nom}</span>
                ) : (
                  <span className="gc-tag generique">{CATEGORIES.find((cat) => cat.valeur === c.categorie)?.label || c.categorie}</span>
                )}
              </div>
            </div>
            <p className="gc-preview">{c.contenu}</p>
            <p className="gc-meta">Par {c.auteur_prenom} {c.auteur_nom} · {new Date(c.date_creation).toLocaleDateString('fr-FR')}</p>
            <div className="gc-actions">
              <button onClick={() => ouvrirEdition(c)}>Modifier</button>
              <button className="danger" onClick={() => supprimer(c.id)}>Supprimer</button>
            </div>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-overlay-gc" onClick={() => setModal(null)}>
          <div className="modal-gc" onClick={(e) => e.stopPropagation()}>
            <h3>{modal.mode === 'creer' ? 'Nouveau conseil' : 'Modifier le conseil'}</h3>

            <label>Titre</label>
            <input
              value={modal.data.titre}
              onChange={(e) => setModal({ ...modal, data: { ...modal.data, titre: e.target.value } })}
            />

            <label>Contenu</label>
            <textarea
              rows={4}
              value={modal.data.contenu}
              onChange={(e) => setModal({ ...modal, data: { ...modal.data, contenu: e.target.value } })}
            />

            <label>Catégorie (si conseil général)</label>
            <select
              value={modal.data.categorie}
              onChange={(e) => setModal({ ...modal, data: { ...modal.data, categorie: e.target.value } })}
            >
              {CATEGORIES.map((c) => <option key={c.valeur} value={c.valeur}>{c.label}</option>)}
            </select>

            <label>Personnaliser pour un patient (optionnel)</label>
            <select
              value={modal.data.patient_id}
              onChange={(e) => setModal({ ...modal, data: { ...modal.data, patient_id: e.target.value } })}
            >
              <option value="">— Conseil général, visible par tous —</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>
              ))}
            </select>

            {erreur && <p style={{ color: 'red', fontSize: '13px', marginTop: '10px' }}>{erreur}</p>}

            <div className="modal-gc-actions">
              <button className="btn-annuler-gc" onClick={() => setModal(null)}>Annuler</button>
              <button className="btn-enregistrer-gc" onClick={enregistrer}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionConseils;