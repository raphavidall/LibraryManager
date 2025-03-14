import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function NavBar() {
  const { user, logoutMutation } = useAuth();
  
  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/">
              <a className="flex items-center text-xl font-bold text-primary">
                Library System
              </a>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link href="/books">
                <a className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Books
                </a>
              </Link>
              {user?.role === "admin" && (
                <Link href="/users">
                  <a className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                    Users
                  </a>
                </Link>
              )}
              <Link href="/loans">
                <a className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                  Loans
                </a>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <Button 
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
