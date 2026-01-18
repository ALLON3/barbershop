import { useState, useCallback } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type BarberCredentials = {
  id: string;
  username: string;
  name: string;
};

const STORAGE_KEY = 'barber_auth';

export const useBarberAuth = () => {
  const [authenticated, setAuthenticated] = useState<BarberCredentials | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    try {
      // Query Firestore for barber with matching username and password
      const q = query(
        collection(db, 'barbers'),
        where('username', '==', username),
        where('password', '==', password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const barberDoc = querySnapshot.docs[0];
        const barberData = barberDoc.data();
        
        const credentials: BarberCredentials = {
          id: barberDoc.id,
          username: barberData.username,
          name: barberData.name,
        };
        
        setAuthenticated(credentials);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
        setLoading(false);
        return { success: true, barber: credentials };
      }

      setLoading(false);
      return { success: false, error: 'Usuário ou senha inválidos' };
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  }, []);

  const logout = useCallback(() => {
    setAuthenticated(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    authenticated,
    login,
    logout,
    isAuthenticated: !!authenticated,
    loading,
  };
};
