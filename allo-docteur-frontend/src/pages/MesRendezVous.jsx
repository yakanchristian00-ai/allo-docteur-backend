import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Clock3, CheckCircle2, XCircle, Hourglass,
  Search, X, FileText, RotateCcw
} from 'lucide-react';
import api from '../api/axios';
import './MesRendezVous.css';

const STATUT_LABELS = {
  en_attente: 'En attente',
  confirme: 'Confirmé',
  termine: 'Terminé',
  annule: 'Annulé',
};

const STATUT_BADGE_CLASS = {
  en_attente: 'badge-attente',
  confirme: 'badge-confirme',
  termine: 'badge-termine',
  annule: 'badge-annule',
};

function initiales(nom, prenom) {
  return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function MesRendezVous() {
  const navigate = useNavigate();
  const [rendezVousList, setRendezVousList] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [statutFiltre, setStatutFiltre] = useState('Tous');
  const [recherche, setRecherche] = useState('');
  const [modalRdv, setModalRdv] = useState(null);
  const [typeModal, setTypeModal] = useState(null);

  const charger = () => {
    setChargement(true);
    api.get('/rendez-vous/mes-rendez-vous')
      .then((res) => setRendezVousList(res.data))
      .catch(() => setRendezVousList([]))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    charger();
  }, []);

  const aujourdHui = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const aujourdhuiCount = rendezVousList.filter((r) => r.date_rdv.split('T')[0] === aujourdHui).length;
    const aVenirCount = rendezVousList.filter((r) => r.statut === 'confirme' || r.statut === 'en_attente').length;
    const terminesCount = rendezVousList.filter((r) => r.statut === 'termine').length;
    const annulesCount = rendezVousList.filter((r) => r.statut === 'annule').length;
    return { aujourdhuiCount, aVenirCount, terminesCount, annulesCount };
  }, [rendezVousList, aujourdHui]);

  const rendezVousFiltres = useMemo(() => {
    return rendezVousList.filter((rdv) => {
      let correspondStatut = true;
      if (statutFiltre === 'Confirmés') correspondStatut = rdv.statut === 'confirme';
      else if (statutFiltre === 'En attente') correspondStatut = rdv.statut === 'en_attente';
      else if (statutFiltre === 'Terminés') correspondStatut = rdv.statut === 'termine';
      else if (statutFiltre === 'Annulés') correspondStatut = rdv.statut === 'annule';

      const rechercheLower = recherche.toLowerCase().trim();
      const nomComplet = `${rdv.medecin_prenom || ''} ${rdv.medecin_nom || ''}`.toLowerCase();
      const correspondRecherche = !rechercheLower ||
        nomComplet.includes(rechercheLower) ||
        (rdv.specialite || '').toLowerCase().includes(rechercheLower) ||
        (rdv.motif || '').toLowerCase().includes(rechercheLower);

      return correspondStatut && correspondRecherche;
    });
  }, [rendezVousList, statutFiltre, recherche]);

  const confirmerAnnulation = async (id) => {
    try {
      await api.patch(`/rendez-vous/${id}/annuler`);
      setModalRdv(null);
      setTypeModal(null);
      charger();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mes-rdv-container">
      <header className="mes-rdv-header">
        <div className="header-top">
          <button className="btn-back" onClick={() => navigate('/dashboard-patient')} title="Retour au tableau de bord">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="main-title">Mes rendez-vous</h1>
            <p className="sub-title">Consultez et gérez tous vos rendez-vous médicaux.</p>
          </div>
        </div>
      </header>

      <main className="mes-rdv-main">
        <section className="stats-bar" aria-label="Statistiques des rendez-vous">
          <div className="stat-card stat-aujourdhui" onClick={() => setStatutFiltre('Tous')}>
            <div className="stat-icon-wrapper"><Calendar size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.aujourdhuiCount}</span>
              <span className="stat-label">Aujourd'hui</span>
            </div>
          </div>

          <div className="stat-card stat-avenir" onClick={() => setStatutFiltre('Confirmés')}>
            <div className="stat-icon-wrapper"><Hourglass size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.aVenirCount}</span>
              <span className="stat-label">À venir</span>
            </div>
          </div>

          <div className="stat-card stat-termines" onClick={() => setStatutFiltre('Terminés')}>
            <div className="stat-icon-wrapper"><CheckCircle2 size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.terminesCount}</span>
              <span className="stat-label">Terminés</span>
            </div>
          </div>

          <div className="stat-card stat-annules" onClick={() => setStatutFiltre('Annulés')}>
            <div className="stat-icon-wrapper"><XCircle size={20} /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.annulesCount}</span>
              <span className="stat-label">Annulés</span>
            </div>
          </div>
        </section>

        <section className="search-filter-bar">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un médecin, une spécialité ou un motif..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
            {recherche && (
              <button className="search-clear" onClick={() => setRecherche('')}><X size={14} /></button>
            )}
          </div>

          <div className="filter-chips">
            {['Tous', 'Confirmés', 'En attente', 'Terminés', 'Annulés'].map((filtre) => (
              <button
                key={filtre}
                className={`filter-chip ${statutFiltre === filtre ? 'active' : ''}`}
                onClick={() => setStatutFiltre(filtre)}
              >
                {filtre}
              </button>
            ))}
          </div>
        </section>

        <section className="rdv-grid-section">
          {chargement && <p className="empty-rdv-state"><Hourglass size={18} /> Chargement...</p>}

          {!chargement && rendezVousFiltres.length === 0 ? (
            <div className="empty-rdv-state">
              <div className="empty-illustration"><Calendar size={40} /></div>
              <h3>Aucun rendez-vous trouvé</h3>
              <p>Aucun résultat ne correspond à vos critères de recherche ou de filtre.</p>
              <button className="btn-primary-rdv" onClick={() => { setStatutFiltre('Tous'); setRecherche(''); }}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="rdv-grid">
              {rendezVousFiltres.map((rdv) => (
                <article key={rdv.id} className="rdv-card">
                  <div className="rdv-card-header">
                    <div className="doctor-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DCE9FB', color: '#2563EB', fontWeight: 700 }}>
                      {initiales(rdv.medecin_nom, rdv.medecin_prenom)}
                    </div>
                    <div className="doctor-meta">
                      <span className="specialite-tag">{rdv.specialite || 'Médecine générale'}</span>
                      <h3 className="doctor-name">Dr. {rdv.medecin_prenom} {rdv.medecin_nom}</h3>
                    </div>
                    <span className={`statut-badge ${STATUT_BADGE_CLASS[rdv.statut]}`}>
                      {STATUT_LABELS[rdv.statut]}
                    </span>
                  </div>

                  <div className="rdv-card-body">
                    <div className="info-row">
                      <Calendar size={15} className="row-icon" />
                      <span className="row-text">{new Date(rdv.date_rdv).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="info-row">
                      <Clock3 size={15} className="row-icon" />
                      <span className="row-text">{new Date(rdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="info-row">
                      <FileText size={15} className="row-icon" />
                      <span className="row-text text-truncate">{rdv.motif || 'Consultation'}</span>
                    </div>
                  </div>

                  <div className="rdv-card-actions">
                    {(rdv.statut === 'confirme' || rdv.statut === 'en_attente') && (
                      <>
                        <button className="btn-secondary" onClick={() => { setModalRdv(rdv); setTypeModal('details'); }}>
                          Voir les détails
                        </button>
                        <button className="btn-danger" onClick={() => { setModalRdv(rdv); setTypeModal('annuler'); }}>
                          Annuler
                        </button>
                      </>
                    )}

                    {rdv.statut === 'termine' && (
                      <button className="btn-secondary" onClick={() => { setModalRdv(rdv); setTypeModal('details'); }}>
                        Voir les détails
                      </button>
                    )}

                    {rdv.statut === 'annule' && (
                      <button className="btn-primary-rdv" onClick={() => navigate('/rendez-vous')}>
                        <RotateCcw size={14} style={{ marginRight: '6px' }} /> Reprendre rendez-vous
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {modalRdv && (
        <div className="modal-overlay" onClick={() => setModalRdv(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalRdv(null)}><X size={16} /></button>

            <div className="modal-header">
              <div className="modal-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DCE9FB', color: '#2563EB', fontWeight: 700 }}>
                {initiales(modalRdv.medecin_nom, modalRdv.medecin_prenom)}
              </div>
              <div>
                <h2>Dr. {modalRdv.medecin_prenom} {modalRdv.medecin_nom}</h2>
                <p className="modal-specialite">{modalRdv.specialite || 'Médecine générale'}</p>
              </div>
            </div>

            {typeModal === 'details' && (
              <div className="modal-body">
                <h3 className="section-subtitle">Détails du rendez-vous</h3>
                <div className="detail-item"><strong>Statut :</strong> <span className={`statut-badge ${STATUT_BADGE_CLASS[modalRdv.statut]}`}>{STATUT_LABELS[modalRdv.statut]}</span></div>
                <div className="detail-item"><strong>Date :</strong> {new Date(modalRdv.date_rdv).toLocaleDateString('fr-FR')} à {new Date(modalRdv.date_rdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="detail-item"><strong>Motif :</strong> {modalRdv.motif || 'Non précisé'}</div>
              </div>
            )}

            {typeModal === 'annuler' && (
              <div className="modal-body">
                <h3 className="section-subtitle danger-text">Confirmer l'annulation</h3>
                <p>Êtes-vous sûr de vouloir annuler votre rendez-vous du <strong>{new Date(modalRdv.date_rdv).toLocaleDateString('fr-FR')}</strong> avec le Dr. {modalRdv.medecin_prenom} {modalRdv.medecin_nom} ?</p>
                <div className="modal-actions-confirm">
                  <button className="btn-secondary" onClick={() => setModalRdv(null)}>Conserver le RDV</button>
                  <button className="btn-danger-confirm" onClick={() => confirmerAnnulation(modalRdv.id)}>Oui, annuler le RDV</button>
                </div>
              </div>
            )}

            {typeModal !== 'annuler' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setModalRdv(null)}>Fermer</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MesRendezVous;