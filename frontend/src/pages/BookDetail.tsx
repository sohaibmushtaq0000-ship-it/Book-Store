// pages/BookDetail.tsx - Enhanced version with image gallery and rating
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookService, Book, BookPreview } from "@/services/bookService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Loader2, 
  Star, 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Download, 
  BookOpen,
  Eye,
  FileText,
  Calendar,
  Globe,
  User,
  Building,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

interface BookImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  onClick?: () => void;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
  isActive?: boolean;
}

const BookImage = ({ 
  src, 
  alt, 
  className = "", 
  fallbackSrc = "/placeholder-book.png",
  onClick,
  showNavigation,
  onNext,
  onPrev,
  isActive = false
}: BookImageProps) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
    setIsLoading(false);
  };

  const handleLoad = () => {
    setHasError(false);
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset state when src changes
    setImgSrc(src || fallbackSrc);
    setHasError(false);
    setIsLoading(true);
  }, [src, fallbackSrc]);

  return (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}>
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}
      
      {/* Image */}
      <img
        src={imgSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${onClick ? 'cursor-pointer' : ''}`}
        onError={handleError}
        onLoad={handleLoad}
        crossOrigin="anonymous"
        loading="lazy"
        onClick={onClick}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500 text-center">Image not available</span>
        </div>
      )}
      
      {/* Navigation arrows - Always visible for active images */}
      {showNavigation && onPrev && onNext && !hasError && !isLoading && (
        <>
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-100 transition-opacity backdrop-blur-sm bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 transition-opacity backdrop-blur-sm bg-white/80 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}
      
      {/* Active indicator */}
      {isActive && !hasError && (
        <div className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />
      )}
    </div>
  );
};

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [bookPreview, setBookPreview] = useState<BookPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [reading, setReading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckLoading, setPurchaseCheckLoading] = useState(false);
  
  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  
  // Rating state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (id) {
      fetchBook(id);
      fetchBookPreview(id);
      if (isAuthenticated) {
        checkPurchaseStatus(id);
      }
    }
  }, [id, isAuthenticated]);

  const fetchBook = async (bookId: string) => {
    try {
      setLoading(true);
      const response = await BookService.getBookById(bookId);
      if (response.success && response.data) {
        setBook(response.data.book);
        // Set first valid image as selected
        const validImages = response.data.book.coverImages?.filter(img => img) || [];
        if (validImages.length > 0) {
          setSelectedImageIndex(0);
        }
        // Increment view count
        await BookService.incrementViewCount(bookId);
      } else {
        toast.error(response.message || 'Failed to load book details');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookPreview = async (bookId: string) => {
    try {
      const response = await BookService.getBookPreview(bookId);
      if (response.success && response.data) {
        setBookPreview(response.data);
      }
    } catch (error) {
      console.error('Error fetching book preview:', error);
    }
  };

  const checkPurchaseStatus = async (bookId: string) => {
    try {
      setPurchaseCheckLoading(true);
      const response = await BookService.checkPurchaseStatus(bookId);
      if (response.success && response.data) {
        setHasPurchased(response.data.hasPurchased);
      }
    } catch (error) {
      console.error('Error checking purchase status:', error);
    } finally {
      setPurchaseCheckLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!book) {
      toast.error('Book information not available');
      return;
    }

    try {
      setPurchasing(true);
      const response = await BookService.purchaseBook(book._id, {
        format: 'pdf',
        paymentMethod: 'bank'
      });
      
      if (response.success) {
        toast.success('Book purchased successfully!');
        setHasPurchased(true);
      } else {
        toast.error(response.message || 'Failed to purchase book');
      }
    } catch (error) {
      console.error('Error purchasing book:', error);
      toast.error('Failed to purchase book');
    } finally {
      setPurchasing(false);
    }
  };

  const handleReadTextBook = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!book) {
      toast.error('Book information not available');
      return;
    }

    try {
      setReading(true);
      const response = await BookService.readFullBook(book._id, 'text');
      if (response.success && response.data) {
        navigate(`/book/${book._id}/read?format=text`);
      } else {
        toast.error(response.message || 'Failed to open book for reading');
      }
    } catch (error) {
      console.error('Error reading book:', error);
      toast.error('Failed to open book for reading');
    } finally {
      setReading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!book) {
      toast.error('Book information not available');
      return;
    }

    if (!hasPurchased) {
      toast.error('Please purchase the book to download PDF');
      return;
    }

    try {
      const response = await BookService.readFullBook(book._id, 'pdf');
      if (response.success && response.data?.filePath) {
        const downloadUrl = `${import.meta.env.VITE_API_URL || ''}${response.data.filePath}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${book.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('PDF download started');
      } else {
        toast.error(response.message || 'Failed to download PDF');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // Filter out invalid images
  const getValidImages = () => {
    if (!book?.coverImages) return [];
    return book.coverImages.filter(img => img && img.trim() !== '');
  };

  const validImages = getValidImages();
  const hasMultipleImages = validImages.length > 1;

  // Image gallery functions
  const nextImage = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => 
        prev === validImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? validImages.length - 1 : prev - 1
      );
    }
  };

  // Rating functions
  const handleRatingSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (!book) {
      toast.error('Book information not available');
      return;
    }

    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmittingRating(true);
      const response = await BookService.updateBookRating(book._id, userRating);
      if (response.success) {
        toast.success('Thank you for your rating!');
        setShowRatingModal(false);
        setUserRating(0);
        setRatingComment("");
        // Refresh book data to update rating
        fetchBook(book._id);
      } else {
        toast.error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderTextContent = () => {
    if (!book) {
      return <p className="text-muted-foreground">Book content not available</p>;
    }

    if (bookPreview?.previewContent) {
      return (
        <div className="whitespace-pre-line leading-relaxed">
          {bookPreview.previewContent}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Preview content is not available. Showing book description instead:
        </p>
        <div className="whitespace-pre-line leading-relaxed">
          {book.description || 'No content available for this book.'}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading book details...</span>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Book not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const calculateDiscountedPrice = () => {
    if (book.discountPercentage && book.discountPercentage > 0) {
      return book.price * (1 - book.discountPercentage / 100);
    }
    return book.price;
  };

  const discountedPrice = calculateDiscountedPrice();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="gap-2 self-start hover:bg-primary/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse
          </Button>
          
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
              <Eye className="w-4 h-4" />
              <span>{book.viewCount?.toLocaleString() || 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-current" />
              <span>
                {(book.averageRating || 0).toFixed(1)} 
                <span className="text-muted-foreground ml-1">
                  ({book.reviewCount || 0} reviews)
                </span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover Gallery and Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                {/* Book Cover Gallery */}
                <div className="relative mb-6">
                  {/* Main Image */}
                  <div className="aspect-[3/4] mb-4">
                    <BookImage
                      src={validImages[selectedImageIndex] || '/placeholder-book.png'}
                      alt={`${book.title} - Cover ${selectedImageIndex + 1}`}
                      className="w-full h-full"
                      onClick={() => validImages.length > 0 && setShowLightbox(true)}
                      showNavigation={hasMultipleImages}
                      onNext={nextImage}
                      onPrev={prevImage}
                    />
                  </div>

                  {/* Image Counter */}
                  {hasMultipleImages && (
                    <div className="text-center mb-4 text-sm text-muted-foreground">
                      Image {selectedImageIndex + 1} of {validImages.length}
                    </div>
                  )}

                  {/* Thumbnail Gallery */}
                  {validImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {validImages.map((image, index) => (
                        <button
                          key={index}
                          className="relative flex-shrink-0 w-16 h-20 focus:outline-none group"
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <BookImage
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full rounded-lg"
                            isActive={selectedImageIndex === index}
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {book.discountPercentage && book.discountPercentage > 0 && (
                      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse">
                        {book.discountPercentage}% OFF
                      </Badge>
                    )}
                    {book.bestseller && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
                        BESTSELLER
                      </Badge>
                    )}
                    {book.newRelease && (
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        NEW
                      </Badge>
                    )}
                    {book.featured && (
                      <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        FEATURED
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price Section */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
  <div className="flex items-center justify-center gap-3 mb-2">
    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
      {formatCurrency(discountedPrice, book.currency || 'PKR')}
    </span>
    {book.discountPercentage && book.discountPercentage > 0 ? (
      <span className="text-xl text-muted-foreground line-through">
        {formatCurrency(book.price, book.currency || 'PKR')}
      </span>
    ) : null}
  </div>
  <p className="text-sm text-muted-foreground">
    {book.discountPercentage && book.discountPercentage > 0 
      ? 'Limited time discount!' 
      : 'Regular price'}
  </p>
</div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                  {/* Free Text Reading */}
                  <Button 
                    className="w-full gap-2 h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all hover:shadow-lg" 
                    size="lg"
                    onClick={handleReadTextBook}
                    disabled={reading}
                  >
                    {reading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                    {reading ? 'Opening...' : 'Read Free Text'}
                  </Button>

                  {/* PDF Download/Purchase */}
                  {hasPurchased ? (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 h-12 border-primary/30 hover:border-primary hover:bg-primary/5"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 h-12 border-primary/30 hover:border-primary hover:bg-primary/5"
                      onClick={handlePurchase}
                      disabled={purchasing || purchaseCheckLoading}
                    >
                      {purchasing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {purchasing ? 'Processing...' : `Buy PDF - ${formatCurrency(discountedPrice, book.currency || 'PKR')}`}
                    </Button>
                  )}

                  {/* Rating Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full gap-2 h-12 text-primary hover:text-primary/80 hover:bg-primary/5"
                    onClick={() => setShowRatingModal(true)}
                  >
                    <Star className="w-4 h-4" />
                    Rate this Book
                  </Button>

                  {/* Wishlist */}
                  <Button variant="ghost" className="w-full gap-2 h-12">
                    <Heart className="w-4 h-4" />
                    Add to Wishlist
                  </Button>
                </div>

                {/* Purchase Status */}
                {isAuthenticated && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-secondary/20 to-background rounded-xl border">
                    <p className="text-sm font-medium mb-2">Your Access:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Text Version</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                          Free Access
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm">PDF Version</span>
                        </div>
                        {hasPurchased ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Purchased
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50">
                            Purchase Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            <Card className="border-2 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="space-y-4">
                  <CardTitle className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {book.title}
                  </CardTitle>
                  <CardDescription className="text-xl flex items-center gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <User className="w-5 h-5" />
                      <span className="font-semibold">by {book.author}</span>
                    </div>
                    {book.authorBio && (
                      <span className="text-sm text-muted-foreground italic">
                        · Author Biography Available
                      </span>
                    )}
                  </CardDescription>
                  
                  {/* Rating with Stars */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setShowRatingModal(true)}
                            className="focus:outline-none transform hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= (hoverRating || Math.floor(book.averageRating || 0))
                                  ? "text-yellow-400 fill-current drop-shadow-lg"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">
                          {(book.averageRating || 0).toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({book.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowRatingModal(true)}
                      className="gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Add Rating
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4 bg-secondary/20 p-1 rounded-xl">
                    <TabsTrigger 
                      value="details" 
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="description"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                    >
                      Description
                    </TabsTrigger>
                    <TabsTrigger 
                      value="preview"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                    >
                      Preview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="reviews"
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                    >
                      Reviews
                    </TabsTrigger>
                  </TabsList>

                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Card className="border-2 hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Publisher</p>
                                  <p className="text-muted-foreground">
                                    {book.publisher || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Calendar className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Publication Year</p>
                                  <p className="text-muted-foreground">
                                    {book.publicationYear || 'Not specified'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <FileText className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Pages</p>
                                  <p className="text-muted-foreground">{book.totalPages || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                      
                      <div className="space-y-4">
                        <Card className="border-2 hover:border-primary/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Globe className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Language</p>
                                  <p className="text-muted-foreground capitalize">
                                    {book.language || 'English'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                  <p className="font-semibold">Category</p>
                                  <div className="flex gap-2 flex-wrap mt-1">
                                    <Badge 
                                      variant="secondary" 
                                      className="capitalize bg-primary/10 text-primary border-primary/20"
                                    >
                                      {book.category || 'General'}
                                    </Badge>
                                    {book.subcategory && (
                                      <Badge 
                                        variant="outline" 
                                        className="capitalize border-primary/30"
                                      >
                                        {book.subcategory}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {book.isbn && (
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <FileText className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-semibold">ISBN</p>
                                    <p className="text-muted-foreground font-mono text-sm">
                                      {book.isbn}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Tags */}
                    {book.tags && book.tags.length > 0 && (
                      <Card className="border-2">
                        <CardContent className="p-4">
                          <p className="font-semibold mb-3">Tags</p>
                          <div className="flex flex-wrap gap-2">
                            {book.tags.map((tag, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary"
                                className="px-3 py-1 rounded-full bg-secondary/50 hover:bg-secondary transition-colors cursor-default"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  {/* Description Tab */}
                  <TabsContent value="description">
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold mb-3">Book Description</h4>
                            <p className="text-lg leading-relaxed whitespace-pre-line text-muted-foreground">
                              {book.description || 'No description available.'}
                            </p>
                          </div>
                          
                          {book.authorBio && (
                            <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                About the Author
                              </h4>
                              <p className="text-muted-foreground whitespace-pre-line">
                                {book.authorBio}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Preview Tab */}
                  <TabsContent value="preview">
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1">Book Preview</h3>
                              <p className="text-sm text-muted-foreground">
                                Read the full text content uploaded by the publisher
                              </p>
                            </div>
                            {bookPreview && (
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-full">
                                  <FileText className="w-4 h-4" />
                                  <span>{bookPreview.wordCount?.toLocaleString() || 0} words</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-full">
                                  <Clock className="w-4 h-4" />
                                  <span>{bookPreview.estimatedReadingTime || 0} min read</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Text Content Display */}
                          <div className="bg-gradient-to-br from-card to-secondary/10 border-2 rounded-xl overflow-hidden">
                            <div className="border-b p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    Full Text
                                  </Badge>
                                  <Badge variant="secondary" className="capitalize">
                                    {book.textFormat || 'plain'} format
                                  </Badge>
                                  <Badge variant="secondary" className="capitalize">
                                    {book.textLanguage || 'English'}
                                  </Badge>
                                </div>
                                <Button 
                                  variant="default"
                                  size="sm" 
                                  onClick={() => {
                                    if (isAuthenticated) {
                                      handleReadTextBook();
                                    } else {
                                      navigate('/auth');
                                    }
                                  }}
                                  className="gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  Read Full Screen
                                </Button>
                              </div>
                            </div>
                            
                            {/* Actual Text Content */}
                            <div className="p-6 max-h-[400px] overflow-y-auto">
                              {renderTextContent()}
                            </div>
                          </div>
                          
                          {/* Quick Actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-2 hover:border-primary/50 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">Want to read offline?</p>
                                    <p className="text-sm text-muted-foreground">
                                      Purchase the PDF version
                                    </p>
                                  </div>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={handlePurchase}
                                    disabled={purchasing}
                                    className="gap-2"
                                  >
                                    {purchasing ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-4 h-4" />
                                        Buy PDF
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="border-2 hover:border-primary/50 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">Better reading experience</p>
                                    <p className="text-sm text-muted-foreground">
                                      Use the reader view for comfort
                                    </p>
                                  </div>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => {
                                      if (isAuthenticated) {
                                        handleReadTextBook();
                                      } else {
                                        navigate('/auth');
                                      }
                                    }}
                                    className="gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Reader View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews">
                    <Card className="border-2">
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          {/* Rating Summary */}
                          <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                              <span className="text-3xl font-bold">
                                {(book.averageRating || 0).toFixed(1)}
                              </span>
                            </div>
                            <div className="flex justify-center mb-3">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-6 h-6 ${
                                    star <= Math.floor(book.averageRating || 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Customer Reviews</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              This book has an average rating of {(book.averageRating || 0).toFixed(1)} 
                              from {book.reviewCount || 0} reviews.
                            </p>
                            <div className="flex gap-3 justify-center">
                              <Button onClick={() => setShowRatingModal(true)}>
                                <Star className="w-4 h-4 mr-2" />
                                Add Your Review
                              </Button>
                              <Button variant="outline">
                                Read All Reviews
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {/* Reading Formats */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    Available Formats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border-2 rounded-xl hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <BookOpen className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Text Version</p>
                          <p className="text-sm text-muted-foreground">Read online for free</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        FREE
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center p-4 border-2 rounded-xl hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">PDF Version</p>
                          <p className="text-sm text-muted-foreground">Download and keep</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(discountedPrice, book.currency || 'PKR')}
                        </p>
                        {hasPurchased && (
                          <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                            PURCHASED
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Book Stats */}
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    Book Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 hover:bg-secondary/20 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Views
                      </span>
                      <span className="font-medium">{book.viewCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-secondary/20 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Downloads
                      </span>
                      <span className="font-medium">{book.downloadCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-secondary/20 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" />
                        Purchases
                      </span>
                      <span className="font-medium">{book.purchaseCount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 hover:bg-secondary/20 rounded-lg transition-colors">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Upload Date
                      </span>
                      <span className="font-medium">
                        {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {showLightbox && validImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh]">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
              onClick={() => setShowLightbox(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            {hasMultipleImages && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={prevImage}
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={nextImage}
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            
            <BookImage
              src={validImages[selectedImageIndex]}
              alt={`${book.title} - Full View`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            
            {hasMultipleImages && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {validImages.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      selectedImageIndex === index 
                        ? 'bg-white scale-125' 
                        : 'bg-white/50 hover:bg-white/80'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-2 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Rate this Book
              </CardTitle>
              <CardDescription>
                Share your experience with other readers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Star Rating */}
                <div className="flex justify-center gap-1 py-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none transform hover:scale-125 transition-transform duration-200"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= (hoverRating || userRating)
                            ? "text-yellow-400 fill-current drop-shadow-lg"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                
                {/* Rating Labels */}
                <div className="text-center text-sm text-muted-foreground">
                  {userRating === 0 && "Select your rating"}
                  {userRating === 1 && "Poor"}
                  {userRating === 2 && "Fair"}
                  {userRating === 3 && "Good"}
                  {userRating === 4 && "Very Good"}
                  {userRating === 5 && "Excellent"}
                </div>
                
                {/* Comment Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Optional Comment</label>
                  <Textarea
                    placeholder="Share your thoughts about this book..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </CardContent>
            <CardContent className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRatingModal(false);
                  setUserRating(0);
                  setRatingComment("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRatingSubmit}
                disabled={userRating === 0 || submittingRating}
                className="gap-2"
              >
                {submittingRating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Submit Rating
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BookDetail;