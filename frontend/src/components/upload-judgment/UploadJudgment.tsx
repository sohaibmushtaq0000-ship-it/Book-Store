// UploadJudgment.tsx
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { JudgmentService } from "@/services/judgmentService";
import UploadJudgmentForm from "./UploadJudgmentForm";
import { Button } from "@/components/ui/button";

const UploadJudgment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);

      const response = await JudgmentService.uploadJudgment(formData);

      if (response.success) {
        const successMsg =
          user?.role === "superadmin"
            ? "Judgment uploaded successfully and auto-approved!"
            : "Judgment uploaded successfully! Awaiting superadmin approval.";

        toast({
          title: "🎉 Success",
          description: successMsg,
          variant: "default",
        });

        setIsFormOpen(false);
      } else {
        toast({
          title: "Upload Failed",
          description: response.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Handle specific error cases
      if (error.response?.data?.message?.includes('citation already exists')) {
        toast({
          title: "Duplicate Citation",
          description: "A judgment with this citation already exists. Please use a different citation.",
          variant: "destructive",
        });
      } else if (error.response?.data?.message) {
        toast({
          title: "Upload Failed",
          description: error.response.data.message,
          variant: "destructive",
        });
      } else if (error.message) {
        toast({
          title: "Upload Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Upload Failed",
          description: "Failed to upload judgment. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-red-50/20 to-red-50/10 dark:from-background dark:via-red-950/10 dark:to-red-950/5 p-4 sm:p-6 animate-in fade-in duration-500 w-full">
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Upload Form */}
        <div className="w-full">
          {isFormOpen ? (
            <UploadJudgmentForm
              isLoading={isLoading}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              userRole={user?.role}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-center bg-white rounded-2xl shadow-lg border border-red-100 p-6 sm:p-8 mx-auto max-w-2xl">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl mb-4 sm:mb-6 shadow-inner">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">
                Ready to Upload Another Judgment?
              </h3>
              <p className="text-gray-600 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 max-w-md leading-relaxed">
                Your judgment has been successfully uploaded. Click below to
                upload another judgment to the system.
              </p>
              <Button
                onClick={() => setIsFormOpen(true)}
                className="h-11 sm:h-12 px-6 sm:px-8 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 text-white rounded-xl"
                size="lg"
              >
                Upload Another Judgment
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadJudgment;