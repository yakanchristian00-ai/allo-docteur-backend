import { useNavigate } from 'react-router-dom';

function AdminSidebar({ actif }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <aside className="admin-sidebar">
            <div className="admin-logo">
                <h1>Allo Docteur</h1>
                <p>Administration</p>
            </div>
            <nav className="admin-nav">
                <button className={`admin-nav-item ${actif === 'utilisateurs' ? 'active' : ''}`} onClick={() => navigate('/utilisateurs-admin')}>👥 Utilisateurs</button>
                <button className={`admin-nav-item ${actif === 'statistiques' ? 'active' : ''}`} onClick={() => navigate('/dashboard-admin')}>📈 Statistiques</button>
                <button className={`admin-nav-item ${actif === 'tarifs' ? 'active' : ''}`}>💳 Tarifs</button>
                <button className={`admin-nav-item ${actif === 'moderation' ? 'active' : ''}`}>🛡️ Modération</button>
            </nav>
            <div className="admin-sidebar-footer">
                <button className="admin-nav-item logout" onClick={handleLogout}>⇥ Déconnexion</button>
                <div className="admin-user-mini">
                    <div className="admin-user-mini-avatar">🙂</div>
                    <div className="admin-user-mini-texte">
                        <p>{user.prenom} {user.nom}</p>
                        <span>{user.email}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default AdminSidebar;