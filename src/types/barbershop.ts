export type ServiceType = 'haircut' | 'haircut-beard' | 'beard';

export interface Client {
  id: string;
  name: string;
  serviceType: ServiceType;
  addedAt: number;
  startedAt?: number;
}

export interface BarberStatus {
  status: 'available' | 'busy' | 'paused';
  pauseReason?: string;
  pauseStartTime?: number; // Timestamp quando iniciou a pausa
}

export interface Barber {
  id: string;
  name: string;
  queue: Client[];
  currentClient: Client | null;
  status: BarberStatus;
  completedServices: number;
  totalServiceTime: number;
}

export interface GeneralQueue {
  clients: Client[];
}

export interface BusinessHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isOpen: boolean;
  openTime: string; // "10:00"
  closeTime: string; // "20:00"
  customOverride?: boolean; // Se foi alterado manualmente
}

export interface BarbershopState {
  barbers: Barber[];
  generalQueue: GeneralQueue;
  businessHours: BusinessHours[];
}
