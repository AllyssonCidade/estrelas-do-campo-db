
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllEventosCMS, addEvento, updateEvento, deleteEvento } from '@/lib/firebase';
import type { Evento } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, parse } from 'date-fns';
import { CalendarIcon, PlusCircle, Edit, Trash2, LogOut, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


// --- Admin Login Component ---
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(password);
    if (success) {
      onLoginSuccess();
    } else {
      setError('Senha incorreta.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-primary">Acesso Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Digite a senha"
                aria-describedby={error ? "password-error" : undefined}
              />
               {error && <p id="password-error" className="text-sm text-destructive">{error}</p>}
            </div>
             <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// --- Event Form Component ---
type EventFormProps = {
  evento?: Evento | null; // Pass existing event for editing
  onSave: (eventoData: Omit<Evento, 'id'> | Evento) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
};

function EventForm({ evento, onSave, onCancel, isSaving }: EventFormProps) {
  const [titulo, setTitulo] = React.useState(evento?.titulo || '');
  const [data, setData] = React.useState<Date | undefined>(
    evento?.data ? parse(evento.data, 'dd/MM/yyyy', new Date()) : undefined
  );
  const [horario, setHorario] = React.useState(evento?.horario || '');
  const [local, setLocal] = React.useState(evento?.local || '');
  const [formError, setFormError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!titulo || !data || !horario || !local) {
      setFormError('Todos os campos são obrigatórios.');
      return;
    }
    if (titulo.length > 100) {
        setFormError('Título não pode exceder 100 caracteres.');
        return;
    }
    if (local.length > 100) {
        setFormError('Local não pode exceder 100 caracteres.');
        return;
    }
     // Simple time format validation (HH:MM)
    if (!/^\d{2}:\d{2}$/.test(horario)) {
      setFormError('Formato de horário inválido. Use HH:MM (ex: 16:00).');
      return;
    }

    const formattedDate = format(data, 'dd/MM/yyyy');
    // Basic date format check (simple)
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formattedDate)) {
      setFormError('Formato de data inválido. Use DD/MM/YYYY.');
      return;
    }

    const eventoData: Omit<Evento, 'id'> | Evento = {
      ...(evento && { id: evento.id }), // Include id if editing
      titulo,
      data: formattedDate,
      horario,
      local,
    };

    await onSave(eventoData);
  };

  return (
    <Card>
       <CardHeader>
        <CardTitle>{evento ? 'Editar Evento' : 'Adicionar Novo Evento'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
         <CardContent className="space-y-4">
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="space-y-1">
                <Label htmlFor="titulo">Título</Label>
                <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={100} required aria-required="true" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <Label htmlFor="data">Data (DD/MM/YYYY)</Label>
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!data && "text-muted-foreground"}`}
                            id="data"
                            aria-required="true"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {data ? format(data, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={data}
                            onSelect={setData}
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                 </div>
                 <div className="space-y-1">
                    <Label htmlFor="horario">Horário (HH:MM)</Label>
                    <Input id="horario" value={horario} onChange={(e) => setHorario(e.target.value)} placeholder="16:00" pattern="\d{2}:\d{2}" required aria-required="true" />
                </div>
            </div>
             <div className="space-y-1">
                <Label htmlFor="local">Local</Label>
                <Input id="local" value={local} onChange={(e) => setLocal(e.target.value)} maxLength={100} required aria-required="true" />
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
             <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {evento ? 'Salvar Alterações' : 'Adicionar Evento'}
            </Button>
        </CardFooter>
      </form>
    </Card>
  );
}


// --- Admin Dashboard Component ---
function AdminDashboard() {
  const { logout } = useAuth();
  const router = useRouter();
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEvento, setEditingEvento] = React.useState<Evento | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();

  const fetchEventos = async () => {
    setLoading(true);
    try {
      // Fetching up to 20 events, ordered by date for CMS display
      // Using getAllEventosCMS which already fetches all and sorts, limit can be applied here if needed
      // However, for CMS it's often better to see all events.
      const data = await getAllEventosCMS();
      setEventos(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message || "Não foi possível carregar os eventos." });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEventos();
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/'); // Redirect to home after logout
  };

  const handleAddNew = () => {
    setEditingEvento(null);
    setIsFormOpen(true);
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvento(id);
      toast({ title: "Sucesso", description: "Evento deletado." });
      fetchEventos(); // Refresh list
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro", description: error.message || "Falha ao deletar evento." });
    }
  };

 const handleSave = async (eventoData: Omit<Evento, 'id'> | Evento) => {
    setIsSaving(true);
    try {
      if ('id' in eventoData && eventoData.id) { // Check if it's an update (has id)
        await updateEvento(eventoData.id, {
          titulo: eventoData.titulo,
          data: eventoData.data,
          horario: eventoData.horario,
          local: eventoData.local,
        });
        toast({ title: "Sucesso", description: "Evento atualizado." });
      } else { // It's a new event
        await addEvento(eventoData as Omit<Evento, 'id'>);
        toast({ title: "Sucesso", description: "Evento adicionado." });
      }
      setIsFormOpen(false);
      setEditingEvento(null);
      fetchEventos(); // Refresh list
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message || "Não foi possível salvar o evento." });
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
       <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Gerenciar Eventos</h1>
         <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="mr-2 h-4 w-4" /> Sair
         </Button>
      </div>

      {isFormOpen ? (
        <EventForm
          evento={editingEvento}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
          isSaving={isSaving}
        />
      ) : (
         <Button onClick={handleAddNew} className="mb-6 bg-primary hover:bg-primary/90" aria-label="Adicionar novo evento">
           <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Evento
        </Button>
      )}

      <div className="mt-8 space-y-4">
         <h2 className="text-xl font-semibold">Eventos Cadastrados</h2>
        {loading ? (
             <div className="space-y-3">
                {/* Replace Skeleton with styled div */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-24 w-full rounded-lg bg-muted/50 animate-pulse p-4 flex justify-between items-center">
                        <div className="space-y-2 flex-grow mr-4">
                            <div className="h-5 w-3/4 bg-muted rounded"></div>
                            <div className="h-4 w-1/2 bg-muted rounded"></div>
                            <div className="h-4 w-1/3 bg-muted rounded"></div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-9 w-9 bg-muted rounded"></div>
                            <div className="h-9 w-9 bg-muted rounded"></div>
                        </div>
                    </div>
                ))}
             </div>
        ) : eventos.length === 0 ? (
          <p className="text-muted-foreground">Nenhum evento cadastrado.</p>
        ) : (
          eventos.map((evento) => (
            <Card key={evento.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4 bg-card border shadow-sm">
              <div className="flex-grow space-y-1">
                 <p className="font-semibold text-primary">{evento.titulo}</p>
                 <p className="text-sm text-muted-foreground">
                   <span className="inline-flex items-center mr-4"><CalendarIcon className="h-3 w-3 mr-1 text-muted-foreground"/> {evento.data}</span>
                   <span className="inline-flex items-center">{/* <Clock className="h-3 w-3 mr-1"/> */} {evento.horario}</span>
                 </p>
                 <p className="text-sm text-muted-foreground">
                    <span className="inline-flex items-center">{/* <MapPin className="h-3 w-3 mr-1"/> */} {evento.local}</span>
                 </p>
              </div>
               <div className="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(evento)} aria-label={`Editar evento ${evento.titulo}`}>
                    <Edit className="h-4 w-4" />
                 </Button>

                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                         <Button variant="destructive" size="sm" aria-label={`Excluir evento ${evento.titulo}`}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o evento "{evento.titulo}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(evento.id)} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


// --- Main Admin Page Component ---
export default function AdminPage() {
  const { isAuthenticated, loading } = useAuth();
  const [showLogin, setShowLogin] = React.useState(true); // Show login initially

  React.useEffect(() => {
    // If authenticated, hide login. If not authenticated after loading, show login.
    if (isAuthenticated) {
      setShowLogin(false);
    } else if (!loading) { // Ensure loading is finished before deciding
        setShowLogin(true);
    }
  }, [isAuthenticated, loading]);


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (showLogin) {
     // Pass callback to hide login on success
    return <AdminLogin onLoginSuccess={() => setShowLogin(false)} />;
  }

  // If authenticated and not showing login, show dashboard
  return <AdminDashboard />;
}

    