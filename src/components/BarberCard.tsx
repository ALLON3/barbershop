import { Barber } from '@/types/barbershop';
import { useState, useEffect } from 'react';
import { Users, Clock, Scissors, User, Pause } from 'lucide-react';

interface BarberCardProps {
  barber: Barber;
  averageTime: number;
  estimatedWait: number;
}

const formatTime = (ms: number) => {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

const formatPauseTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available':
      return 'bg-success';
    case 'busy':
      return 'bg-accent';
    case 'paused':
      return 'bg-warning';
    default:
      return 'bg-muted';
  }
};

const getStatusText = (barber: Barber) => {
  switch (barber.status.status) {
    case 'available':
      return 'Disponível';
    case 'busy':
      return 'Atendendo';
    case 'paused':
      return barber.status.pauseReason || 'Em pausa';
    default:
      return '';
  }
};

export const BarberCard = ({ barber, averageTime, estimatedWait }: BarberCardProps) => {
  const queueCount = barber.queue.length;
  const [pauseTime, setPauseTime] = useState<string>('0:00');

  useEffect(() => {
    const interval = setInterval(() => {
      if (barber.status.status === 'paused' && barber.status.pauseStartTime) {
        const elapsed = Date.now() - barber.status.pauseStartTime;
        setPauseTime(formatPauseTime(elapsed));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [barber.status.status, barber.status.pauseStartTime]);
  
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 transition-all hover:border-primary/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display text-lg font-bold">
              {barber.name[0]}
            </span>
          </div>
          <div>
            <h3 className="font-display text-xl text-foreground">{barber.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(barber.status.status)}`} />
              <span className="text-sm text-muted-foreground">{getStatusText(barber)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current Client */}
      {barber.currentClient && (
        <div className="bg-secondary/50 rounded-lg p-3 mb-4 border border-accent/30">
          <div className="flex items-center gap-2 text-accent">
            <Scissors className="w-4 h-4" />
            <span className="text-sm font-medium">Atendendo agora</span>
          </div>
          <p className="text-foreground mt-1 font-medium">{barber.currentClient.name}</p>
          <p className="text-muted-foreground text-xs mt-0.5">
            {barber.currentClient.serviceType === 'haircut' ? 'Corte' : 
             barber.currentClient.serviceType === 'beard' ? 'Barba' :
             'Corte + Barba'}
          </p>
        </div>
      )}

      {/* Pause Info */}
      {barber.status.status === 'paused' && (
        <div className="bg-warning/10 rounded-lg p-3 mb-4 border border-warning/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-warning">
              <Pause className="w-4 h-4" />
              <div>
                <span className="text-sm font-medium block">{barber.status.pauseReason || 'Em pausa'}</span>
              </div>
            </div>
            <span className="text-xs font-mono text-warning">{pauseTime}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Na fila</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{queueCount}</p>
        </div>
        <div className="bg-secondary/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Espera</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatTime(estimatedWait)}</p>
        </div>
      </div>

      {/* Queue Preview */}
      {queueCount > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Próximos:</p>
          <div className="space-y-2">
            {barber.queue.slice(0, 3).map((client, idx) => (
              <div key={client.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  {idx + 1}
                </span>
                <span className="text-foreground truncate flex-1">{client.name}</span>
                <span className="text-muted-foreground text-xs">
                  {client.serviceType === 'haircut' ? '✂️' :
                   client.serviceType === 'beard' ? '🧔' :
                   '✂️🧔'}
                </span>
              </div>
            ))}
            {queueCount > 3 && (
              <p className="text-xs text-muted-foreground">+{queueCount - 3} mais...</p>
            )}
          </div>
        </div>
      )}

      {/* Average Time */}
      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
        <span>Tempo médio:</span>
        <span className="text-primary font-medium">{formatTime(averageTime)}</span>
      </div>
    </div>
  );
};