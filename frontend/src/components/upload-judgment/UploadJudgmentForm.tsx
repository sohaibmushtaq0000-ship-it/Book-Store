// components/upload-judgment/UploadJudgmentForm.tsx
import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Upload, 
  FileText, 
  File, 
  ChevronRight,
  ChevronLeft,
  Scale,
  Calendar,
  Tag,
  Gavel,
  CheckCircle,
  AlertCircle,
  Image,
  X,
  Eye,
  Download,
  Check
} from "lucide-react";

interface UploadJudgmentFormProps {
  isLoading: boolean;
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  userRole?: string;
}

const COURTS = [
  "Supreme Court of Pakistan",
  "High Court",
  "District Court",
  "Session Court",
  "Special Court",
  "Federal Shariat Court",
];

const CASE_TYPES = [
  "Civil",
  "Criminal",
  "Constitutional",
  "Family",
  "Commercial",
  "Tax",
  "Labor",
  "Customs",
];

const CATEGORIES = [
  "Contract Law",
  "Property Law",
  "Tort Law",
  "Criminal Law",
  "Constitutional Law",
  "Family Law",
  "Corporate Law",
  "Tax Law",
  "Labor Law",
];

const CURRENCIES = ["PKR", "USD"];

const STEPS = [
  { id: 'case-info', title: 'Case Information', icon: Scale },
  { id: 'details', title: 'Details', icon: Calendar },
  { id: 'pricing', title: 'Pricing', icon: Tag },
  { id: 'documents', title: 'Documents', icon: FileText },
];

interface CoverImage {
  file: File;
  previewUrl: string;
  id: string;
}

interface FilePreview {
  file: File;
  previewUrl: string;
  type: 'pdf' | 'text';
}

