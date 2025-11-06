import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserRole = "user" | "admin" | "superadmin";

interface User {
  email: string;
  role: UserRole;
  profileImage?: string;
  idCard?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Initialize dummy super admin if not exists
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    if (!users.find((u: any) => u.email === "superadmin@mail.com")) {
      users.push({ email: "superadmin@mail.com", password: "123", role: "superadmin" });
      localStorage.setItem("mockUsers", JSON.stringify(users));
    }
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem("mockUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const signin = async (email: string, password: string) => {
    // Mock signin - check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData = { email: foundUser.email, role: foundUser.role };
      setUser(userData);
      localStorage.setItem("mockUser", JSON.stringify(userData));
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const signup = async (email: string, password: string, role: UserRole) => {
    // Mock signup - save to localStorage
    const users = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User already exists");
    }
    
    const newUser = { email, password, role };
    users.push(newUser);
    localStorage.setItem("mockUsers", JSON.stringify(users));
    
    const userData = { email, role };
    setUser(userData);
    localStorage.setItem("mockUser", JSON.stringify(userData));
  };

  const signout = () => {
    setUser(null);
    localStorage.removeItem("mockUser");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
