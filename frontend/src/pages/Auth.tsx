// pages/Auth.tsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Loader2 } from "lucide-react";
import type { UserRole, VerificationMethod } from "@/services/authService";

const Auth = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    verificationCode: "",
    role: "customer" as UserRole,
    verificationMethod: "email" as VerificationMethod,
    newPassword: "",
    currentPassword: ""
  });

  const {
    register,
    login,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    user,
    isLoadingUser,
    isRegistering,
    isLoggingIn,
    isVerifyingEmail,
    isResendingVerification,
    isSendingResetCode,
    isResettingPassword: isResettingPasswordMutation
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const hasRedirectedRef = useRef(false);

  // Watch for user changes and redirect accordingly - FIXED VERSION
useEffect(() => {
  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/superadmin')) {
    return;
  }

  if (user && !hasRedirectedRef.current) {
    console.log("User detected in useEffect, redirecting...", user.role);
    hasRedirectedRef.current = true;
    
    // FIXED: Use else-if for proper conditional flow
    if (user.role === "superadmin") {
      navigate("/superadmin/dashboard", { replace: true });
    } else if (user.role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }
}, [user, navigate, location.pathname]);

  // Reset the redirect flag when user becomes null (logout)
  useEffect(() => {
    if (!user) {
      hasRedirectedRef.current = false;
    }
  }, [user]);

  // Show loading while checking authentication
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated and we're on the auth page, show redirect message
  if (user && location.pathname === '/auth') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        verificationMethod: formData.verificationMethod
      });
      setIsVerifying(true);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail({
        email: formData.email,
        verificationCode: formData.verificationCode
      });
      // The useEffect will handle the redirect when user becomes available
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerification({
        email: formData.email,
        verificationMethod: formData.verificationMethod
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({
        email: formData.email,
        password: formData.password
      });
      // The useEffect will handle the redirect when user becomes available
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword({
        email: formData.email,
        verificationMethod: formData.verificationMethod
      });
      setIsResettingPassword(true);
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword({
        email: formData.email,
        verificationCode: formData.verificationCode,
        password: formData.newPassword
      });
      // The useEffect will handle the redirect when user becomes available
    } catch (error) {
      // Error handled in mutation
    }
  };

  // OTP Verification Screen
  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify Your Email</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {formData.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.verificationCode}
                  onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                  maxLength={6}
                  required
                  disabled={isVerifyingEmail}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isVerifyingEmail}
              >
                {isVerifyingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Code
                </Button>
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsVerifying(false);
                    setIsSignup(true);
                  }}
                  disabled={isVerifyingEmail}
                >
                  Back to Sign Up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Password Reset Screen
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter the verification code and new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetCode">Verification Code</Label>
                <Input
                  id="resetCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.verificationCode}
                  onChange={(e) => handleInputChange("verificationCode", e.target.value)}
                  maxLength={6}
                  required
                  disabled={isResettingPasswordMutation}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                  minLength={8}
                  required
                  disabled={isResettingPasswordMutation}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isResettingPasswordMutation}
              >
                {isResettingPasswordMutation && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsResettingPassword(false);
                    setIsForgotPassword(true);
                  }}
                  disabled={isResettingPasswordMutation}
                >
                  Back
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Forgot Password Screen
  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a reset code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail">Email</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  disabled={isSendingResetCode}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isSendingResetCode}
              >
                {isSendingResetCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Code
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setIsSignup(false);
                  }}
                  disabled={isSendingResetCode}
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl">Law Bookstore</CardTitle>
          <CardDescription>Sign in to your account or create a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isSignup ? "signup" : "signin"} onValueChange={(v) => setIsSignup(v === "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="signin">
              <form onSubmit={handleSignin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    className="px-0"
                    onClick={() => setIsForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      disabled={isRegistering}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      disabled={isRegistering}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={isRegistering}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    disabled={isRegistering}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min. 8 characters)"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    minLength={8}
                    required
                    disabled={isRegistering}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    disabled={isRegistering}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isRegistering}
                >
                  {isRegistering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;