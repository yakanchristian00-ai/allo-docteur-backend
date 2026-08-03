import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './MesRendezVous.css';

/**
 * Données fictives des rendez-vous
 * Structure prête à être remplacée par un appel API Axios :
 * api.get('/rendez-vous/patient').then(res => setRendezVous(res.data))
 */
const INITIAL_RENDEZ_VOUS = [
    {
        id: 1,
        contact_id: 1,
        medecin: "Dr. Sophie Martin",
        specialite: "Cardiologue",
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        date: "2026-08-04",
        dateFormatee: "Mardi 4 Août 2026",
        heure: "09:30",
        lieu: "Centre Médical Saint-Germain, 45 Rue de Rennes, Paris",
        statut: "Confirmé", // 'Confirmé', 'En attente', 'Terminé', 'Annulé'
        motif: "Consultation de suivi cardiologique",
        compteRendu: null,
        estAujourdhui: true
    },
    {
        id: 2,
        contact_id: 2,
        medecin: "Dr. Thomas Bernard",
        specialite: "Médecin Généraliste",
        avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
        date: "2026-08-12",
        dateFormatee: "Mercredi 12 Août 2026",
        heure: "14:15",
        lieu: "Cabinet Médical Haussmann, 120 Bld Haussmann, Paris",
        statut: "En attente",
        motif: "Bilan annuel et renouvellement d'ordonnance",
        compteRendu: null,
        estAujourdhui: false
    },
    {
        id: 3,
        contact_id: 3,
        medecin: "Dr. Claire Dubois",
        specialite: "Dermatologue",
        avatar: "https://images.unsplash.com/photo-1594824813566-88855ce78961?w=150&h=150&fit=crop&crop=face",
        date: "2026-07-20",
        dateFormatee: "Lundi 20 Juillet 2026",
        heure: "11:00",
        lieu: "Polyclinique des Champs-Élysées, Paris",
        statut: "Terminé",
        motif: "Contrôle annuel des grains de beauté",
        compteRendu: "Examen dermatologique complet effectué. Aucune anomalie détectée. Prochain contrôle recommandé dans 12 mois.",
        estAujourdhui: false
    },
    {
        id: 4,
        contact_id: 4,
        medecin: "Dr. Antoine Rousseau",
        specialite: "Pédiatre / Allergologue",
        avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face",
        date: "2026-07-15",
        dateFormatee: "Mercredi 15 Juillet 2026",
        heure: "16:00",
        lieu: "Espace Santé Opéra, Paris",
        statut: "Annulé",
        motif: "Test allergologique saisonnier",
        compteRendu: null,
        estAujourdhui: false
    },
    {
        id: 5,
        contact_id: 5,
        medecin: "Dr. Élodie Petit",
        specialite: "Ophtalmologue",
        avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
        date: "2026-08-25",
        dateFormatee: "Mardi 25 Août 2026",
        heure: "10:45",
        lieu: "Centre Ophtalmologique de la Défense, Puteaux",
        statut: "Confirmé",
        motif: "Renouvellement de prescription verres correcteurs",
        compteRendu: null,
        estAujourdhui: false
    }
];

