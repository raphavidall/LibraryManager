import { NavBar } from "@/components/layout/nav-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Book, Loan, User } from "@shared/schema";
import { Loader2, Book as BookIcon, Users, Clock } from "lucide-react";

export default function Dashboard() {
  const { data: books, isLoading: loadingBooks } = useQuery<Book[]>({ 
    queryKey: ["/api/books"]
  });
  
  const { data: loans, isLoading: loadingLoans } = useQuery<Loan[]>({ 
    queryKey: ["/api/loans"]
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({ 
    queryKey: ["/api/users"]
  });

  const isLoading = loadingBooks || loadingLoans || loadingUsers;

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const activeLoans = loans?.filter(loan => !loan.returnDate).length || 0;
  const totalBooks = books?.length || 0;
  const totalUsers = users?.length || 0;

  return (
    <div className="min-h-screen">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Books</CardTitle>
              <BookIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBooks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeLoans}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
