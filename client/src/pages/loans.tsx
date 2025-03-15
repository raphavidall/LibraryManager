
import { NavBar } from "@/components/layout/nav-bar";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loan, Book, User, insertLoanSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LOAN_DURATIONS = [
  { value: "3", label: "3 dias" },
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
];

export default function Loans() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("7");

  const { data: loans, isLoading: loansLoading } = useQuery<Loan[]>({
    queryKey: ["/api/loans"],
  });

  const { data: books } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const form = useForm({
    resolver: zodResolver(insertLoanSchema),
    defaultValues: {
      userId: user?.id,
      bookId: undefined,
      loanDate: new Date().toISOString(),
      dueDate: addDays(new Date(), 7).toISOString(),
      returnDate: null
    }
  });

  const createMutation = useMutation({
      mutationFn: async (data: any) => {
        const res = await apiRequest("POST", "/api/loans", {
          userId: data.userId ? parseInt(data.userId) : user?.id,
          bookId: data.bookId ? Number(data.bookId) : undefined, // Garante que seja número
          loanDate: data.loanDate,
          dueDate: data.dueDate,
          returnDate: null
        });
        return await res.json();
      },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Empréstimo criado com sucesso" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Erro ao criar empréstimo",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const returnMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PUT", `/api/loans/${id}`, {
        returnDate: new Date().toISOString(),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans"] });
      toast({ title: "Livro devolvido com sucesso" });
    },
  });

  const getBookTitle = (bookId: number | null) => {
    if (!bookId) return "Livro Desconhecido";
    return books?.find((b) => b.id === bookId)?.title || "Livro Desconhecido";
  };

  const getUserName = (userId: number | null) => {
    if (!userId) return "Usuário Desconhecido";
    return users?.find((u) => u.id === userId)?.name || "Usuário Desconhecido";
  };

  const handleDurationChange = (value: string) => {
    setSelectedDuration(value);
    form.setValue("dueDate", addDays(new Date(), parseInt(value)).toISOString());
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Empréstimo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Empréstimo</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
                  {user?.role === "admin" && (
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um usuário" />
                              </SelectTrigger>
                              <SelectContent>
                                {users?.map((user) => (
                                  <SelectItem key={user.id} value={user.id.toString()}>
                                    {user.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="bookId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Livro</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))} // Converte para número
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um livro" />
                            </SelectTrigger>
                            <SelectContent>
                              {books?.map((book) => (
                                <SelectItem key={book.id} value={book.id.toString()}>
                                  {book.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Duração do Empréstimo</FormLabel>
                    <Select value={selectedDuration} onValueChange={handleDurationChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOAN_DURATIONS.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Empréstimo
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {loansLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livro</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Data do Empréstimo</TableHead>
                <TableHead>Previsão de Entrega</TableHead>
                <TableHead>Data de Devolução</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans?.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{getBookTitle(loan.bookId)}</TableCell>
                  <TableCell>{getUserName(loan.userId)}</TableCell>
                  <TableCell>{format(new Date(loan.loanDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{format(new Date(loan.dueDate), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {loan.returnDate ? format(new Date(loan.returnDate), "dd/MM/yyyy") : "-"}
                  </TableCell>
                  <TableCell>
                    {!loan.returnDate && (user?.role === "admin" || user?.id === loan.userId) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => returnMutation.mutate(loan.id)}
                        disabled={returnMutation.isPending}
                      >
                        {returnMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Devolver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
