// components/ProfileSettings.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Import the hook we just created
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, Camera, CreditCard, User, Mail, Phone, MapPin, Building2, Wallet, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the user profile type
interface UserProfile {
  id: string;
  email: string;
  role: string;
  profileImage?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  bankName?: string;
  accountNumber?: string;
  easyPaisaNumber?: string;
  jazzCashNumber?: string;
  idCardFront?: string;
  idCardBack?: string;
  isVerified?: boolean;
}

const ProfileSettings = () => {
  const { toast } = useToast();
  const { 
    user, 
    updateUser, 
    isUpdatingUser 
  } = useAuth();
  
  // Initialize form state with user data
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    email: '',
    role: 'user',
    profileImage: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    bankName: '',
    accountNumber: '',
    easyPaisaNumber: '',
    jazzCashNumber: '',
    idCardFront: '',
    idCardBack: '',
    isVerified: false
  });

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        id: user.id || '',
        email: user.email || '',
        role: user.role || 'user',
        profileImage: user.profileImage || '',
        fullName: user.fullName || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        bankName: user.bankName || '',
        accountNumber: user.accountNumber || '',
        easyPaisaNumber: user.easyPaisaNumber || '',
        jazzCashNumber: user.jazzCashNumber || '',
        idCardFront: user.idCardFront || '',
        idCardBack: user.idCardBack || '',
        isVerified: user.isVerified || false
      }));
    }
  }, [user]);

  // Handle file uploads
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, profileImage: imageUrl }));
        toast({ title: "Success", description: "Profile image uploaded!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdCardFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, idCardFront: imageUrl }));
        toast({ title: "Success", description: "ID card front uploaded!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdCardBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData(prev => ({ ...prev, idCardBack: imageUrl }));
        toast({ title: "Success", description: "ID card back uploaded!" });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save all changes
  const handleSave = async () => {
    try {
      await updateUser(formData);
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to update profile:', error);
    }
  };

  // If user data is still loading, show loading state
  if (!user) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-2">Loading your profile...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your profile information and verification documents</p>
        </div>
        <Button 
          onClick={handleSave} 
          size="lg"
          disabled={isUpdatingUser}
          className="px-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          {isUpdatingUser ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="profile" className="text-base">Profile Info</TabsTrigger>
          <TabsTrigger value="verification" className="text-base">Verification</TabsTrigger>
          <TabsTrigger value="payment" className="text-base">Payment Details</TabsTrigger>
        </TabsList>

        {/* Profile Info Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Image Card */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg md:col-span-1">
              <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Profile Picture
                </CardTitle>
                <CardDescription>Upload your photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-40 w-40 ring-4 ring-primary/20 shadow-xl">
                    <AvatarImage src={formData.profileImage} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-4xl">
                      {user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="w-full space-y-2">
                    <Label htmlFor="profile-image" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg border-2 border-dashed border-primary/40 transition-all duration-200 hover:scale-105">
                        <Upload className="h-4 w-4" />
                        <span className="font-medium">Choose Image</span>
                      </div>
                    </Label>
                    <Input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Information Card */}
            <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg md:col-span-2">
              <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2 text-base font-semibold">
                      <User className="h-4 w-4 text-primary" />
                      Full Name
                    </Label>
                    <Input 
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="John Doe"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2 text-base font-semibold">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </Label>
                    <Input 
                      id="email"
                      value={formData.email} 
                      disabled 
                      className="bg-secondary/50 h-11"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2 text-base font-semibold">
                      <Phone className="h-4 w-4 text-primary" />
                      Phone Number
                    </Label>
                    <Input 
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="flex items-center gap-2 text-base font-semibold">
                      <Building2 className="h-4 w-4 text-primary" />
                      Role
                    </Label>
                    <Input 
                      id="role"
                      value={formData.role === "superadmin" ? "Super Admin" : formData.role === "admin" ? "Admin" : "User"} 
                      disabled 
                      className="bg-secondary/50 capitalize h-11"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Address Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-base font-semibold">
                      Street Address
                    </Label>
                    <Input 
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                      className="h-11"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-base font-semibold">
                        City
                      </Label>
                      <Input 
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Lahore"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-base font-semibold">
                        Country
                      </Label>
                      <Input 
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Pakistan"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification" className="space-y-6">
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Identity Verification
              </CardTitle>
              <CardDescription>Upload both sides of your government-issued ID</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* ID Card Front */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    ID Card - Front Side
                  </h3>
                  {formData.idCardFront ? (
                    <div className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                        <img src={formData.idCardFront} alt="ID Card Front" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Label htmlFor="id-card-front" className="cursor-pointer">
                          <Button variant="secondary" size="sm" type="button">
                            <Upload className="h-4 w-4 mr-2" />
                            Change Image
                          </Button>
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all">
                      <CreditCard className="h-16 w-16 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">No front image uploaded</p>
                    </div>
                  )}
                  
                  <Label htmlFor="id-card-front" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg border-2 border-dashed border-primary/40 transition-all duration-200 hover:scale-105">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Upload Front Side</span>
                    </div>
                  </Label>
                  <Input
                    id="id-card-front"
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardFrontUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    Clear image of the front side with all details visible
                  </p>
                </div>

                {/* ID Card Back */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    ID Card - Back Side
                  </h3>
                  {formData.idCardBack ? (
                    <div className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                        <img src={formData.idCardBack} alt="ID Card Back" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Label htmlFor="id-card-back" className="cursor-pointer">
                          <Button variant="secondary" size="sm" type="button">
                            <Upload className="h-4 w-4 mr-2" />
                            Change Image
                          </Button>
                        </Label>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gradient-to-br from-secondary/50 to-secondary/30 flex flex-col items-center justify-center border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all">
                      <CreditCard className="h-16 w-16 text-muted-foreground/50 mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">No back image uploaded</p>
                    </div>
                  )}
                  
                  <Label htmlFor="id-card-back" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-primary/10 hover:bg-primary/20 rounded-lg border-2 border-dashed border-primary/40 transition-all duration-200 hover:scale-105">
                      <Upload className="h-4 w-4" />
                      <span className="font-medium">Upload Back Side</span>
                    </div>
                  </Label>
                  <Input
                    id="id-card-back"
                    type="file"
                    accept="image/*"
                    onChange={handleIdCardBackUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">
                    Clear image of the back side with all details visible
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Accepted Documents:</strong> National ID Card, Driver's License, Passport, or any government-issued identification document.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card className="border-2 hover:border-primary/50 transition-all duration-300 shadow-lg">
            <CardHeader className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Payment Information
              </CardTitle>
              <CardDescription>Manage your payment methods and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              {/* Bank Account */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 pb-2 border-b">
                  <Building2 className="h-5 w-5 text-primary" />
                  Bank Account Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-base font-semibold">
                      Bank Name
                    </Label>
                    <Input 
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      placeholder="e.g., HBL, MCB, UBL"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber" className="text-base font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      Account Number
                    </Label>
                    <Input 
                      id="accountNumber"
                      value={formData.accountNumber}
                      onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                      placeholder="Enter your account number"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Mobile Payment Methods */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 pb-2 border-b">
                  <Phone className="h-5 w-5 text-primary" />
                  Mobile Payment Methods
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="easyPaisa" className="text-base font-semibold">
                      EasyPaisa Number
                    </Label>
                    <Input 
                      id="easyPaisa"
                      value={formData.easyPaisaNumber}
                      onChange={(e) => handleInputChange('easyPaisaNumber', e.target.value)}
                      placeholder="03XX XXXXXXX"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your registered EasyPaisa mobile number
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jazzCash" className="text-base font-semibold">
                      JazzCash Number
                    </Label>
                    <Input 
                      id="jazzCash"
                      value={formData.jazzCashNumber}
                      onChange={(e) => handleInputChange('jazzCashNumber', e.target.value)}
                      placeholder="03XX XXXXXXX"
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Your registered JazzCash mobile number
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Payment information is securely stored and will be used for transaction processing. Make sure all details are accurate.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileSettings;