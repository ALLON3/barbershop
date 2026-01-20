import { useEffect, useState } from 'react';
import { useBarbershop } from '@/hooks/useBarbershop';
import { BarberCard } from '@/components/BarberCard';
import { StatsBar } from '@/components/StatsBar';
import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClientView = () => {
  const { state, getAverageTime, getEstimatedWait, getOverallAverageTime, resumeWork } = useBarbershop();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastHourState, setLastHourState] = useState<boolean | null>(null);

  // Update time every second for real-time feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentBusinessHours = () => {
    const dayOfWeek = currentTime.getDay();
    return state.businessHours.find(h => h.dayOfWeek === dayOfWeek);
  };

  const isBusinessHoursOpen = () => {
    const businessHours = getCurrentBusinessHours();
    
    // Se o dia não está marcado como aberto ou não tem horários definidos
    if (!businessHours?.isOpen || !businessHours?.openTime || !businessHours?.closeTime) {
      return false;
    }

    // Verificar se a hora atual está dentro do horário de funcionamento
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    try {
      const [openHours, openMinutes] = businessHours.openTime.split(':').map(Number);
      const [closeHours, closeMinutes] = businessHours.closeTime.split(':').map(Number);

      const openTimeInMinutes = openHours * 60 + openMinutes;
      const closeTimeInMinutes = closeHours * 60 + closeMinutes;

      return currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes;
    } catch (e) {
      console.error('Erro ao processar horários:', e);
      return false;
    }
  };

  const businessHours = getCurrentBusinessHours();
  const isOpen = isBusinessHoursOpen();

  // Auto-resume barbers when store opens
  useEffect(() => {
    if (lastHourState === null) {
      setLastHourState(isOpen || false);
      return;
    }

    // Se a loja estava fechada e agora abriu
    if (!lastHourState && isOpen) {
      state.barbers.forEach(barber => {
        if (barber.status.status === 'paused') {
          resumeWork(barber.id);
        }
      });
    }

    setLastHourState(isOpen || false);
  }, [isOpen, state.barbers, resumeWork, lastHourState]);

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/background-login.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay desfocado escuro */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/40 pointer-events-none" />
      
      {/* Conteúdo */}
      <div className="relative z-10">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl border-b border-border/50 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <img src="/logo.jpeg" alt="Logo" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground">Barbershop do Gui</h1>
              <p className="text-xs text-muted-foreground">Av. Presidente João Goulart, 928</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Business Hours */}
        <section className="mb-6">
          <div className={`rounded-xl p-4 border ${
            isOpen 
              ? 'bg-success/10 border-success/30' 
              : 'bg-destructive/10 border-destructive/30'
          }`}>
            <div className="flex items-center gap-3">
              <Clock className={`w-5 h-5 ${isOpen ? 'text-success' : 'text-destructive'}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${isOpen ? 'text-success' : 'text-destructive'}`}>
                  {isOpen ? 'Aberto agora' : 'Fechado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {businessHours?.isOpen 
                    ? `${businessHours.openTime} - ${businessHours.closeTime}` 
                    : 'Terça a Sábado: 10:00 - 20:00'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* General Queue + Stats Combined */}
        <section className="mb-6">
          <h2 className="font-display text-lg text-foreground mb-4">Fila</h2>
          <div className="bg-black/40 backdrop-blur-xl rounded-xl p-5 shadow-card border border-white/20">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col items-center text-center">
                <img src="/tesouratempo.png" alt="Aguardando" className="w-7 h-7 mb-2 brightness-0 invert" />
                <p className="text-xs text-muted-foreground mb-2">Aguardando</p>
                <p className="text-3xl font-bold text-foreground">{state.generalQueue.clients.length}</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <img src="/atendendoicon.png" alt="Sendo atendido" className="w-7 h-7 mb-2 brightness-0 invert" />
                <p className="text-xs text-muted-foreground mb-2">Sendo atendidos</p>
                <p className="text-3xl font-bold text-primary">
                  {state.barbers.filter(b => b.currentClient).length}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3">Tempo médio de espera: <span className="text-primary font-medium">{Math.round(getOverallAverageTime() / 60000)} min</span></p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="mb-6">
          <StatsBar 
            barbers={state.barbers}
            generalQueueCount={state.generalQueue.clients.length}
            overallAverageTime={getOverallAverageTime()}
          />
        </section>

        {/* Barbers Grid */}
        <section className="mb-6">
          <h2 className="font-display text-lg text-foreground mb-4">Barbeiros</h2>
          <div className="space-y-4">
            {state.barbers
              .filter(barber => {
                // Se loja está fechada, mostrar apenas se tem cliente sendo atendido
                if (!isOpen && barber.status.status === 'available') return false;
                return true;
              })
              .map(barber => (
                <BarberCard
                  key={barber.id}
                  barber={barber}
                  averageTime={getAverageTime(barber)}
                  estimatedWait={getEstimatedWait(barber)}
                />
              ))}
          </div>
        </section>
      </main>

      {/* Admin Access Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-border/50 px-4 py-4 z-20">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://www.instagram.com/barbershop_dogui?igsh=ajJ2Y3lweWkwbDEw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              📲 Instagram
            </a>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/admin"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Área do Barbeiro →
            </Link>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default ClientView;
