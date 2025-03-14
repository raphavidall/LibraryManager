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
              <div className="flex items-center text-xl font-bold text-primary cursor-pointer">
                Library System
              </div>
            </Link>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link href="/books">
                <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
                  Books
                </div>
              </Link>
              {user?.role === "admin" && (
                <Link href="/users">
                  <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
                    Users
                  </div>
                </Link>
              )}
              <Link href="/loans">
                <div className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
                  Loans
                </div>
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