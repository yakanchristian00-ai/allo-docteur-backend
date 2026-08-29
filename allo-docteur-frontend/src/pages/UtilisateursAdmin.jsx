import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import './UtilisateursAdmin.css';
import '../pages/DashboardAdmin.css';
import NotificationBell from '../components/NotificationBell';
import './TarifsAdmin.css';

function initiales(nom, prenom) {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase();
}

function UtilisateursAdmin() {
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [roleFiltre, setRoleFiltre] = useState('tous');
    const [statutFiltre, setStatutFiltre] = useState('tous');
    const [chargement, setChargement] = useState(true);
    const navigate = useNavigate();



    const charger = () => {
        setChargement(true);
        api.get('/users')
            .then((res) => setUtilisateurs(res.data))
            .catch(() => setUtilisateurs([]))
            .finally(() => setChargement(false));
    };

    useEffect(() => {
        charger();
    }, []);

    const toggleStatut = async (u) => {
        try {
            await api.patch(`/users/${u.id}/status`, { actif: !u.actif });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    const utilisateursFiltres = utilisateurs.filter((u) => {
        const matchRole = roleFiltre === 'tous' || u.role === roleFiltre;
        const matchStatut =
            statutFiltre === 'tous' ||
            (statutFiltre === 'actif' && u.actif) ||
            (statutFiltre === 'bloque' && !u.actif);
        return matchRole && matchStatut;
    });

    const totalMedecinsActifs = utilisateurs.filter((u) => u.role === 'medecin' && u.actif).length;
    const nouveauxPatients = utilisateurs.filter((u) => u.role === 'patient').length;
    const [modalNouveauMedecin, setModalNouveauMedecin] = useState(false);
    const [nouveauMedecin, setNouveauMedecin] = useState({
        nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', specialite: '', licence: ''
    });
    const [erreurCreation, setErreurCreation] = useState('');

    const creerMedecin = async () => {
        setErreurCreation('');
        try {
            await api.post('/users/creer-medecin', nouveauMedecin);
            setModalNouveauMedecin(false);
            setNouveauMedecin({ nom: '', prenom: '', email: '', telephone: '', mot_de_passe: '', specialite: '', licence: '' });
            charger();
        } catch (err) {
            setErreurCreation(err.response?.data?.message || 'Erreur lors de la création');
        }
    };

    return (
        <div className="admin-page">
            <AdminSidebar actif="utilisateurs" />

            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="admin-search">🔍 Rechercher...</div>
                    <div className="admin-topbar-right">
                        <NotificationBell />
                        <button type="button">❓</button>
                    </div>
                </div>

                <div className="admin-content">
                    <div className="users-header-row">
                        <div>
                            <h1>Gestion des Utilisateurs</h1>
                            <p>Gérez les profils, les rôles et les accès à la plateforme.</p>
                        </div>
                        <button type="button" className="btn-nouvel-utilisateur" onClick={() => setModalNouveauMedecin(true)}>+ Nouvel Utilisateur</button>                    </div>

                    <div className="users-stats-row">
                        <div className="users-stat-card">
                            <div className="users-stat-icone bleu">👥</div>
                            <div className="users-stat-texte">
                                <p>Utilisateurs Totaux</p>
                                <div className="users-stat-value">{utilisateurs.length}</div>
                            </div>
                        </div>
                        <div className="users-stat-card">
                            <div className="users-stat-icone bleu">🩺</div>
                            <div className="users-stat-texte">
                                <p>Médecins Actifs</p>
                                <div className="users-stat-value">{totalMedecinsActifs}</div>
                            </div>
                        </div>
                        <div className="users-stat-card">
                            <div className="users-stat-icone rouge">👤➕</div>
                            <div className="users-stat-texte">
                                <p>Patients</p>
                                <div className="users-stat-value">{nouveauxPatients}</div>
                            </div>
                        </div>
                    </div>

                    <div className="users-table-card">
                        <div className="users-filtres-row">
                            <div className="users-filtres-left">
                                <select className="filtre-select" value={roleFiltre} onChange={(e) => setRoleFiltre(e.target.value)}>
                                    <option value="tous">Tous les rôles</option>
                                    <option value="patient">Patient</option>
                                    <option value="medecin">Médecin</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <select className="filtre-select" value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)}>
                                    <option value="tous">Tous les statuts</option>
                                    <option value="actif">Actif</option>
                                    <option value="bloque">Bloqué</option>
                                </select>
                            </div>
                            <span className="filtres-avances">☰ Filtres avancés</span>
                        </div>

                        {chargement && <p className="users-empty">Chargement...</p>}
                        {!chargement && utilisateursFiltres.length === 0 && (
                            <p className="users-empty">Aucun utilisateur trouvé.</p>
                        )}

                        {!chargement && utilisateursFiltres.length > 0 && (
                            <table className="users-table">
                                <thead>
                                    <tr>
                                        <th>Utilisateur</th>
                                        <th>Rôle</th>
                                        <th>Email</th>
                                        <th>Statut</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {utilisateursFiltres.map((u) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className="user-cell-avatar">{initiales(u.nom, u.prenom)}</div>
                                                    <div className="user-cell-texte">
                                                        <p>{u.prenom} {u.nom}</p>
                                                        <span>ID: #{String(u.id).padStart(4, '0')}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="role-tag">{u.role}</td>
                                            <td>{u.email}</td>
                                            <td>
                                                <span className={`statut-tag ${u.actif ? 'actif' : 'bloque'}`}>
                                                    <span className="dot"></span> {u.actif ? 'Actif' : 'Bloqué'}
                                                </span>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-nouvel-utilisateur" onClick={() => navigate('/demandes-admin')} style={{ background: '#F1F3F6', color: '#374151', marginRight: '10px' }}>
                                                  📨 Demandes en attente
                                                </button>
                                                <button type="button" className="btn-nouvel-utilisateur" onClick={() => navigate('/demandes-admin')} style={{ background: '#F1F3F6', color: '#374151', marginRight: '10px' }}>
                                                  📋 Audit médecins 
                                                </button>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                  <button type="button" className="action-menu-btn" onClick={() => toggleStatut(u)} title={u.actif ? 'Bloquer' : 'Activer'}>
                                                    ⋮
                                                   </button>
                                                   {u.role === 'medecin' && (
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    onClick={() => navigate(`/historique-licence/${u.id}`)}
                                                          style={{ background: '#EFF4FF', color: '#2563EB', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                                        >
                                                          Licence
                                                        </button>
                                                    )}
                                                </div>
                                                
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        <div className="pagination-row">
                            <span>Affichage 1-{utilisateursFiltres.length} sur {utilisateurs.length} utilisateurs</span>
                        </div>
                    </div>
                </div>
                {modalNouveauMedecin && (
                    <div className="modal-overlay-tarif" role="button" tabIndex="0" onClick={() => setModalNouveauMedecin(false)} onKeyDown={(e) => e.key === 'Escape' && setModalNouveauMedecin(false)}>
                        <div className="modal-tarif" role="dialog" aria-modal="true" aria-labelledby="nouveau-medecin-titre" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                            <h3 id="nouveau-medecin-titre">Créer un compte médecin</h3>
                            <label htmlFor="nouveau-medecin-nom">Nom</label>
                            <input id="nouveau-medecin-nom" value={nouveauMedecin.nom} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, nom: e.target.value })} />
                            <label htmlFor="nouveau-medecin-prenom">Prénom</label>
                            <input id="nouveau-medecin-prenom" value={nouveauMedecin.prenom} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, prenom: e.target.value })} />
                            <label htmlFor="nouveau-medecin-email">Email</label>
                            <input id="nouveau-medecin-email" type="email" value={nouveauMedecin.email} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, email: e.target.value })} />
                            <label htmlFor="nouveau-medecin-telephone">Téléphone</label>
                            <input id="nouveau-medecin-telephone" value={nouveauMedecin.telephone} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, telephone: e.target.value })} />
                            <label htmlFor="nouveau-medecin-mot-de-passe">Mot de passe temporaire</label>
                            <input id="nouveau-medecin-mot-de-passe" type="password" value={nouveauMedecin.mot_de_passe} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, mot_de_passe: e.target.value })} />
                            <label htmlFor="nouveau-medecin-specialite">Spécialité</label>
                            <input id="nouveau-medecin-specialite" value={nouveauMedecin.specialite} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, specialite: e.target.value })} />
                            <label htmlFor="nouveau-medecin-licence">Numéro de licence</label>
                            <input id="nouveau-medecin-licence" value={nouveauMedecin.licence} onChange={(e) => setNouveauMedecin({ ...nouveauMedecin, licence: e.target.value })} />

                            {erreurCreation && <p style={{ color: 'red', fontSize: '13px', marginTop: '10px' }}>{erreurCreation}</p>}

                            <div className="modal-tarif-actions">
                                <button type="button" className="btn-annuler-modal" onClick={() => setModalNouveauMedecin(false)}>Annuler</button>
                                <button type="button" className="btn-enregistrer-modal" onClick={creerMedecin}>Créer le compte</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

export default UtilisateursAdmin;