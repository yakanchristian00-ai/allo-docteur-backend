import { useEffect, useState } from 'react';
import api from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import './DashboardAdmin.css';
import './ParametresAdmin.css';
import NotificationBell from '../components/NotificationBell';

function ParametresAdmin() {
    const [parametres, setParametres] = useState({
        nom_application: '',
        email_admin: '',
        telephone_support: '',
        ville_principale: '',
        devise: 'FCFA',
        maintenance: false,
        inscriptions_medecins: true,
        urgences_actives: true,
        notifications_email: true,
    });

    const changerValeur = (champ, valeur) => {
        setParametres((ancien) => ({
            ...ancien,
            [champ]: valeur,
        }));
    };

    useEffect(() => {
        api.get('/parametres')
            .then((res) => setParametres(res.data))
            .catch((err) => console.error(err));
    }, []);

    const enregistrer = async () => {
        try {
            const donneesAEnvoyer = {
                nom_application: parametres.nom_application,
                telephone_support: parametres.telephone_support,
                ville_principale: parametres.ville_principale,
                devise: parametres.devise,
                maintenance: parametres.maintenance,
                inscriptions_medecins: parametres.inscriptions_medecins,
                urgences_actives: parametres.urgences_actives,
                notifications_email: parametres.notifications_email,
            };

            await api.put('/parametres', donneesAEnvoyer);
            alert('Paramètres enregistrés avec succès');
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l'enregistrement");
        }
    };


    return (
        <div className="admin-page">
            <AdminSidebar actif="parametres" />

            <main className="admin-main">
                <div className="admin-topbar">
                    <div className="admin-search">🔍 Rechercher...</div>
                    <div className="admin-topbar-right">
                        <NotificationBell />
                        <button>❓</button>
                    </div>
                </div>

                <div className="admin-content">
                    <div className="parametres-header">
                        <div>
                            <h1>Paramètres</h1>
                            <p>Configurez les informations générales et les options de la plateforme.</p>
                        </div>

                        <button className="btn-save-settings" onClick={enregistrer}>
                            Enregistrer
                        </button>
                    </div>

                    <div className="parametres-grid">
                        <section className="parametres-card">
                            <h2>Informations générales</h2>

                            <label>Nom de l'application</label>
                            <input
                                value={parametres.nom_application}
                                onChange={(e) => changerValeur('nom_application', e.target.value)}
                            />

                            <label>Email administrateur</label>
                            <input value={parametres.email_admin || ''} disabled />
                            <label>Téléphone support</label>
                            <input
                                value={parametres.telephone_support}
                                onChange={(e) => changerValeur('telephone_support', e.target.value)}
                            />

                            <label>Ville principale</label>
                            <input
                                value={parametres.ville_principale}
                                onChange={(e) => changerValeur('ville_principale', e.target.value)}
                            />

                            <label>Devise</label>
                            <select
                                value={parametres.devise}
                                onChange={(e) => changerValeur('devise', e.target.value)}
                            >
                                <option value="FCFA">FCFA</option>
                                <option value="EUR">Euro</option>
                                <option value="USD">Dollar américain</option>
                            </select>
                        </section>

                        <section className="parametres-card">
                            <h2>Options plateforme</h2>

                            <div className="setting-toggle-row">
                                <div>
                                    <strong>Mode maintenance</strong>
                                    <p>Désactive temporairement l'accès des utilisateurs.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={parametres.maintenance}
                                    onChange={(e) => changerValeur('maintenance', e.target.checked)}
                                />
                            </div>

                            <div className="setting-toggle-row">
                                <div>
                                    <strong>Inscriptions médecins</strong>
                                    <p>Autorise les nouveaux médecins à s'inscrire.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={parametres.inscriptions_medecins}
                                    onChange={(e) => changerValeur('inscriptions_medecins', e.target.checked)}
                                />
                            </div>

                            <div className="setting-toggle-row">
                                <div>
                                    <strong>Urgences actives</strong>
                                    <p>Permet aux patients d'envoyer des demandes d'urgence.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={parametres.urgences_actives}
                                    onChange={(e) => changerValeur('urgences_actives', e.target.checked)}
                                />
                            </div>

                            <div className="setting-toggle-row">
                                <div>
                                    <strong>Notifications email</strong>
                                    <p>Envoie des emails automatiques aux utilisateurs.</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={parametres.notifications_email}
                                    onChange={(e) => changerValeur('notifications_email', e.target.checked)}
                                />
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default ParametresAdmin;