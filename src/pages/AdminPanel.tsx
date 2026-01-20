import { useState } from 'react';
import { useBarbershop } from '@/hooks/useBarbershop';
import { useBarberAuth } from '@/hooks/useBarberAuth';
import { Barber, ServiceType } from '@/types/barbershop';
import { 
  Scissors, 
  UserPlus, 
  CheckCircle, 
  Pause, 
  Play, 
  X, 
  ArrowLeft,
  Clock,
  Users,
  UserCheck,
  LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';

const formatDuration = (startedAt: number) => {
  const elapsed = Date.now() - startedAt;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const AdminPanel = () => {
  const {
    state,
    addClientToBarber,
    addClientToGeneralQueue,
    startService,
    finishService,
    removeFromQueue,
    removeFromGeneralQueue,
    setPause,
    resumeWork,
    updateBusinessHours,
    pullFromGeneralQueue,
    getAverageTime,
  } = useBarbershop();

  const { authenticated, logout } = useBarberAuth();

  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showBusinessHours, setShowBusinessHours] = useState(false);
  const [showAbsentModal, setShowAbsentModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('haircut');
  const [pauseReason, setPauseReason] = useState('');
  const [absentReason, setAbsentReason] = useState('');
  const [addToGeneral, setAddToGeneral] = useState(false);
  const [currentDuration, setCurrentDuration] = useState<string>('');
  const [pauseDuration, setPauseDuration] = useState<string>('0:00');

  const barber = state.barbers.find(b => b.id === selectedBarber);

  // Update current service duration
  useState(() => {
    const interval = setInterval(() => {
      if (barber?.currentClient?.startedAt) {
        setCurrentDuration(formatDuration(barber.currentClient.startedAt));
      }
      if (barber?.status.status === 'paused' && barber?.status.pauseStartTime) {
        const elapsed = Date.now() - barber.status.pauseStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setPauseDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleAddClient = () => {
    if (!clientName.trim()) return;
    
    if (addToGeneral) {
      addClientToGeneralQueue(clientName.trim(), serviceType);
    } else if (selectedBarber) {
      addClientToBarber(selectedBarber, clientName.trim(), serviceType);
    }
    
    setClientName('');
    setServiceType('haircut');
    setShowAddClient(false);
    setAddToGeneral(false);
  };

  const handlePause = () => {
    if (selectedBarber) {
      setPause(selectedBarber, pauseReason || undefined);
      setPauseReason('');
      setShowPauseModal(false);
    }
  };

  // Barber Selection Screen
  if (!selectedBarber) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <Link to="/" className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <h1 className="font-display text-xl text-foreground">Painel do Barbeiro</h1>
              <p className="text-xs text-muted-foreground">Selecione seu perfil</p>
            </div>
            {authenticated && (
              <button
                onClick={() => {
                  logout();
                  window.location.href = '/barber-login';
                }}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="space-y-4">
            {state.barbers.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBarber(b.id)}
                className="w-full bg-card rounded-xl p-5 shadow-card border border-border/50 hover:border-primary/50 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <img 
                    src="/barber.png" 
                    alt={b.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="font-display text-xl text-foreground">{b.name}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {b.queue.length} na fila
                      </span>
                      <span className={`flex items-center gap-1 ${
                        b.status.status === 'busy' ? 'text-accent' : 
                        b.status.status === 'paused' ? 'text-warning' : 'text-success'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-current" />
                        {b.status.status === 'busy' ? 'Ocupado' : 
                         b.status.status === 'paused' ? 'Pausado' : 'Livre'}
                      </span>
                    </div>
                  </div>
                  {b.status.status === 'paused' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBarber(b.id);
                        setShowAbsentModal(true);
                      }}
                      className="px-3 py-2 bg-warning/20 text-warning rounded-lg text-xs hover:bg-warning/30 transition-colors"
                    >
                      Marcar Ausência
                    </button>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Add to General Queue */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <button
              onClick={() => {
                setAddToGeneral(true);
                setShowAddClient(true);
              }}
              className="w-full bg-secondary/50 rounded-xl p-4 border border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground mb-4"
            >
              <UserPlus className="w-5 h-5" />
              <span>Adicionar à Fila Geral</span>
            </button>
            <p className="text-xs text-muted-foreground text-center mb-4">
              {state.generalQueue.clients.length} pessoa(s) na fila geral
            </p>

            {authenticated && (
              <button
                onClick={() => setShowBusinessHours(!showBusinessHours)}
                className="w-full bg-secondary/50 rounded-xl p-4 border border-dashed border-border hover:border-primary/50 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <Clock className="w-5 h-5" />
                <span>Gerenciar Horários</span>
              </button>
            )}
          </div>
        </main>

        {/* Business Hours Modal */}
        {showBusinessHours && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
              <h3 className="font-display text-xl text-foreground mb-4">
                Gerenciar Horários
              </h3>
              
              <div className="space-y-4 mb-6">
                {state.businessHours.map((hour, idx) => {
                  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                  return (
                    <div key={hour.dayOfWeek} className="bg-secondary/30 rounded-lg p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-foreground font-medium">{daysOfWeek[hour.dayOfWeek]}</h4>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hour.isOpen}
                            onChange={(e) => updateBusinessHours(hour.dayOfWeek, e.target.checked, hour.openTime, hour.closeTime)}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <span className="text-sm text-muted-foreground">
                            {hour.isOpen ? 'Aberto' : 'Fechado'}
                          </span>
                        </label>
                      </div>
                      
                      {hour.isOpen && (
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground block mb-1">Abre</label>
                            <input
                              type="time"
                              value={hour.openTime}
                              onChange={(e) => updateBusinessHours(hour.dayOfWeek, true, e.target.value, hour.closeTime)}
                              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-muted-foreground block mb-1">Fecha</label>
                            <input
                              type="time"
                              value={hour.closeTime}
                              onChange={(e) => updateBusinessHours(hour.dayOfWeek, true, hour.openTime, e.target.value)}
                              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={() => setShowBusinessHours(false)}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Salvar Horários
              </button>
            </div>
          </div>
        )}

        {/* Absent Modal */}
        {showAbsentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
              <h3 className="font-display text-xl text-foreground mb-4">
                Marcar como Ausente/Pausa
              </h3>
              
              <input
                type="text"
                value={absentReason}
                onChange={(e) => setAbsentReason(e.target.value)}
                placeholder="Motivo da ausência (ex: Almoço, Erro, Saúde)"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-6"
                autoFocus
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAbsentModal(false);
                    setAbsentReason('');
                    setSelectedBarber(null);
                  }}
                  className="flex-1 py-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedBarber) {
                      setPause(selectedBarber, absentReason || 'Ausente');
                      setAbsentReason('');
                      setShowAbsentModal(false);
                      setSelectedBarber(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-lg bg-warning text-warning-foreground font-medium hover:opacity-90 transition-opacity"
                >
                  Marcar Ausente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        {showAddClient && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
            <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
              <h3 className="font-display text-xl text-foreground mb-4">
                Adicionar à Fila Geral
              </h3>
              
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                autoFocus
              />
              
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setServiceType('haircut')}
                  className={`flex-1 py-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    serviceType === 'haircut' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <img src="/corte.png" alt="Corte" className="w-6 h-6" />
                  Corte
                </button>
                <button
                  onClick={() => setServiceType('beard')}
                  className={`flex-1 py-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    serviceType === 'beard' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <img src="/barba.png" alt="Barba" className="w-6 h-6" />
                  Barba
                </button>
                <button
                  onClick={() => setServiceType('haircut-beard')}
                  className={`flex-1 py-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    serviceType === 'haircut-beard' 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  <img src="/corteebarba.png" alt="Corte + Barba" className="w-6 h-6" />
                  Corte + Barba
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAddClient(false);
                    setAddToGeneral(false);
                    setClientName('');
                  }}
                  className="flex-1 py-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddClient}
                  disabled={!clientName.trim()}
                  className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Barber Dashboard
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button 
            onClick={() => setSelectedBarber(null)}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <img 
              src="/barber.png" 
              alt={barber?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className="font-display text-lg text-foreground">{barber?.name}</h1>
              <p className="text-xs text-muted-foreground">
                {barber?.queue.length} na fila • {barber?.completedServices} atendidos hoje
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Current Status */}
        {barber?.status.status === 'paused' && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pause className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-foreground font-medium">Em pausa</p>
                  {barber.status.pauseReason && (
                    <p className="text-sm text-muted-foreground">{barber.status.pauseReason}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => resumeWork(selectedBarber)}
                className="bg-success text-success-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Voltar
              </button>
            </div>
          </div>
        )}

        {/* Current Client */}
        {barber?.currentClient && (
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 text-accent mb-3">
              <Scissors className="w-5 h-5" />
              <span className="font-medium">Atendendo agora</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-display text-foreground">{barber.currentClient.name}</p>
                <p className="text-muted-foreground text-sm">
                  {barber.currentClient.serviceType === 'haircut' ? 'Corte' : 'Corte + Barba'}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono text-lg text-foreground">
                    {barber.currentClient.startedAt ? formatDuration(barber.currentClient.startedAt) : '0:00'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => finishService(selectedBarber)}
              className="w-full mt-4 bg-success text-success-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Finalizar Atendimento
            </button>
          </div>
        )}

        {/* Queue Section */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-foreground">Minha Fila</h2>
            <span className="text-sm text-muted-foreground">{barber?.queue.length} pessoas</span>
          </div>

          {barber?.queue.length === 0 ? (
            <div className="bg-card rounded-xl p-6 border border-border/50 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Nenhum cliente na fila</p>
            </div>
          ) : (
            <div className="space-y-3">
              {barber?.queue.map((client, idx) => (
                <div key={client.id} className="bg-card rounded-xl p-4 border border-border/50 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{client.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {client.serviceType === 'haircut' ? '✂️ Corte' : '✂️🧔 Corte + Barba'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!barber?.currentClient && idx === 0 && barber.status.status !== 'paused' && (
                      <button
                        onClick={() => startService(selectedBarber, client.id)}
                        className="p-2 bg-success/20 text-success rounded-lg hover:bg-success/30 transition-colors"
                        title="Iniciar atendimento"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromQueue(selectedBarber, client.id)}
                      className="p-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                      title="Remover da fila"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* General Queue */}
        {state.generalQueue.clients.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg text-foreground">Fila Geral</h2>
              <span className="text-sm text-muted-foreground">{state.generalQueue.clients.length} pessoas</span>
            </div>

            <div className="space-y-3">
              {state.generalQueue.clients.map((client, idx) => (
                <div key={client.id} className="bg-card rounded-xl p-4 border border-primary/20 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-foreground font-medium">{client.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {client.serviceType === 'haircut' ? '✂️ Corte' : '✂️🧔 Corte + Barba'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!barber?.currentClient && barber?.status.status !== 'paused' && (
                      <button
                        onClick={() => pullFromGeneralQueue(selectedBarber, client.id)}
                        className="p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                        title="Puxar para minha fila"
                      >
                        <UserCheck className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromGeneralQueue(client.id)}
                      className="p-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                      title="Remover da fila"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Actions */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/50 px-4 py-4">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => setShowAddClient(true)}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Adicionar Cliente
          </button>
          {barber?.status.status !== 'paused' && (
            <button
              onClick={() => setShowPauseModal(true)}
              className="px-4 py-3 bg-warning/20 text-warning rounded-lg hover:bg-warning/30 transition-colors"
            >
              <Pause className="w-5 h-5" />
            </button>
          )}
        </div>
      </footer>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <h3 className="font-display text-xl text-foreground mb-4">
              Adicionar Cliente
            </h3>
            
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setServiceType('haircut')}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  serviceType === 'haircut' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                ✂️ Corte
              </button>
              <button
                onClick={() => setServiceType('haircut-beard')}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  serviceType === 'haircut-beard' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary border-border text-muted-foreground hover:border-primary/50'
                }`}
              >
                ✂️🧔 Corte + Barba
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddClient(false);
                  setClientName('');
                }}
                className="flex-1 py-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddClient}
                disabled={!clientName.trim()}
className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-card w-full max-w-lg rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
            <h3 className="font-display text-xl text-foreground mb-4">
              Entrar em Pausa
            </h3>
            
            <input
              type="text"
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="Motivo da pausa (opcional)"
              className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary mb-6"
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPauseModal(false);
                  setPauseReason('');
                }}
                className="flex-1 py-3 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePause}
                className="flex-1 py-3 rounded-lg bg-warning text-warning-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Pausar Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