function MesRendezVous() {
    const navigate = useNavigate();
    const [rendezVousList, setRendezVousList] = useState(INITIAL_RENDEZ_VOUS);
    const [statutFiltre, setStatutFiltre] = useState('Tous'); // 'Tous', 'Confirmés', 'En attente', 'Terminés', 'Annulés'
    const [recherche, setRecherche] = useState('');
    const [modalRdv, setModalRdv] = useState(null); // rendez-vous sélectionné pour la modale
    const [typeModal, setTypeModal] = useState(null); // 'details', 'compteRendu', 'annuler'

    // Calcul dynamique des statistiques
    const stats = useMemo(() => {
        const aujourdhuiCount = rendezVousList.filter(r => r.estAujourdhui || r.date === "2026-08-04").length;
        const aVenirCount = rendezVousList.filter(r => r.statut === 'Confirmé' || r.statut === 'En attente').length;
        const terminesCount = rendezVousList.filter(r => r.statut === 'Terminé').length;
        const annulesCount = rendezVousList.filter(r => r.statut === 'Annulé').length;

        return { aujourdhuiCount, aVenirCount, terminesCount, annulesCount };
    }, [rendezVousList]);

    // Filtrage dynamique des cartes de rendez-vous
    const rendezVousFiltres = useMemo(() => {
        return rendezVousList.filter(rdv => {
            // Filtrage par statut
            let correspondStatut = true;
            if (statutFiltre === 'Confirmés') correspondStatut = rdv.statut === 'Confirmé';
            else if (statutFiltre === 'En attente') correspondStatut = rdv.statut === 'En attente';
            else if (statutFiltre === 'Terminés') correspondStatut = rdv.statut === 'Terminé';
            else if (statutFiltre === 'Annulés') correspondStatut = rdv.statut === 'Annulé';

            // Filtrage par recherche
            const rechercheLower = recherche.toLowerCase().trim();
            const correspondRecherche = !rechercheLower ||
                rdv.medecin.toLowerCase().includes(rechercheLower) ||
                rdv.specialite.toLowerCase().includes(rechercheLower) ||
                rdv.lieu.toLowerCase().includes(rechercheLower);

            return correspondStatut && correspondRecherche;
        });
    }, [rendezVousList, statutFiltre, recherche]);

    // Action d'annulation de RDV
    const confirmerAnnulation = (id) => {
        setRendezVousList(prev => prev.map(rdv => rdv.id === id ? { ...rdv, statut: 'Annulé' } : rdv));
        setModalRdv(null);
        setTypeModal(null);
    };

    // Obtenir la classe de couleur de statut
    const getStatutBadgeClass = (statut) => {
        switch (statut) {
            case 'Confirmé': return 'badge-confirme';
            case 'En attente': return 'badge-attente';
            case 'Terminé': return 'badge-termine';
            case 'Annulé': return 'badge-annule';
            default: return '';
        }
    };

    return (
        <div className="mes-rdv-container">
            {/* EN-TÊTE DE PAGE */}
            <header className="mes-rdv-header">
                <div className="header-top">
                    <button className="btn-back" onClick={() => navigate('/dashboard-patient')} title="Retour au tableau de bord">
                        ←
                    </button>
                    <div>
                        <h1 className="main-title">Mes rendez-vous</h1>
                        <p className="sub-title">Consultez et gérez tous vos rendez-vous médicaux.</p>
                    </div>
                </div>
            </header>

            <main className="mes-rdv-main">
                {/* BARRE DE STATISTIQUES (4 CARTES) */}
                <section className="stats-bar" aria-label="Statistiques des rendez-vous">
                    <div className="stat-card stat-aujourdhui" onClick={() => setStatutFiltre('Tous')}>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">📅</span>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.aujourdhuiCount}</span>
                            <span className="stat-label">Aujourd'hui</span>
                        </div>
                    </div>

                    <div className="stat-card stat-avenir" onClick={() => setStatutFiltre('Confirmés')}>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">⏳</span>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.aVenirCount}</span>
                            <span className="stat-label">À venir</span>
                        </div>
                    </div>

                    <div className="stat-card stat-termines" onClick={() => setStatutFiltre('Terminés')}>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">✅</span>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.terminesCount}</span>
                            <span className="stat-label">Terminés</span>
                        </div>
                    </div>

                    <div className="stat-card stat-annules" onClick={() => setStatutFiltre('Annulés')}>
                        <div className="stat-icon-wrapper">
                            <span className="stat-icon">❌</span>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.annulesCount}</span>
                            <span className="stat-label">Annulés</span>
                        </div>
                    </div>
                </section>

                {/* BARRE DE RECHERCHE ET FILTRES */}
                <section className="search-filter-bar">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Rechercher un médecin, une spécialité ou un lieu..."
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                        />
                        {recherche && (
                            <button className="search-clear" onClick={() => setRecherche('')}>✕</button>
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

                {/* CORPS DE LA PAGE : GRILLE DES CARTES DE RENDEZ-VOUS */}
                <section className="rdv-grid-section">
                    {rendezVousFiltres.length === 0 ? (
                        <div className="empty-rdv-state">
                            <div className="empty-illustration">📅</div>
                            <h3>Aucun rendez-vous trouvé</h3>
                            <p>Aucun résultat ne correspond à vos critères de recherche ou de filtre.</p>
                            <button className="btn-primary-rdv" onClick={() => { setStatutFiltre('Tous'); setRecherche(''); }}>
                                Reinitialiser les filtres
                            </button>
                        </div>
                    ) : (
                        <div className="rdv-grid">
                            {rendezVousFiltres.map((rdv) => (
                                <article key={rdv.id} className="rdv-card">
                                    {/* En-tête de la carte */}
                                    <div className="rdv-card-header">
                                        <img
                                            src={rdv.avatar}
                                            alt={rdv.medecin}
                                            className="doctor-avatar"
                                        />
                                        <div className="doctor-meta">
                                            <span className="specialite-tag">{rdv.specialite}</span>
                                            <h3 className="doctor-name">{rdv.medecin}</h3>
                                        </div>
                                        <span className={`statut-badge ${getStatutBadgeClass(rdv.statut)}`}>
                                            {rdv.statut}
                                        </span>
                                    </div>

                                    {/* Informations pratiques */}
                                    <div className="rdv-card-body">
                                        <div className="info-row">
                                            <span className="row-icon">📅</span>
                                            <span className="row-text">{rdv.dateFormatee}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="row-icon">🕒</span>
                                            <span className="row-text">{rdv.heure}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="row-icon">📍</span>
                                            <span className="row-text text-truncate" title={rdv.lieu}>{rdv.lieu}</span>
                                        </div>
                                    </div>

                                    {/* Boutons d'action contextuels selon le statut */}
                                    <div className="rdv-card-actions">
                                        {rdv.statut === 'Confirmé' && (
                                            <>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => { setModalRdv(rdv); setTypeModal('details'); }}
                                                >
                                                    Voir les détails
                                                </button>
                                                <button
                                                    className="btn-danger"
                                                    onClick={() => { setModalRdv(rdv); setTypeModal('annuler'); }}
                                                >
                                                    Annuler
                                                </button>
                                            </>
                                        )}

                                        {rdv.statut === 'En attente' && (
                                            <button
                                                className="btn-primary-rdv"
                                                onClick={() => { setModalRdv(rdv); setTypeModal('details'); }}
                                            >
                                                Voir
                                            </button>
                                        )}

                                        {rdv.statut === 'Terminé' && (
                                            <>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={() => { setModalRdv(rdv); setTypeModal('compteRendu'); }}
                                                >
                                                    Voir le compte rendu
                                                </button>
                                                <button
                                                    className="btn-primary-rdv"
                                                    onClick={() => navigate(`/messages/${rdv.contact_id}`)}
                                                >
                                                    Ouvrir la conversation
                                                </button>
                                            </>
                                        )}

                                        {rdv.statut === 'Annulé' && (
                                            <button
                                                className="btn-primary-rdv"
                                                onClick={() => navigate('/rendez-vous')}
                                            >
                                                Reprendre rendez-vous
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* MODALE CONTEXTUELLE DE DÉTAILS / COMPTE RENDU / ANNULATION */}
            {modalRdv && (
                <div className="modal-overlay" onClick={() => setModalRdv(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setModalRdv(null)}>✕</button>

                        <div className="modal-header">
                            <img src={modalRdv.avatar} alt={modalRdv.medecin} className="modal-avatar" />
                            <div>
                                <h2>{modalRdv.medecin}</h2>
                                <p className="modal-specialite">{modalRdv.specialite}</p>
                            </div>
                        </div>

                        {typeModal === 'details' && (
                            <div className="modal-body">
                                <h3 className="section-subtitle">Détails du rendez-vous</h3>
                                <div className="detail-item"><strong>Statut :</strong> <span className={`statut-badge ${getStatutBadgeClass(modalRdv.statut)}`}>{modalRdv.statut}</span></div>
                                <div className="detail-item"><strong>Date :</strong> {modalRdv.dateFormatee} à {modalRdv.heure}</div>
                                <div className="detail-item"><strong>Lieu :</strong> {modalRdv.lieu}</div>
                                <div className="detail-item"><strong>Motif :</strong> {modalRdv.motif}</div>
                            </div>
                        )}

                        {typeModal === 'compteRendu' && (
                            <div className="modal-body">
                                <h3 className="section-subtitle">Compte rendu médical</h3>
                                <div className="compte-rendu-box">
                                    <p>{modalRdv.compteRendu || "Aucun compte rendu rédigé pour ce rendez-vous."}</p>
                                </div>
                            </div>
                        )}

                        {typeModal === 'annuler' && (
                            <div className="modal-body">
                                <h3 className="section-subtitle danger-text">Confirmer l'annulation</h3>
                                <p>Êtes-vous sûr de vouloir annuler votre rendez-vous du <strong>{modalRdv.dateFormatee} à {modalRdv.heure}</strong> avec le {modalRdv.medecin} ?</p>
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
