import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './ModerationAdmin.css';

function ModerationAdmin() {
    const [signalements, setSignalements] = useState([]);

    const chargerSignalements = () => {
        api.get('/moderation')
            .then((res) => setSignalements(res.data))
            .catch(() => setSignalements([]));
    };

    useEffect(() => {
        chargerSignalements();
    }, []);

    const changerStatut = async (id, statut) => {
        try {
            await api.put(`/moderation/${id}/statut`, { statut });
            chargerSignalements();
        } catch (err) {
            console.error(err);
        }
    };

    const supprimerSignalement = async (id) => {
        try {
            await api.delete(`/moderation/${id}`);
            chargerSignalements();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="admin-page">
            <AdminSidebar actif="moderation" />

            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="admin-search">🔍 Rechercher...</div>
                    <div className="admin-topbar-right">
                        <button>🔔</button>
                        <button>❓</button>
                    </div>
                </div>

                <div className="admin-content">
                    <div className="moderation-header">
                        <div>
                            <h1>Modération</h1>
                            <p>Gérez les contenus signalés et les comptes à vérifier.</p>
                        </div>
                    </div>

                    <div className="moderation-stats">
                        <div className="moderation-stat-card">
                            <span>⚠️</span>
                            <div>
                                <p>Signalements</p>
                                <strong>{signalements.length}</strong>
                            </div>
                        </div>

                        <div className="moderation-stat-card">
                            <span>⏳</span>
                            <div>
                                <p>En attente</p>
                                <strong>{signalements.filter((s) => s.statut === 'En attente').length}</strong>
                            </div>
                        </div>

                        <div className="moderation-stat-card">
                            <span>✅</span>
                            <div>
                                <p>Vérifiés</p>
                                <strong>{signalements.filter((s) => s.statut === 'Vérifié').length}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="moderation-table-card">
                        <div className="moderation-table-header">
                            <h2>Contenus signalés</h2>
                        </div>

                        <table className="moderation-table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Auteur</th>
                                    <th>Contenu</th>
                                    <th>Date</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {signalements.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.type}</td>
                                        <td>{item.auteur}</td>
                                        <td className="moderation-content-cell">{item.contenu}</td>
                                        <td>
                                            {item.date_signalement
                                                ? new Date(item.date_signalement).toLocaleDateString('fr-FR')
                                                : item.date}
                                        </td>
                                        <td>
                                            <span className={`moderation-badge ${item.statut === 'Vérifié' ? 'verified' : 'pending'}`}>
                                                {item.statut}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="moderation-actions">
                                                <button onClick={() => changerStatut(item.id, 'Vérifié')}>
                                                    Valider
                                                </button>
                                                <button className="danger" onClick={() => supprimerSignalement(item.id)}>
                                                    Supprimer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ModerationAdmin;