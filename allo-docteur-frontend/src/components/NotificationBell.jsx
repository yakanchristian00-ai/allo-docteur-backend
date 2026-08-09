import { useEffect, useState } from 'react';
import api from '../api/axios';
import './NotificationBell.css';

function tempsEcoule(date) {
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const heures = Math.floor(minutes / 60);
    if (heures < 24) return `Il y a ${heures}h`;
    const jours = Math.floor(heures / 24);
    return `Il y a ${jours}j`;
}

function NotificationBell() {
    const [ouvert, setOuvert] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        api.get('/stats/notifications')
            .then((res) => setNotifications(res.data))
            .catch(() => setNotifications([]));
    }, []);

    return (
        <div className="notif-wrapper">
            <button className="notif-bell-btn" onClick={() => setOuvert(!ouvert)}>
                🔔
                {notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
            </button>

            {ouvert && (
                <div className="notif-panel">
                    <div className="notif-panel-header">Notifications</div>
                    <div className="notif-panel-list">
                        {notifications.length === 0 && (
                            <p className="notif-empty">Aucune notification pour le moment.</p>
                        )}
                        {notifications.map((n) => (
                            <div key={n.id} className="notif-item">
                                <span className="notif-item-icone">{n.icone}</span>
                                <div className="notif-item-texte">
                                    <p>{n.message}</p>
                                    <span>{tempsEcoule(n.date)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;