const UploadJudgmentForm = ({
  isLoading,
  onSubmit,
  onCancel,
  userRole,
}: UploadJudgmentFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    citation: "",
    caseNumber: "",
    parties: "",
    caseTitle: "",
    court: "",
    judge: "",
    caseType: "",
    category: "",
    year: new Date().getFullYear().toString(),
    decisionDate: "",
    keywords: "",
    summary: "",
    price: "",
    currency: "PKR",
  });

  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [pdfFile, setPdfFile] = useState<FilePreview | null>(null);
  const [textFile, setTextFile] = useState<FilePreview | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    type: 'pdf' | 'text' | 'image';
    url: string;
    name: string;
  }>({ open: false, type: 'image', url: '', name: '' });

  const pdfFileRef = useRef<HTMLInputElement>(null);
  const textFileRef = useRef<HTMLInputElement>(null);
  const coverImagesRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCoverImagesChange = (files: FileList | null) => {
    if (!files) return;

    const newImages: CoverImage[] = [];
    
    for (let i = 0; i < Math.min(files.length, 5 - coverImages.length); i++) {
      const file = files[i];
      if (file && file.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          file,
          previewUrl,
          id: Math.random().toString(36).substr(2, 9)
        });
      }
    }

    setCoverImages(prev => [...prev, ...newImages]);
    setFormErrors(prev => ({ ...prev, coverImages: '' }));
  };

  const removeCoverImage = (id: string) => {
    setCoverImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handlePdfFileChange = (file: File | null) => {
    if (pdfFile?.previewUrl) {
      URL.revokeObjectURL(pdfFile.previewUrl);
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPdfFile({ file, previewUrl, type: 'pdf' });
    } else {
      setPdfFile(null);
    }
    setFormErrors(prev => ({ ...prev, pdfFile: '' }));
  };

  const handleTextFileChange = (file: File | null) => {
    if (textFile?.previewUrl) {
      URL.revokeObjectURL(textFile.previewUrl);
    }

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setTextFile({ file, previewUrl, type: 'text' });
    } else {
      setTextFile(null);
    }
    setFormErrors(prev => ({ ...prev, textFile: '' }));
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCoverImagesChange(e.target.files);
    if (coverImagesRef.current) {
      coverImagesRef.current.value = '';
    }
  };

  const handleCoverImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleCoverImagesChange(files);
  };

  const handleCoverImageDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const previewFile = (type: 'pdf' | 'text' | 'image', url: string, name: string) => {
    setPreviewDialog({ open: true, type, url, name });
  };

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.citation) errors.citation = "Citation is required";
        if (!formData.caseNumber) errors.caseNumber = "Case number is required";
        if (!formData.parties) errors.parties = "Parties are required";
        if (!formData.court) errors.court = "Court is required";
        if (!formData.caseType) errors.caseType = "Case type is required";
        if (!formData.category) errors.category = "Category is required";
        break;
      
      case 1:
        if (!formData.year) errors.year = "Year is required";
        if (!formData.summary) errors.summary = "Summary is required";
        break;
      
      case 2:
        if (!formData.price) errors.price = "Price is required";
        if (formData.price && parseFloat(formData.price) < 0) errors.price = "Price cannot be negative";
        break;
      
      case 3:
        if (!pdfFile) errors.pdfFile = "PDF file is required";
        if (!textFile) errors.textFile = "Text file is required";
        
        // Validate file types
        if (pdfFile && !pdfFile.file.type.includes('pdf')) {
          errors.pdfFile = "Please upload a valid PDF file";
        }
        if (textFile && !textFile.file.name.endsWith('.txt')) {
          errors.textFile = "Please upload a valid text file (.txt)";
        }
        
        // Validate file sizes
        if (pdfFile && pdfFile.file.size > 50 * 1024 * 1024) {
          errors.pdfFile = "PDF file size must be less than 50MB";
        }
        if (textFile && textFile.file.size > 10 * 1024 * 1024) {
          errors.textFile = "Text file size must be less than 10MB";
        }

        // Validate cover images
        if (coverImages.length > 0) {
          const oversizedCover = coverImages.find(img => img.file.size > 5 * 1024 * 1024);
          if (oversizedCover) {
            errors.coverImages = 'Cover images must be less than 5MB each';
          }
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(currentStep)) {
      const submitData = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          submitData.append(key, value.toString());
        }
      });

      // Append cover images
      coverImages.forEach((image) => {
        submitData.append('coverImages', image.file);
      });

      // Append files
      if (pdfFile) submitData.append('pdfFile', pdfFile.file);
      if (textFile) submitData.append('textFile', textFile.file);

      onSubmit(submitData);
    }
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / STEPS.length) * 100;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-25 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-red-100 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-100 to-red-200 rounded-xl shadow-sm">
              <Gavel className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Upload New Judgment
              </h1>
              <p className="text-gray-600 text-sm">
                {userRole === "superadmin" 
                  ? "Judgment will be automatically approved and published" 
                  : "Judgment will be sent for super admin approval"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Progress</div>
              <div className="text-lg font-bold text-red-700">{Math.round(getProgressPercentage())}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <div className="h-full flex flex-col max-w-7xl mx-auto w-full">
          {/* Progress Steps */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-red-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="text-sm text-gray-600 font-medium">
                  Step {currentStep + 1} of {STEPS.length}
                </div>
                <div className="text-sm font-semibold text-red-700">
                  {Math.round(getProgressPercentage())}% Complete
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-red-100 rounded-full h-2.5 mb-6 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-700 h-2.5 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center">
                      <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 transition-all duration-300 shadow-sm ${
                        isActive 
                          ? 'bg-red-600 border-red-600 text-white shadow-md scale-105' 
                          : isCompleted
                          ? 'bg-green-500 border-green-500 text-white shadow-sm'
                          : 'bg-white border-red-200 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                        ) : (
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </div>
                      <span className={`text-xs sm:text-sm mt-2 font-medium text-center ${
                        isActive ? 'text-red-700 font-semibold' : 
                        isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-hidden">
            <Card className="border border-red-100 shadow-lg bg-white h-full flex flex-col rounded-2xl">
              <CardHeader className="border-b border-red-100 pb-4 bg-gradient-to-r from-red-50 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg shadow-sm">
                    {React.createElement(STEPS[currentStep].icon, { 
                      className: "h-5 w-5 text-red-700"
                    })}
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-gray-900">
                      {STEPS[currentStep].title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Please provide the required information for this step
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6 h-full">
                  
                  {/* Step 1: Case Information */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="citation" className="text-gray-700 font-medium flex items-center gap-1">
                              Citation <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="citation"
                              value={formData.citation}
                              onChange={(e) => handleInputChange('citation', e.target.value)}
                              required
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              placeholder="e.g., PLD 2024 SC 1"
                            />
                            {formErrors.citation && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.citation}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="caseNumber" className="text-gray-700 font-medium flex items-center gap-1">
                              Case Number <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="caseNumber"
                              value={formData.caseNumber}
                              onChange={(e) => handleInputChange('caseNumber', e.target.value)}
                              required
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              placeholder="Enter case number"
                            />
                            {formErrors.caseNumber && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.caseNumber}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="parties" className="text-gray-700 font-medium flex items-center gap-1">
                              Parties <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="parties"
                              value={formData.parties}
                              onChange={(e) => handleInputChange('parties', e.target.value)}
                              required
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              placeholder="e.g., Plaintiff vs Defendant"
                            />
                            {formErrors.parties && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.parties}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="caseTitle" className="text-gray-700 font-medium">
                              Case Title
                            </Label>
                            <Input
                              id="caseTitle"
                              value={formData.caseTitle}
                              onChange={(e) => handleInputChange('caseTitle', e.target.value)}
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              placeholder="Enter case title"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="court" className="text-gray-700 font-medium flex items-center gap-1">
                              Court <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.court} onValueChange={(v) => handleInputChange('court', v)}>
                              <SelectTrigger className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors">
                                <SelectValue placeholder="Select court" />
                              </SelectTrigger>
                              <SelectContent>
                                {COURTS.map(court => (
                                  <SelectItem key={court} value={court}>
                                    {court}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.court && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.court}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="caseType" className="text-gray-700 font-medium flex items-center gap-1">
                              Case Type <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.caseType} onValueChange={(v) => handleInputChange('caseType', v)}>
                              <SelectTrigger className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors">
                                <SelectValue placeholder="Select case type" />
                              </SelectTrigger>
                              <SelectContent>
                                {CASE_TYPES.map(type => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.caseType && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.caseType}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="category" className="text-gray-700 font-medium flex items-center gap-1">
                              Category <span className="text-red-500">*</span>
                            </Label>
                            <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                              <SelectTrigger className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrors.category && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.category}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="judge" className="text-gray-700 font-medium">
                              Judge
                            </Label>
                            <Input
                              id="judge"
                              value={formData.judge}
                              onChange={(e) => handleInputChange('judge', e.target.value)}
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              placeholder="Enter judge name"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Additional Details */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="year" className="text-gray-700 font-medium flex items-center gap-1">
                                Year <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                id="year"
                                type="number"
                                value={formData.year}
                                onChange={(e) => handleInputChange('year', e.target.value)}
                                required
                                className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                                placeholder="2024"
                                min="1900"
                                max={new Date().getFullYear()}
                              />
                              {formErrors.year && (
                                <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {formErrors.year}
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="decisionDate" className="text-gray-700 font-medium">
                                Decision Date
                              </Label>
                              <Input
                                id="decisionDate"
                                type="date"
                                value={formData.decisionDate}
                                onChange={(e) => handleInputChange('decisionDate', e.target.value)}
                                className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="keywords" className="text-gray-700 font-medium">
                              Keywords
                            </Label>
                            <Input
                              id="keywords"
                              value={formData.keywords}
                              onChange={(e) => handleInputChange('keywords', e.target.value)}
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors"
                              placeholder="Comma separated keywords"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 h-full">
                          <Label htmlFor="summary" className="text-gray-700 font-medium flex items-center gap-1">
                            Summary <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="summary"
                            value={formData.summary}
                            onChange={(e) => handleInputChange('summary', e.target.value)}
                            rows={12}
                            required
                            className="border-gray-300 focus:border-red-400 focus:ring-red-200 resize-none h-full min-h-[300px] rounded-lg transition-colors"
                            placeholder="Provide a detailed summary of the judgment..."
                          />
                          {formErrors.summary && (
                            <p className="text-red-500 text-sm flex items-center gap-1 mt-1">
                              <AlertCircle className="h-3 w-3" />
                              {formErrors.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Pricing */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="max-w-md mx-auto bg-gradient-to-br from-red-50 to-red-25 rounded-2xl p-6 border border-red-100">
                        <div className="text-center mb-6">
                          <div className="p-3 bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                            <Tag className="h-8 w-8 text-red-700" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Judgment Price</h3>
                          <p className="text-gray-600 text-sm">Set the price for accessing this judgment</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price" className="text-gray-700 font-medium flex items-center gap-1">
                              Price <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="price"
                              type="number"
                              value={formData.price}
                              onChange={(e) => handleInputChange('price', e.target.value)}
                              required
                              className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors text-center text-lg font-semibold"
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                            {formErrors.price && (
                              <p className="text-red-500 text-sm flex items-center gap-1 mt-1 justify-center">
                                <AlertCircle className="h-3 w-3" />
                                {formErrors.price}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="currency" className="text-gray-700 font-medium">
                              Currency
                            </Label>
                            <Select value={formData.currency} onValueChange={(v) => handleInputChange('currency', v)}>
                              <SelectTrigger className="border-gray-300 focus:border-red-400 focus:ring-red-200 h-11 rounded-lg transition-colors">
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENCIES.map(currency => (
                                  <SelectItem key={currency} value={currency}>
                                    {currency}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Documents with Enhanced File Upload */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      {/* Cover Images Section */}
                      <div className="space-y-4">
                        <Label className="text-gray-700 font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                          Cover Images (Optional)
                          <span className="text-sm font-normal text-gray-500">
                            (Up to 5 images)
                          </span>
                        </Label>
                        
                        <p className="text-gray-600 text-sm">
                          Upload up to 5 cover images for the judgment. These will be displayed in the judgment gallery.
                        </p>
                        
                        <Input
                          ref={coverImagesRef}
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleCoverImageSelect}
                          className="hidden"
                          id="cover-images"
                        />
                        
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                          {/* Cover Image Upload Box */}
                          {coverImages.length < 5 && (
                            <div className="border-2 border-dashed border-red-300 rounded-xl p-4 hover:border-red-400 transition-all duration-300 bg-red-50 cursor-pointer group">
                              <label htmlFor="cover-images" className="cursor-pointer block h-full">
                                <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                                  <div className="p-2 bg-red-100 rounded-lg">
                                    <Upload className="h-6 w-6 text-red-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">Add Cover</p>
                                    <p className="text-xs text-gray-500">
                                      {coverImages.length}/5
                                    </p>
                                  </div>
                                </div>
                              </label>
                            </div>
                          )}

                          {/* Cover Image Previews */}
                          {coverImages.map((image) => (
                            <div key={image.id} className="relative group">
                              <div 
                                className="aspect-square rounded-lg overflow-hidden border-2 border-green-500/30 bg-green-50/50 cursor-pointer"
                                onClick={() => previewFile('image', image.previewUrl, image.file.name)}
                              >
                                <img 
                                  src={image.previewUrl} 
                                  alt="Cover preview" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCoverImage(image.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        
                        {formErrors.coverImages && (
                          <p className="text-red-500 text-sm flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.coverImages}
                          </p>
                        )}
                      </div>

                      {/* PDF and Text Files */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FileUploadSection
                          title="PDF File *"
                          description="PDF file up to 50MB"
                          accept=".pdf"
                          file={pdfFile}
                          onFileChange={handlePdfFileChange}
                          onRemove={() => handlePdfFileChange(null)}
                          onPreview={(url, name) => previewFile('pdf', url, name)}
                          fileRef={pdfFileRef}
                          error={formErrors.pdfFile}
                          fileType="pdfFile"
                        />
                        
                        <FileUploadSection
                          title="Text File *"
                          description="TXT file up to 10MB"
                          accept=".txt"
                          file={textFile}
                          onFileChange={handleTextFileChange}
                          onRemove={() => handleTextFileChange(null)}
                          onPreview={(url, name) => previewFile('text', url, name)}
                          fileRef={textFileRef}
                          error={formErrors.textFile}
                          fileType="textFile"
                        />
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between pt-6 border-t border-gray-200 mt-auto gap-4">
                    <div>
                      {currentStep > 0 && (
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6 rounded-lg transition-colors w-full sm:w-auto"
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-6 rounded-lg transition-colors w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      
                      {currentStep < STEPS.length - 1 ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-11 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto"
                        >
                          Next Step
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={isLoading || !pdfFile || !textFile}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white h-11 px-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Judgment
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* File Preview Dialog */}
      <Dialog open={previewDialog.open} onOpenChange={(open) => setPreviewDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Preview: {previewDialog.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewDialog.type === 'image' && (
              <img src={previewDialog.url} alt="Preview" className="w-full h-auto rounded-lg" />
            )}
            {previewDialog.type === 'pdf' && (
              <div className="w-full h-[60vh]">
                <iframe 
                  src={previewDialog.url} 
                  className="w-full h-full rounded-lg border"
                  title="PDF Preview"
                />
              </div>
            )}
            {previewDialog.type === 'text' && (
              <div className="w-full h-[60vh]">
                <iframe 
                  src={previewDialog.url} 
                  className="w-full h-full rounded-lg border"
                  title="Text Preview"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => window.open(previewDialog.url, '_blank')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Open in New Tab
            </Button>
            <Button onClick={() => setPreviewDialog(prev => ({ ...prev, open: false }))}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Enhanced File Upload Sub-component with Preview
interface FileUploadSectionProps {
  title: string;
  description: string;
  accept: string;
  file: FilePreview | null;
  onFileChange: (file: File | null) => void;
  onRemove: () => void;
  onPreview: (url: string, name: string) => void;
  fileRef: React.RefObject<HTMLInputElement>;
  error?: string;
  fileType: 'pdfFile' | 'textFile';
}

const FileUploadSection = ({ 
  title, 
  description, 
  accept, 
  file,
  onFileChange,
  onRemove,
  onPreview,
  fileRef,
  error,
  fileType
}: FileUploadSectionProps) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileChange(selectedFile);
  };

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdfFile': return <FileText className="h-5 w-5" />;
      case 'textFile': return <File className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-3 w-full">
      <Label className="text-gray-700 font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
        {title}
      </Label>
      
      {!file ? (
        <div className="border-2 border-dashed border-red-300 rounded-xl p-6 hover:border-red-400 transition-all duration-300 bg-red-50 cursor-pointer">
          <Input 
            ref={fileRef}
            type="file" 
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-${fileType}`}
          />
          <label htmlFor={`file-${fileType}`} className="cursor-pointer block">
            <div className="text-center space-y-3">
              <div className="p-3 bg-red-100 rounded-lg w-12 h-12 mx-auto flex items-center justify-center">
                <Upload className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Click to upload</p>
                <p className="text-gray-500 mt-1 text-sm">
                  {description}
                </p>
              </div>
            </div>
          </label>
        </div>
      ) : (
        <div className="border-2 border-green-500/30 rounded-xl p-4 bg-green-50/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getFileIcon()}
                  <p className="font-semibold text-gray-700 truncate">
                    {file.file.name}
                  </p>
                </div>
                <p className="text-gray-500 text-sm">
                  {formatFileSize(file.file.size)}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onPreview(file.previewUrl, file.file.name)}
                className="flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                Preview
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-sm flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default UploadJudgmentForm;