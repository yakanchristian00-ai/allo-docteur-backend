import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './TarifsAdmin.css';
import './DashboardAdmin.css';
import NotificationBell from '../components/NotificationBell';

function TarifsAdmin() {
    const [tarifs, setTarifs] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [chargement, setChargement] = useState(true);
    const [modalTarif, setModalTarif] = useState(null);
    const [modalAjout, setModalAjout] = useState(false);
    const [nouveauTarif, setNouveauTarif] = useState({ service: '', description: '', prix: '', icone: '💳' });
    const [revenuMois, setRevenuMois] = useState(null);

    const charger = () => {
        setChargement(true);
        api.get('/tarifs')
            .then((res) => setTarifs(res.data))
            .catch(() => setTarifs([]))
            .finally(() => setChargement(false));
    };

    const chargerRevenu = () => {
        api.get('/stats/revenu-mois')
            .then((res) => setRevenuMois(res.data.revenuMois))
            .catch(() => setRevenuMois(null));
    };

    useEffect(() => {
        charger();
        chargerRevenu();
    }, []);

    const tarifsFiltres = tarifs.filter((t) =>
        t.service.toLowerCase().includes(recherche.toLowerCase())
    );

    const prixMoyen = tarifs.length
        ? Math.round(tarifs.reduce((sum, t) => sum + Number(t.prix), 0) / tarifs.length)
        : 0;

    const enregistrerModification = async () => {
        try {
            await api.put(`/tarifs/${modalTarif.id}`, {
                service: modalTarif.service,
                description: modalTarif.description,
                prix: Number(modalTarif.prix),
            });
            setModalTarif(null);
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    const creerTarif = async () => {
        if (!nouveauTarif.service || !nouveauTarif.prix) return;
        try {
            await api.post('/tarifs', {
                service: nouveauTarif.service,
                description: nouveauTarif.description,
                prix: Number(nouveauTarif.prix),
                icone: nouveauTarif.icone,
            });
            setModalAjout(false);
            setNouveauTarif({ service: '', description: '', prix: '', icone: '💳' });
            charger();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-page">
            <AdminSidebar actif="tarifs" />

            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="admin-search">🔍 Rechercher...</div>
                    <div className="admin-topbar-right">
                        <NotificationBell />
                        <button>❓</button>
                    </div>
                </div>

                <div className="admin-content">
                    <div className="tarifs-header-row">
                        <div>
                            <h1>Gestion des Tarifs</h1>
                            <p>Configurez les prix des consultations et services.</p>
                        </div>
                        <button className="btn-ajouter-tarif" onClick={() => setModalAjout(true)}>+ Ajouter un Tarif</button>
                    </div>

                    <div className="tarifs-stats-row">
                        <div className="tarifs-stat-card">
                            <div className="tarifs-stat-icone">💳</div>
                            <div className="tarifs-stat-texte">
                                <p>Prix Moyen Consultation</p>
                                <div className="tarifs-stat-value">{prixMoyen.toLocaleString('fr-FR')} FCFA</div>
                            </div>
                        </div>
                        <div className="tarifs-stat-card">
                            <div className="tarifs-stat-icone">🕐</div>
                            <div className="tarifs-stat-texte">
                                <p>Services configurés</p>
                                <div className="tarifs-stat-value">{tarifs.length}</div>
                            </div>
                        </div>
                        <div className="tarifs-stat-card">
                            <div className="tarifs-stat-icone plein">📈</div>
                            <div className="tarifs-stat-texte">
                                <p>Revenu Estimé/Mois</p>
                                <div className="tarifs-stat-value">
                                    {revenuMois !== null ? `${revenuMois.toLocaleString('fr-FR')} FCFA` : '—'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tarifs-table-card">
                        <div className="tarifs-table-header">
                            <h2>Liste des Tarifs</h2>
                            <input
                                className="tarifs-search-input"
                                placeholder="🔍 Rechercher un service..."
                                value={recherche}
                                onChange={(e) => setRecherche(e.target.value)}
                            />
                        </div>

                        {chargement && <p className="tarifs-empty">Chargement...</p>}
                        {!chargement && tarifsFiltres.length === 0 && (
                            <p className="tarifs-empty">Aucun tarif trouvé.</p>
                        )}

                        {!chargement && tarifsFiltres.length > 0 && (
                            <table className="tarifs-table">
                                <thead>
                                    <tr>
                                        <th>Service</th>
                                        <th>Description</th>
                                        <th className="numeric">Prix Actuel (FCFA)</th>
                                        <th>Dernière Modif.</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tarifsFiltres.map((t) => (
                                        <tr key={t.id}>
                                            <td>
                                                <div className="service-cell">
                                                    <div className="service-icone">{t.icone}</div>
                                                    {t.service}
                                                </div>
                                            </td>
                                            <td className="description-cell">{t.description}</td>
                                            <td className="numeric">{Number(t.prix).toLocaleString('fr-FR')}</td>
                                            <td>{new Date(t.date_modification).toLocaleDateString('fr-FR')}</td>
                                            <td>
                                                <button className="edit-tarif-btn" onClick={() => setModalTarif({ ...t })}>✎</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {modalTarif && (
                <div className="modal-overlay-tarif" onClick={() => setModalTarif(null)}>
                    <div className="modal-tarif" onClick={(e) => e.stopPropagation()}>
                        <h3>Modifier le tarif</h3>
                        <label>Service</label>
                        <input
                            value={modalTarif.service}
                            onChange={(e) => setModalTarif({ ...modalTarif, service: e.target.value })}
                        />
                        <label>Description</label>
                        <textarea
                            rows={2}
                            value={modalTarif.description}
                            onChange={(e) => setModalTarif({ ...modalTarif, description: e.target.value })}
                        />
                        <label>Prix (FCFA)</label>
                        <input
                            type="number"
                            value={modalTarif.prix}
                            onChange={(e) => setModalTarif({ ...modalTarif, prix: e.target.value })}
                        />
                        <div className="modal-tarif-actions">
                            <button className="btn-annuler-modal" onClick={() => setModalTarif(null)}>Annuler</button>
                            <button className="btn-enregistrer-modal" onClick={enregistrerModification}>Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}

            {modalAjout && (
                <div className="modal-overlay-tarif" onClick={() => setModalAjout(false)}>
                    <div className="modal-tarif" onClick={(e) => e.stopPropagation()}>
                        <h3>Ajouter un nouveau tarif</h3>
                        <label>Nom du service</label>
                        <input
                            placeholder="Ex: Consultation pédiatrique"
                            value={nouveauTarif.service}
                            onChange={(e) => setNouveauTarif({ ...nouveauTarif, service: e.target.value })}
                        />
                        <label>Description</label>
                        <textarea
                            rows={2}
                            placeholder="Description courte du service"
                            value={nouveauTarif.description}
                            onChange={(e) => setNouveauTarif({ ...nouveauTarif, description: e.target.value })}
                        />
                        <label>Prix (FCFA)</label>
                        <input
                            type="number"
                            placeholder="Ex: 15000"
                            value={nouveauTarif.prix}
                            onChange={(e) => setNouveauTarif({ ...nouveauTarif, prix: e.target.value })}
                        />
                        <label>Icône (emoji)</label>
                        <input
                            placeholder="Ex: 🩺"
                            value={nouveauTarif.icone}
                            onChange={(e) => setNouveauTarif({ ...nouveauTarif, icone: e.target.value })}
                        />
                        <div className="modal-tarif-actions">
                            <button className="btn-annuler-modal" onClick={() => setModalAjout(false)}>Annuler</button>
                            <button className="btn-enregistrer-modal" onClick={creerTarif}>Créer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TarifsAdmin;