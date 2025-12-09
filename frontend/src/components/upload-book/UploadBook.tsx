// components/upload-book/UploadBook.tsx
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BookService } from "@/services/BookService";
import { useNavigate } from "react-router-dom";
// import HeaderSection from "./HeaderSection";
import UploadForm from "./UploadForm";

const UploadBook = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(true); // Set to true by default for full width form
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      const response = await BookService.uploadBook(formData);
      
      if (response.success) {
        const approvalMessage = user?.role === "superadmin" 
          ? "Book uploaded and automatically approved!" 
          : "Book uploaded successfully! Waiting for super admin approval.";
        
        toast({ 
          title: "🎉 Success", 
          description: approvalMessage,
          variant: "default"
        });
        

        if (user?.role === "superadmin") {
          navigate("/superadmin/shop");
        } else {
          navigate("/admin/shop");
        }
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload book",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50/20 to-purple-50/10 dark:from-background dark:via-blue-950/10 dark:to-purple-950/5 p-6 animate-in fade-in duration-500 w-full">
      <div className="w-full mx-auto space-y-8">
        {/* <HeaderSection 
          isFormOpen={isFormOpen}
          viewMode="grid" // Remove view mode since no library
          onToggleForm={() => setIsFormOpen(!isFormOpen)}
          onChangeView={() => {}} // Empty function since no view mode needed
        /> */}

        {/* Full width upload form */}
        <div className="w-full">
          <UploadForm 
            isOpen={isFormOpen}
            isLoading={isLoading}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            userRole={user?.role}
          />
          
          {/* Show message when form is closed */}
          {!isFormOpen && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-6 bg-primary/10 rounded-2xl mb-6">
                <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Ready to Upload Another Book?</h3>
              <p className="text-muted-foreground text-lg mb-6 max-w-md">
                Your book has been submitted successfully. Click the button below to upload another book.
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="h-12 px-8 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary border-0"
              >
                Upload Another Book
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadBook;