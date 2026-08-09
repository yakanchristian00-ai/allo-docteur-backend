import { useEffect, useState } from 'react';
import api from '../api/axios';

function useParametresPublic() {
    const [parametresPublic, setParametresPublic] = useState({
        maintenance: false,
        inscriptions_medecins: true,
        urgences_actives: true,
        notifications_email: true,
    });

    const [chargementParametres, setChargementParametres] = useState(true);

    useEffect(() => {
        api.get('/parametres/public')
            .then((res) => setParametresPublic(res.data))
            .catch((err) => console.error(err))
            .finally(() => setChargementParametres(false));
    }, []);

    return { parametresPublic, chargementParametres };
}

export default useParametresPublic;