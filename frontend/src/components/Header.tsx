import { ShoppingCart, Heart, Phone, User, Search, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, isAuthenticated, signout } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      signout();
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
      <div className="border-b bg-background py-3">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="text-center cursor-pointer" onClick={() => navigate("/")}>
            <h1 className="text-2xl font-bold tracking-tight">
              LAW BOOK <span className="text-primary">SHOP</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <span className="text-xs text-muted-foreground hidden md:block">{user?.email}</span>
            )}
            <Button variant="ghost" size="icon" onClick={handleUserClick}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            {isAuthenticated ? (
              <Button variant="destructive" size="sm" onClick={handleAuthClick}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            ) : (
              <Button variant="destructive" size="sm" onClick={handleAuthClick}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-8 py-4 text-sm font-medium">
            <li><a href="#" className="hover:underline">Home</a></li>
            <li><a href="#" className="hover:underline">Categories</a></li>
            <li><a href="#" className="hover:underline">Brands</a></li>
            <li><a href="#" className="hover:underline">Best Sellers</a></li>
            <li><a href="#" className="hover:underline">Pages</a></li>
          </ul>
        </div>
      </nav>
    </>
  );
};

export default Header;
