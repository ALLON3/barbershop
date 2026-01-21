import { useState, useEffect, useCallback } from 'react';
import { Barber, Client, BarbershopState, ServiceType, BusinessHours } from '@/types/barbershop';

const STORAGE_KEY = 'barbershop-state';

const initialBarbers: Barber[] = [
  {
    id: 'charles',
    name: 'Charles',
    queue: [],
    currentClient: null,
    status: { status: 'available' },
    completedServices: 0,
    totalServiceTime: 0,
  },
  {
    id: 'guilherme',
    name: 'Guilherme',
    queue: [],
    currentClient: null,
    status: { status: 'available' },
    completedServices: 0,
    totalServiceTime: 0,
  },
  {
    id: 'paulo',
    name: 'Paulo',
    queue: [],
    currentClient: null,
    status: { status: 'available' },
    completedServices: 0,
    totalServiceTime: 0,
  },
];

// Business hours: Tuesday to Saturday, 10:00 to 20:00
const initialBusinessHours: BusinessHours[] = [
  { dayOfWeek: 0, isOpen: false, openTime: '', closeTime: '' }, // Sunday
  { dayOfWeek: 1, isOpen: false, openTime: '', closeTime: '' }, // Monday
  { dayOfWeek: 2, isOpen: true, openTime: '10:00', closeTime: '20:00' }, // Tuesday
  { dayOfWeek: 3, isOpen: true, openTime: '10:00', closeTime: '20:00' }, // Wednesday
  { dayOfWeek: 4, isOpen: true, openTime: '10:00', closeTime: '20:00' }, // Thursday
  { dayOfWeek: 5, isOpen: true, openTime: '10:00', closeTime: '20:00' }, // Friday
  { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '20:00' }, // Saturday
];

const initialState: BarbershopState = {
  barbers: initialBarbers,
  generalQueue: { clients: [] },
  businessHours: initialBusinessHours,
};

const loadState = (): BarbershopState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading state:', e);
  }
  return initialState;
};

const saveState = (state: BarbershopState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving state:', e);
  }
};

export const useBarbershop = () => {
  const [state, setState] = useState<BarbershopState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const addClientToBarber = useCallback((barberId: string, clientName: string, serviceType: ServiceType) => {
    const client: Client = { id: generateId(), name: clientName, serviceType, addedAt: Date.now() };
    setState(prev => ({
      ...prev,
      barbers: prev.barbers.map(b => b.id === barberId ? { ...b, queue: [...b.queue, client] } : b),
    }));
  }, []);

  const addClientToGeneralQueue = useCallback((clientName: string, serviceType: ServiceType) => {
    const client: Client = { id: generateId(), name: clientName, serviceType, addedAt: Date.now() };
    setState(prev => ({ ...prev, generalQueue: { clients: [...prev.generalQueue.clients, client] } }));
  }, []);

  const startService = useCallback((barberId: string, clientId?: string) => {
    setState(prev => {
      const barber = prev.barbers.find(b => b.id === barberId);
      if (!barber) return prev;
      let client: Client | undefined;
      const newQueue = [...barber.queue]; // Alterado de 'let' para 'const'
      const newGeneralQueue = [...prev.generalQueue.clients];
      if (clientId) {
        const idx = newQueue.findIndex(c => c.id === clientId);
        if (idx !== -1) { client = newQueue[idx]; newQueue.splice(idx, 1); }
        else {
          const gIdx = newGeneralQueue.findIndex(c => c.id === clientId);
          if (gIdx !== -1) { client = newGeneralQueue[gIdx]; newGeneralQueue.splice(gIdx, 1); }
        }
      } else if (newQueue.length > 0) { client = newQueue.shift(); }
      if (!client) return prev;
      return {
        ...prev,
        barbers: prev.barbers.map(b => b.id === barberId ? { ...b, queue: newQueue, currentClient: { ...client!, startedAt: Date.now() }, status: { status: 'busy' } } : b),
        generalQueue: { clients: newGeneralQueue },
      };
    });
  }, []);

  const finishService = useCallback((barberId: string) => {
    setState(prev => {
      const barber = prev.barbers.find(b => b.id === barberId);
      if (!barber || !barber.currentClient) return prev;
      const serviceTime = Date.now() - (barber.currentClient.startedAt || Date.now());
      return {
        ...prev,
        barbers: prev.barbers.map(b => b.id === barberId ? { ...b, currentClient: null, status: { status: 'available' }, completedServices: b.completedServices + 1, totalServiceTime: b.totalServiceTime + serviceTime } : b),
      };
    });
  }, []);

  const removeFromQueue = useCallback((barberId: string, clientId: string) => {
    setState(prev => ({ ...prev, barbers: prev.barbers.map(b => b.id === barberId ? { ...b, queue: b.queue.filter(c => c.id !== clientId) } : b) }));
  }, []);

  const removeFromGeneralQueue = useCallback((clientId: string) => {
    setState(prev => ({ ...prev, generalQueue: { clients: prev.generalQueue.clients.filter(c => c.id !== clientId) } }));
  }, []);

  const setPause = useCallback((barberId: string, reason?: string) => {
    setState(prev => ({ ...prev, barbers: prev.barbers.map(b => b.id === barberId ? { ...b, status: { status: 'paused', pauseReason: reason, pauseStartTime: Date.now() } } : b) }));
  }, []);

  const resumeWork = useCallback((barberId: string) => {
    setState(prev => ({ ...prev, barbers: prev.barbers.map(b => b.id === barberId ? { ...b, status: { status: 'available' } } : b) }));
  }, []);

  const updateBusinessHours = useCallback((dayOfWeek: number, isOpen: boolean, openTime?: string, closeTime?: string) => {
    setState(prev => ({
      ...prev,
      businessHours: prev.businessHours.map(h => 
        h.dayOfWeek === dayOfWeek 
          ? { ...h, isOpen, openTime: openTime || h.openTime, closeTime: closeTime || h.closeTime, customOverride: true }
          : h
      ),
    }));
  }, []);

  const getAverageTime = useCallback((barber: Barber) => {
    if (barber.completedServices === 0) return 25 * 60 * 1000;
    return barber.totalServiceTime / barber.completedServices;
  }, []);

  const getOverallAverageTime = useCallback(() => {
    const totalCompleted = state.barbers.reduce((sum, b) => sum + b.completedServices, 0);
    const totalTime = state.barbers.reduce((sum, b) => sum + b.totalServiceTime, 0);
    if (totalCompleted === 0) return 25 * 60 * 1000;
    return totalTime / totalCompleted;
  }, [state.barbers]);

  const getEstimatedWait = useCallback((barber: Barber) => {
    const avgTime = getAverageTime(barber);
    const queueLength = barber.queue.length + (barber.currentClient ? 1 : 0);
    return queueLength * avgTime;
  }, [getAverageTime]);

  const pullFromGeneralQueue = useCallback((barberId: string, clientId: string) => {
    startService(barberId, clientId);
  }, [startService]);

  return { state, addClientToBarber, addClientToGeneralQueue, startService, finishService, removeFromQueue, removeFromGeneralQueue, setPause, resumeWork, updateBusinessHours, getAverageTime, getOverallAverageTime, getEstimatedWait, pullFromGeneralQueue };
};
