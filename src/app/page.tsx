
import { getEventos } from '@/lib/firebase';
import type { Evento } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, MapPin } from 'lucide-react';

export default async function AgendaPage() {
  const eventos = await getEventos();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-primary">Agenda de Eventos</h1>
      <p className="text-muted-foreground">Futebol feminino: força e cultura.</p>
      {eventos.length === 0 ? (
        <p>Nenhum evento agendado no momento.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {eventos.map((evento: Evento) => (
            <Card key={evento.id} className="shadow-md rounded-lg overflow-hidden">
              <CardHeader>
                <CardTitle className="text-primary text-xl">{evento.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-foreground">
                <div className="flex items-center gap-2">
                   <CalendarDays className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">{evento.data}</span>
                </div>
                 <div className="flex items-center gap-2">
                   <Clock className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">{evento.horario}</span>
                 </div>
                <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm">{evento.local}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Add revalidation if needed to refresh data periodically
export const revalidate = 60; // Revalidate every 60 seconds
