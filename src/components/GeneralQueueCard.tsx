import { Client } from '@/types/barbershop';
import { Users, HelpCircle } from 'lucide-react';

interface GeneralQueueCardProps {
  clients: Client[];
}

export const GeneralQueueCard = ({ clients }: GeneralQueueCardProps) => {
  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-xl p-5 shadow-card border border-white/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display text-xl text-foreground">Fila Geral</h3>
          <p className="text-sm text-muted-foreground">Sem preferência de barbeiro</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-secondary/30 rounded-lg p-3 mb-4 flex items-start gap-2">
        <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-xs text-muted-foreground">
          Clientes nesta fila serão atendidos pelo próximo barbeiro disponível
        </p>
      </div>

      {/* Count */}
      <div className="text-center py-4">
        <p className="text-4xl font-bold text-primary">{clients.length}</p>
        <p className="text-muted-foreground text-sm mt-1">
          {clients.length === 1 ? 'pessoa aguardando' : 'pessoas aguardando'}
        </p>
      </div>

      {/* Queue List */}
      {clients.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-2">Na fila:</p>
          <div className="space-y-2">
            {clients.slice(0, 5).map((client, idx) => (
              <div key={client.id} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                  {idx + 1}
                </span>
                <span className="text-foreground truncate flex-1">{client.name}</span>
                <img 
                  src={client.serviceType === 'haircut' ? '/corte.png' : client.serviceType === 'beard' ? '/barba.png' : '/corteebarba.png'} 
                  alt={client.serviceType === 'haircut' ? 'Corte' : client.serviceType === 'beard' ? 'Barba' : 'Corte + Barba'}
                  className="w-5 h-5"
                />
              </div>
            ))}
            {clients.length > 5 && (
              <p className="text-xs text-muted-foreground">+{clients.length - 5} mais...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};