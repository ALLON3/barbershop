import { Clock, Users, TrendingUp } from 'lucide-react';
import { Barber } from '@/types/barbershop';

interface StatsBarProps {
  barbers: Barber[];
  generalQueueCount: number;
  overallAverageTime: number;
}

const formatTime = (ms: number) => {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

export const StatsBar = ({ barbers, generalQueueCount, overallAverageTime }: StatsBarProps) => {
  const totalInQueues = barbers.reduce((sum, b) => sum + b.queue.length, 0) + generalQueueCount;
  const activeBarbers = barbers.filter(b => b.status.status !== 'paused').length;
  const busyBarbers = barbers.filter(b => b.status.status === 'busy').length;

  return null;
};