// layouts/SuperAdminLayout.tsx
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useAuth as useAuthMutation } from "@/hooks/useAuth";

import {
  BookOpen,
  LogOut,
  LayoutDashboard,
  Upload,
  ShoppingCart,
  Book,
  User,
  ShieldCheck,
  Gavel,
  Users
} from "lucide-react";

import { cn } from "@/lib/utils";

const SuperAdminLayout = () => {
  const { user } = useAuth();
  const { logout } = useAuthMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const primaryColor = "#E74C3C";

  const navItems = [
    { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: "Upload Book", href: "/superadmin/upload", icon: Upload },
    { name: "Upload Judgment", href: "/superadmin/upload-judgment", icon: Gavel },
    { name: "Book Shop", href: "/superadmin/shop", icon: ShoppingCart },
    { name: "Book List", href: "/superadmin/books", icon: Book },
    { name: "Approve Books", href: "/superadmin/approve", icon: ShieldCheck },
    { name: "User Management", href: "/superadmin/users", icon: Users },
    { name: "Profile", href: "/superadmin/profile", icon: User },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar - Glass morphism with slide in */}
      <div className="w-64 bg-red-100 backdrop-blur-lg border-r border-white/20 fixed h-full shadow-2xl transform transition-all duration-1000 ease-out hover:shadow-2xl hover:shadow-red-200/50">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/30 to-white opacity-60 animate-gradient-x" />
        
        <div className="relative p-4 border-b border-white/30">
          <Link 
            to="/superadmin/dashboard" 
            className="flex items-center gap-2 transition-all duration-700 hover:skew-x-3 hover:scale-105 group relative"
          >
            <div className="relative">
              <BookOpen 
                className="h-7 w-7 transition-all duration-500 group-hover:rotate-y-180 group-hover:scale-125 z-10 relative" 
                style={{ color: primaryColor }} 
              />
              <div className="absolute inset-0 bg-red-500 rounded-full blur-sm group-hover:blur-md transition-all duration-500 opacity-0 group-hover:opacity-30 animate-pulse" />
            </div>
            <div className="overflow-hidden">
              <div 
                className="font-bold text-lg bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent transition-all duration-500 group-hover:tracking-widest"
              >
                Super Admin
              </div>
              <div className="text-xs text-gray-600 group-hover:text-gray-800 transition-all duration-500 group-hover:translate-x-2">
                Full System Access
              </div>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-3 relative ">
          {navItems.map((item, index) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-500 relative overflow-hidden group border border-transparent",
                  active 
                    ? "text-white shadow-2xl scale-105 ring-2 ring-white/50 backdrop-blur-sm" 
                    : "hover:scale-105 hover:shadow-xl hover:border-white/50 hover:bg-white/60 backdrop-blur-sm"
                )}
                style={{
                  background: active 
                    ? `linear-gradient(135deg, ${primaryColor}, #C0392B)` 
                    : "transparent",
                  transform: `translateX(${active ? '8px' : '0'})`,
                  animationDelay: `${index * 150}ms`
                }}
              >
                {/* Magnetic hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                {/* Floating dots background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute w-1 h-1 bg-red-500 rounded-full top-2 left-4 animate-bounce" style={{ animationDelay: `${index * 200}ms` }} />
                  <div className="absolute w-1 h-1 bg-red-500 rounded-full bottom-2 right-4 animate-bounce" style={{ animationDelay: `${index * 200 + 300}ms` }} />
                </div>

                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-500 z-10 relative",
                    active 
                      ? "animate-wiggle" 
                      : "group-hover:scale-125 group-hover:rotate-12 group-hover:animate-bounce"
                  )}
                  style={{
                    color: active ? "white" : primaryColor,
                    filter: active ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))" : "none"
                  }}
                />
                
                <span 
                  className={cn(
                    "z-10 relative transition-all duration-500",
                    active 
                      ? "font-black drop-shadow-sm" 
                      : "group-hover:font-bold group-hover:tracking-wider"
                  )}
                  style={{
                    textShadow: active ? "0 2px 4px rgba(0,0,0,0.3)" : "none"
                  }}
                >
                  {item.name}
                </span>
                
                {/* Active state orb */}
                {active && (
                  <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-3 h-3 bg-white rounded-full shadow-lg animate-ping" />
                    <div className="w-3 h-3 bg-white rounded-full absolute top-0" />
                  </div>
                )}

                {/* Hover trail effect */}
                <div className="absolute -left-2 top-0 w-1 h-0 bg-red-500 rounded-full group-hover:h-full transition-all duration-500 ease-out" />
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/30">
          <Button
            onClick={() => logout().then(() => navigate("/"))}
            variant="outline"
            className="w-full transition-all duration-500 hover:scale-105 hover:shadow-2xl group relative overflow-hidden border-red-300 bg-white/80 backdrop-blur-sm"
            style={{
              color: primaryColor,
            }}
          >
            {/* Animated gradient border */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm group-hover:blur-md -z-10" />
            <div className="absolute inset-[1px] bg-white rounded-lg z-0" />
            
            <LogOut 
              className="h-5 w-5 mr-2 transition-all duration-700 group-hover:scale-125 group-hover:rotate-180 z-10 relative" 
              style={{ color: primaryColor }} 
            />
            <span className="font-semibold transition-all duration-500 group-hover:tracking-widest group-hover:font-bold z-10 relative">
              Logout
            </span>
            
            {/* Particle effect */}
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute w-2 h-2 bg-red-400 rounded-full top-1 left-4 opacity-0 group-hover:opacity-100 group-hover:animate-fly-out" />
              <div className="absolute w-2 h-2 bg-red-400 rounded-full bottom-1 right-4 opacity-0 group-hover:opacity-100 group-hover:animate-fly-out" style={{ animationDelay: '200ms' }} />
            </div>
          </Button>
        </div>
      </div>

      {/* Main content - Floating entrance */}
      <div className="flex-1 ml-64">
        <div className="animate-float-in">
          <Outlet />
        </div>
      </div>

      {/* Custom animations in style tag */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        @keyframes float-in {
          0% { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          100% { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes fly-out {
          0% { 
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% { 
            transform: translate(var(--tw-translate-x), -50px) scale(0);
            opacity: 0;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        .animate-wiggle {
          animation: wiggle 0.6s ease-in-out;
        }
        .animate-float-in {
          animation: float-in 0.8s ease-out;
        }
        .animate-fly-out {
          animation: fly-out 0.8s ease-out forwards;
        }
        .hover\\:rotate-y-180:hover {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default SuperAdminLayout;