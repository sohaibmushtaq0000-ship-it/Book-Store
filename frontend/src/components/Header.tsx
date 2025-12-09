import { ShoppingCart, Heart, Phone, User, Search, LogOut, BookOpen } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signout();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  const handleUserClick = () => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin/dashboard");
    } else if (!isAuthenticated) {
      navigate("/auth");
    }
  };

  return (
    <>
      {/* Top Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 sticky top-0 z-50">
        <div className="container-custom flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ShoppingCart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Phone className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center cursor-pointer flex items-center gap-2" onClick={() => navigate("/")}>
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight font-serif">
              LAW <span className="text-primary">BOOKSHOP</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
            )}
            <Button variant="ghost" size="icon" onClick={handleUserClick} className="rounded-full">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
            {isAuthenticated ? (
              <Button variant="destructive" size="sm" onClick={handleAuthClick} className="rounded-full">
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={handleAuthClick} className="btn-primary rounded-full">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground sticky top-14 z-40 shadow-sm">
        <div className="container-custom">
          <ul className="flex items-center justify-center gap-8 py-4 text-sm font-medium">
            <li><a href="/" className="hover:opacity-80 transition-opacity">Home</a></li>
            <li><a href="/categories" className="hover:opacity-80 transition-opacity">Categories</a></li>
            <li><a href="/judgments" className="hover:opacity-80 transition-opacity">Judgments</a></li>
            <li><a href="/authors" className="hover:opacity-80 transition-opacity">Authors</a></li>
            <li><a href="/bestsellers" className="hover:opacity-80 transition-opacity">Best Sellers</a></li>
            <li><a href="/new-releases" className="hover:opacity-80 transition-opacity">New Releases</a></li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;