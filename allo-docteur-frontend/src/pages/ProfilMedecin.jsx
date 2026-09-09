import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './ProfilMedecin.css';

function ProfilMedecin() {
  const navigate = useNavigate();
  const [profil, setProfil] = useState(null);
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const inputPhotoRef = useRef(null);
  const [uploadEnCours, setUploadEnCours] = useState(false);

  // Champs modifiables directement
  const [telephone, setTelephone] = useState('');
  const [bio, setBio] = useState('');
  const [messageSucces, setMessageSucces] = useState('');

  // Modale de demande
  const [modalDemande, setModalDemande] = useState(null); // { champ, label, valeurActuelle }
  const [valeurDemandee, setValeurDemandee] = useState('');
  const [erreurDemande, setErreurDemande] = useState('');

  const charger = () => {
    setChargement(true);
    api.get('/profil-medecin/moi').then((res) => {
      setProfil(res.data);
      setTelephone(res.data.telephone || '');
      setBio(res.data.bio || '');
    }).catch(() => {}).finally(() => setChargement(false));

    api.get('/profil-medecin/mes-demandes').then((res) => setDemandes(res.data)).catch(() => setDemandes([]));
  };

  useEffect(() => {
    charger();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const enregistrerDirect = async () => {
    try {
      await api.put('/profil-medecin/moi', { telephone, photo_url: profil.photo_url, bio });
      setMessageSucces('Profil mis à jour !');
      setTimeout(() => setMessageSucces(''), 3000);
      charger();
    } catch (err) {
      console.error(err);
    }
  };
  const handlePhoto = async (e) => {
    const fichier = e.target.files[0];
    if (!fichier) return;

    setUploadEnCours(true);
    try {
      const formData = new FormData();
      formData.append('photo', fichier);

      const res = await api.post('/profil-medecin/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // Met à jour le localStorage pour que les autres pages voient la nouvelle photo
    const userStorage = JSON.parse(localStorage.getItem('user'));
    userStorage.photo_url = res.data.photo_url;
    localStorage.setItem('user', JSON.stringify(userStorage));

    charger();
   } catch (err) {
    console.error(err);
   } finally {
    setUploadEnCours(false);
    e.target.value = '';
   }
  };

  const ouvrirDemande = (champ, label, valeurActuelle) => {
    setModalDemande({ champ, label, valeurActuelle });
    setValeurDemandee(valeurActuelle || '');
    setErreurDemande('');
  };

  const envoyerDemande = async () => {
    if (!valeurDemandee.trim()) {
      setErreurDemande('Merci de préciser la valeur souhaitée.');
      return;
    }
    try {
      await api.post('/profil-medecin/demande', {
        champ: modalDemande.champ,
        valeur_actuelle: modalDemande.valeurActuelle,
        valeur_demandee: valeurDemandee,
      });
      setModalDemande(null);
      charger();
    } catch (err) {
      setErreurDemande(err.response?.data?.message || 'Erreur lors de l\'envoi');
    }
  };

  if (chargement || !profil) return null;

  const demandeStyle = {
    approuvee: { background: '#DCFCE7', color: '#15803D' },
    refusee: { background: '#FEE2E2', color: '#B91C1C' },
  };
  const statutLabels = { en_attente: 'En attente', approuvee: 'Approuvée', refusee: 'Refusée' };


  return (
    <div className="profilmed-page">
      <div className="profilmed-topbar">
        <div className="profilmed-topbar-left">
          <div className="profilmed-topbar-avatar">👨‍⚕️</div>
          <h1>Allo Docteur</h1>
        </div>
        <button type="button">🔔</button>
      </div>

      <div className="profilmed-avatar-wrapper">
        {profil.photo_url ? (
         <img
          src={`http://localhost:5000/api/fichiers${profil.photo_url.replace('/uploads', '')}?token=${localStorage.getItem('token')}`}
          alt="Profil du médecin"
          className="profilmed-avatar-grande"
          style={{ objectFit: 'cover' }}
         />
        ) : (
          <div className="profilmed-avatar-grande">👨‍⚕️</div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputPhotoRef}
          style={{ display: 'none' }}
          onChange={handlePhoto}
        />
        <button
          type="button"
          className="profilmed-avatar-edit"
          onClick={() => inputPhotoRef.current.click()}
          disabled={uploadEnCours}
          style={{ border: 'none', cursor: 'pointer' }}
        >
          {uploadEnCours ? '…' : '✎'}
        </button>
      </div>

      <h2>Dr. {profil.prenom} {profil.nom}</h2>
        <p>{profil.specialite}</p>
        <div className="badge-disponible" style={{ background: profil.statut === 'actif' ? '#EFF4FF' : '#FEE2E2', color: profil.statut === 'actif' ? '#2563EB' : '#B91C1C' }}>
          <span className="dot" style={{ background: profil.statut === 'actif' ? '#2563EB' : '#B91C1C' }}></span>
          {profil.statut === 'actif' ? 'Disponible' : 'Compte suspendu'}
        </div>

      {messageSucces && (
        <p style={{ textAlign: 'center', color: '#15803D', fontSize: '13px', margin: '0 20px 12px 20px' }}>{messageSucces}</p>
      )}

      <div className="profilmed-section">
        <h2 className="profilmed-section-titre">👤 Informations personnelles</h2>

        <div className="profilmed-info-row">
          <div className="profilmed-info-row-texte">
            <span>Nom complet  </span>
            <span>{profil.prenom} {profil.nom}</span>
          </div>
          <button type="button" className="profilmed-edit-btn" onClick={() => ouvrirDemande('nom_complet', 'Nom complet', `${profil.prenom} ${profil.nom}`)}>
            Demander
          </button>
        </div>

        <div className="profilmed-info-row">
          <div className="profilmed-info-row-texte">
            <span>Email  </span>
            <span>{profil.email}</span>
          </div>
        </div>

        <div className="profilmed-info-row">
          <div className="profilmed-info-row-texte" style={{ flex: 1 }}>
            <label htmlFor="profilmed-telephone">Téléphone (modifiable directement)</label>
            <input
              id="profilmed-telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '8px 10px', fontSize: '14px', marginTop: '4px' }}
            />
          </div>
        </div>

        <div className="profilmed-info-row">
          <div className="profilmed-info-row-texte">
            <span>Licence professionnelle  </span>
            <span>{profil.licence || 'Non renseignée'} (modifiable par l'admin uniquement)</span>
          </div>
        </div>
      </div>

      <div className="profilmed-section">
        <h2 className="profilmed-section-titre">✚ Ma pratique</h2>

        <div className="profilmed-info-row">
          <div className="profilmed-info-row-texte">
            <span>Spécialité  </span>
            <span>{profil.specialite}</span>
          </div>
          <button type="button" className="profilmed-edit-btn" onClick={() => ouvrirDemande('specialite', 'Spécialité', profil.specialite)}>
            Demander
          </button>
        </div>

        <div className="profilmed-info-row">
          <div className="profilmed-info-row-texte">
            <span>Lieu d'exercice  </span>
            <span>{profil.hopital || 'Non renseigné'}</span>
          </div>
          <button type="button" className="profilmed-edit-btn" onClick={() => ouvrirDemande('hopital', "Lieu d'exercice", profil.hopital || '')}>
            Demander
          </button>
        </div>

        <div className="profilmed-info-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <label htmlFor="profilmed-bio" style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Bio / présentation (modifiable directement)</label>
          <textarea
            id="profilmed-bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: '100%', border: '1px solid #E5E9F0', borderRadius: '8px', padding: '10px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={enregistrerDirect}
        style={{ width: 'calc(100% - 40px)', margin: '0 20px 20px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}
      >
        Enregistrer les modifications
      </button>

      {demandes.length > 0 && (
        <div className="profilmed-section">
          <h2 className="profilmed-section-titre">📨 Mes demandes de modification</h2>
          {demandes.map((d) => (
            <div key={d.id} className="profilmed-info-row">
              <div className="profilmed-info-row-texte">
                <span>{d.champ}</span>
                <span>{d.valeur_demandee}</span>
              </div>
              <span style={{
                fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                ...(demandeStyle[d.statut] || { background: '#FEF3C7', color: '#B45309' }),
              }}>
                {statutLabels[d.statut] || 'Refusée'}
              </span>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="action-card-med" onClick={() => navigate('/disponibilites')} style={{ cursor: 'pointer' }}>
        <div className="action-icone-med">🕐</div>
        <div className="action-texte-med">
          <h3>Disponibilités</h3>
          <p>Gérer vos horaires de consultation</p>
        </div>
        <span>›</span>
      </button>

      <button type="button" className="btn-deconnexion-med" onClick={handleLogout}>
        ⇥ Déconnexion
      </button>

      {modalDemande && (
        <dialog className="modal-overlay-tarif" open aria-labelledby="modal-demande-titre" onCancel={() => setModalDemande(null)} onClick={(e) => e.target === e.currentTarget && setModalDemande(null)}>
          <div className="modal-tarif">
            <h3 id="modal-demande-titre">Demander une modification : {modalDemande.label}</h3>
            <label htmlFor="modal-valeur-actuelle">Valeur actuelle</label>
            <input id="modal-valeur-actuelle" value={modalDemande.valeurActuelle} disabled style={{ background: '#F1F3F6' }} />
            <label htmlFor="modal-valeur-demandee">Nouvelle valeur souhaitée</label>
            <input id="modal-valeur-demandee" value={valeurDemandee} onChange={(e) => setValeurDemandee(e.target.value)} />
            {erreurDemande && <p style={{ color: 'red', fontSize: '13px', marginTop: '8px' }}>{erreurDemande}</p>}
            <div className="modal-tarif-actions">
              <button type="button" className="btn-annuler-modal" onClick={() => setModalDemande(null)}>Annuler</button>
              <button type="button" className="btn-enregistrer-modal" onClick={envoyerDemande}>Envoyer la demande</button>
            </div>
          </div>
        </dialog>
      )}

      <div className="bottom-nav">
        <button type="button" className="nav-item" onClick={() => navigate('/dashboard-medecin')}>📊<span>Tableau</span></button>
        <button type="button" className="nav-item" onClick={() => navigate('/rendez-vous-medecin')}>📅<span>Agenda</span></button>
        <button type="button" className="nav-item" onClick={() => navigate('/patients-medecin')}>👥<span>Patients</span></button>
        <button type="button" className="nav-item active">👤<span>Profil</span></button>
      </div>
    </div>
  );
}

export default ProfilMedecin;
