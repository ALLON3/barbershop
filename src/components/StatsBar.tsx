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

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-xl p-4 shadow-card border border-border/50">
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Clientes em espera</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalInQueues}</p>
        </div>
        
        <div className="text-center border-x border-border/50">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Tempo médio de espera</span>
          </div>
          <p className="text-2xl font-bold text-primary">{formatTime(overallAverageTime)}</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Atendendo</span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {busyBarbers}<span className="text-muted-foreground text-lg">/{activeBarbers}</span>
          </p>
        </div>
      </div>
    </div>
  );
};