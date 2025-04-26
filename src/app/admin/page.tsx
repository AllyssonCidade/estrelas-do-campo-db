
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/context/AuthContext'; // Keep AuthContext for password management
// Removed Firestore imports: import { getAllEventosCMS, addEvento, updateEvento, deleteEvento } from '@/lib/firebase';
import { getAllEventosCMSApi, addEventoApi, updateEventoApi, deleteEventoApi } from '@/lib/api'; // Import API functions
import type { Evento } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
// import { format, parse } from 'date-fns'; // Keep date-fns if needed for date picker display
import { CalendarIcon, PlusCircle, Edit, Trash2, LogOut, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, parse, isValid } from 'date-fns';


// --- Admin Login Component ---
// Replaces AuthContext logic for simple password check
function AdminLogin({ onLoginSuccess }: { onLoginSuccess: (password: string) => void }) {
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  // Use environment variable for password check
  const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "estrelas123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // Simple password check
    if (password === correctPassword) {
       // Store password temporarily in parent state for API calls
       // **Security Note:** This is basic protection. For production, use proper auth.
       onLoginSuccess(password);
    } else {
      setError('Senha incorreta.');
    }
    setLoading(false); // Stop loading indicator
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
     // Attempt to parse the string date from the event object
    evento?.data ? parse(evento.data, 'dd/MM/yyyy', new Date()) : undefined
  );
  const [horario, setHorario] = React.useState(evento?.horario || '');
  const [local, setLocal] = React.useState(evento?.local || '');
  const [formError, setFormError] = React.useState('');

  React.useEffect(() => {
      // Update form fields if the 'evento' prop changes (when editing)
      setTitulo(evento?.titulo || '');
      setData(evento?.data ? parse(evento.data, 'dd/MM/yyyy', new Date()) : undefined);
      setHorario(evento?.horario || '');
      setLocal(evento?.local || '');
      setFormError(''); // Clear errors when event changes
  }, [evento]);


    // Helper function to parse DD/MM/YYYY string to Date object robustly
    const parseDateString = (dateStr: string): Date | null => {
      try {
        if (typeof dateStr !== 'string' || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            return null;
        }
        const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
        // Check if the parsed date is valid and components match
        if (!isValid(parsedDate) || format(parsedDate, 'dd/MM/yyyy') !== dateStr) {
            return null;
        }
        return parsedDate;
      } catch (e) {
        return null;
      }
    };

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

    // Format date back to DD/MM/YYYY string for API
    const formattedDate = format(data, 'dd/MM/yyyy');
    // Basic date format check (redundant but safe)
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formattedDate) || !parseDateString(formattedDate)) {
      setFormError('Formato de data inválido. Use DD/MM/YYYY.');
      return;
    }

    const eventoData: Omit<Evento, 'id'> | Evento = {
      ...(evento && { id: evento.id }), // Include id if editing
      titulo,
      data: formattedDate, // Send as string
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
                            {/* Ensure data is a Date object before formatting */}
                            {data instanceof Date && isValid(data) ? format(data, "dd/MM/yyyy") : <span>Escolha uma data</span>}
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
function AdminDashboard({ adminPassword, onLogout }: { adminPassword: string, onLogout: () => void }) {
  const router = useRouter();
  const [eventos, setEventos] = React.useState<Evento[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEvento, setEditingEvento] = React.useState<Evento | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null); // Track which item is being deleted
  const { toast } = useToast();

  const fetchEventos = async () => {
    setLoading(true);
    try {
      // Fetching all events for CMS, sorted desc by API
      const data = await getAllEventosCMSApi();
      setEventos(data);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Carregar", description: error.message || "Não foi possível carregar os eventos da API." });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEventos();
  }, []);

  const handleLogout = () => {
    onLogout(); // Call the logout handler passed from parent
    router.push('/'); // Redirect to home after logout
  };

  const handleAddNew = () => {
    setEditingEvento(null); // Ensure editingEvento is null for adding
    setIsFormOpen(true);
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    setIsFormOpen(true);
  };

 const handleDelete = async (id: string) => {
    setDeletingId(id); // Show loader on the specific delete button
    try {
      await deleteEventoApi(id, adminPassword); // Pass password
      toast({ title: "Sucesso", description: "Evento deletado." });
      fetchEventos(); // Refresh list
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erro ao Deletar", description: error.message || "Falha ao deletar evento via API." });
    } finally {
      setDeletingId(null); // Hide loader
    }
  };


 const handleSave = async (eventoData: Omit<Evento, 'id'> | Evento) => {
    setIsSaving(true);
    try {
      const dataToSend: Omit<Evento, 'id'> = {
          titulo: eventoData.titulo,
          data: eventoData.data,
          horario: eventoData.horario,
          local: eventoData.local,
      };

      if ('id' in eventoData && eventoData.id) { // Check if it's an update (has id)
        await updateEventoApi(eventoData.id, dataToSend, adminPassword); // Pass password
        toast({ title: "Sucesso", description: "Evento atualizado." });
      } else { // It's a new event
        await addEventoApi(dataToSend, adminPassword); // Pass password
        toast({ title: "Sucesso", description: "Evento adicionado." });
      }
      setIsFormOpen(false);
      setEditingEvento(null);
      fetchEventos(); // Refresh list
    } catch (error: any) {
       toast({ variant: "destructive", title: "Erro ao Salvar", description: error.message || "Não foi possível salvar o evento via API." });
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
          onCancel={() => { setIsFormOpen(false); setEditingEvento(null); }} // Reset editing state on cancel
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
                    // Use simple div with Tailwind for placeholder
                    <div key={i} className="h-24 w-full rounded-lg bg-muted/50 animate-pulse p-4 flex justify-between items-center border">
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
                         <Button variant="destructive" size="sm" aria-label={`Excluir evento ${evento.titulo}`} disabled={deletingId === evento.id}>
                           {deletingId === evento.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
                        <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleDelete(evento.id)}
                            className="bg-destructive hover:bg-destructive/90"
                            disabled={!!deletingId} // Disable while deleting
                        >
                            {deletingId === evento.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
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
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false); // General loading for the page logic

  // Callback for successful login
  const handleLoginSuccess = (password: string) => {
      setAdminPassword(password);
      setIsAuthenticated(true);
       // Optional: Store auth state in session storage if needed for refresh persistence
      sessionStorage.setItem('estrelas_admin_loggedin', 'true');
      sessionStorage.setItem('estrelas_admin_pwd', password); // Store password (use more secure method in production)
  };

   // Logout handler
  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword(null);
    sessionStorage.removeItem('estrelas_admin_loggedin');
    sessionStorage.removeItem('estrelas_admin_pwd');
  };

   // Check session storage on mount
   React.useEffect(() => {
      setLoading(true);
      const loggedIn = sessionStorage.getItem('estrelas_admin_loggedin') === 'true';
      const storedPassword = sessionStorage.getItem('estrelas_admin_pwd');
      if (loggedIn && storedPassword) {
          setIsAuthenticated(true);
          setAdminPassword(storedPassword);
      }
      setLoading(false);
   }, []);


  if (loading) {
      // Basic full page loader while checking session
      return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!isAuthenticated || !adminPassword) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  // If authenticated, show dashboard
  return <AdminDashboard adminPassword={adminPassword} onLogout={handleLogout} />;
}
