import { useState, useCallback } from 'react';
import { barbersDatabase, BarberCredentials } from '@/data/barbers';

const STORAGE_KEY = 'barber_auth';

export const useBarberAuth = () => {
  const [authenticated, setAuthenticated] = useState<BarberCredentials | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((username: string, password: string) => {
    const barber = barbersDatabase.find(
      (b) => b.username === username && b.password === password
    );

    if (barber) {
      const credentials = {
        id: barber.id,
        username: barber.username,
        name: barber.name,
      };
      setAuthenticated(credentials);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
      return { success: true, barber: credentials };
    }

    return { success: false, error: 'Usuário ou senha inválidos' };
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
  };
};
