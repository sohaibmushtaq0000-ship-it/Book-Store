// components/book-shop/BookShop.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, CheckCircle, XCircle, Filter, Search, Star, Download, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookService, Book } from "@/services/bookService";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const BookShop = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [pendingBooks, setPendingBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showMyBooksOnly, setShowMyBooksOnly] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    author: "",
    price: "",
    description: "",
    category: "",
    language: "",
    totalPages: "",
    discountPercentage: "0",
    featured: false,
    bestseller: false,
    newRelease: false,
    currency: "USD",
    authorBio: "",
    publisher: "",
    publicationYear: "",
    edition: "",
    isbn: "",
    previewPages: "",
    tags: "",
    metaDescription: "",
    subcategory: ""
  });

  // Fetch books on component mount and when tab changes
  useEffect(() => {
    fetchBooks();
  }, [activeTab, statusFilter]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      
      if (activeTab === "pending") {
        const response = await BookService.getPendingBooks(1, 50);
        if (response.success && response.data) {
          setPendingBooks(response.data.books || []);
        }
      } else {
        const response = await BookService.getAllBooks({ 
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 50 
        });
        
        if (response.success && response.data) {
          setBooks(response.data.books || []);
        }
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast({
        title: "Error",
        description: "Failed to load books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter books to show only superadmin's books
  const getFilteredBooks = () => {
    let filtered = books.filter(book => 
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showMyBooksOnly && user) {
      filtered = filtered.filter(book => book.uploader?._id === user.id);
    }

    return filtered;
  };

  const getFilteredPendingBooks = () => {
    let filtered = pendingBooks.filter(book => 
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (showMyBooksOnly && user) {
      filtered = filtered.filter(book => book.uploader?._id === user.id);
    }

    return filtered;
  };

  const isMyBook = (book: Book) => {
    return user && book.uploader?._id === user.id;
  };

  const getMyBooksCount = () => {
    if (!user) return 0;
    return books.filter(book => book.uploader?._id === user.id).length;
  };

  const getMyPendingBooksCount = () => {
    if (!user) return 0;
    return pendingBooks.filter(book => book.uploader?._id === user.id).length;
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setEditForm({
      title: book.title || "",
      author: book.author || "",
      price: book.price?.toString() || "",
      description: book.description || "",
      category: book.category || "",
      language: book.language || "",
      totalPages: book.totalPages?.toString() || "",
      discountPercentage: book.discountPercentage?.toString() || "0",
      featured: book.featured || false,
      bestseller: book.bestseller || false,
      newRelease: book.newRelease || false,
      currency: book.currency || "USD",
      authorBio: book.authorBio || "",
      publisher: book.publisher || "",
      publicationYear: book.publicationYear || "",
      edition: book.edition || "",
      isbn: book.isbn || "",
      tags: book.tags || "",
      metaDescription: book.metaDescription || "",
      subcategory: book.subcategory || ""
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (book: Book) => {
    setSelectedBook(book);
    setDeleteDialogOpen(true);
  };

  const handlePreview = (book: Book) => {
    setSelectedBook(book);
    setPreviewDialogOpen(true);
  };

  const handleApprove = async (book: Book) => {
    try {
      const response = await BookService.approveBook(book._id);
      
      if (response.success) {
        toast({
          title: "Book Approved",
          description: `"${book.title}" has been approved and published`,
          variant: "default",
        });
        
        // Remove from pending list and add to approved list
        setPendingBooks(prev => prev.filter(b => b._id !== book._id));
        if (response.data?.book) {
          setBooks(prev => [response.data.book, ...prev]);
        }
      }
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve book",
        variant: "destructive",
      });
    }
  };

  const handleReject = (book: Book) => {
    setSelectedBook(book);
    setRejectDialogOpen(true);
  };

  const confirmReject = async () => {
    if (!selectedBook || !rejectionReason.trim()) return;

    try {
      const response = await BookService.rejectBook(selectedBook._id, rejectionReason);
      
      if (response.success) {
        toast({
          title: "Book Rejected",
          description: `"${selectedBook.title}" has been rejected`,
          variant: "default",
        });
        
        // Remove from pending list
        setPendingBooks(prev => prev.filter(book => book._id !== selectedBook._id));
        setRejectDialogOpen(false);
        setSelectedBook(null);
        setRejectionReason("");
      }
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject book",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedBook) return;

    try {
      const response = await BookService.deleteBook(selectedBook._id);
      
      if (response.success) {
        toast({
          title: "Book Deleted",
          description: `"${selectedBook.title}" has been deleted successfully`,
          variant: "default",
        });
        
        // Remove book from local state
        if (activeTab === "pending") {
          setPendingBooks(prev => prev.filter(book => book._id !== selectedBook._id));
        } else {
          setBooks(prev => prev.filter(book => book._id !== selectedBook._id));
        }
        setDeleteDialogOpen(false);
        setSelectedBook(null);
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete book",
        variant: "destructive",
      });
    }
  };

const handleUpdateBook = async () => {
  if (!selectedBook) return;

  try {
    const formData = new FormData();
    
    // Append updated fields with proper formatting
    Object.entries(editForm).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert booleans to strings
        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Log what we're sending
    console.log("=== FRONTEND: Sending FormData ===");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const response = await BookService.updateBook(selectedBook._id, formData);
    
    if (response.success && response.data?.book) {
      toast({
        title: "Book Updated",
        description: `"${selectedBook.title}" has been updated successfully`,
        variant: "default",
      });
      
      // Update book in local state
      if (activeTab === "pending") {
        setPendingBooks(prev => prev.map(book => 
          book._id === selectedBook._id 
            ? { ...book, ...response.data!.book }
            : book
        ));
      } else {
        setBooks(prev => prev.map(book => 
          book._id === selectedBook._id 
            ? { ...book, ...response.data!.book }
            : book
        ));
      }
      
      setEditDialogOpen(false);
      setSelectedBook(null);
    }
  } catch (error: any) {
    console.error("Update error:", error);
    toast({
      title: "Update Failed",
      description: error.response?.data?.message || error.message || "Failed to update book",
      variant: "destructive",
    });
  }
};

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    book: Book
  ) => {
    const target = e.currentTarget;
    target.src = "/placeholder-book.png";
    target.alt = "Placeholder book cover";
  };

  const getCurrentImage = (book: Book) => {
    return book.coverImages?.[0] || "/placeholder-book.png";
  };

  const getImageAlt = (book: Book) => {
    return book.title || "Book Cover";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, label: "Pending", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
      approved: { variant: "default" as const, label: "Published", className: "bg-green-100 text-green-800 hover:bg-green-100" },
      rejected: { variant: "destructive" as const, label: "Rejected", className: "bg-red-100 text-red-800 hover:bg-red-100" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  const getFeaturedBadge = (featured: boolean) => {
    return featured ? <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">⭐ Featured</Badge> : null;
  };

  const getBestsellerBadge = (bestseller: boolean) => {
    return bestseller ? <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">🔥 Bestseller</Badge> : null;
  };

  const getNewReleaseBadge = (newRelease: boolean) => {
    return newRelease ? <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">🆕 New</Badge> : null;
  };

  const getMyBookBadge = (book: Book) => {
    return isMyBook(book) ? (
      <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
        <BookOpen className="h-3 w-3 mr-1" />
        My Book
      </Badge>
    ) : null;
  };

  const formatPrice = (book: Book) => {
    const price = book.discountedPrice || book.price;
    const currency = book.currency || "USD";
    
    if (book.discountPercentage && book.discountPercentage > 0) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-green-600">
            {currency} {price}
          </span>
          <span className="text-sm line-through text-gray-500">
            {currency} {book.price}
          </span>
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs">
            -{book.discountPercentage}%
          </Badge>
        </div>
      );
    }
    
    return (
      <span className="text-lg font-bold text-gray-900">
        {currency} {price}
      </span>
    );
  };

  const filteredBooks = getFilteredBooks();
  const filteredPendingBooks = getFilteredPendingBooks();


  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-primary bg-clip-text text-transparent">
            Book Shop Management
          </h2>
          <p className="text-muted-foreground">Manage all books in the system</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search books by title, author, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 focus:border-purple-300 transition-colors"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] border-2">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* My Books Filter */}
        {user && (
          <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border">
            <Switch
              checked={showMyBooksOnly}
              onCheckedChange={setShowMyBooksOnly}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label className="flex items-center gap-2 cursor-pointer">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Show only my books
              {showMyBooksOnly && (
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  {activeTab === "all" ? getMyBooksCount() : getMyPendingBooksCount()} books
                </Badge>
              )}
            </Label>
          </div>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-muted/50 p-1">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            All Books ({showMyBooksOnly ? filteredBooks.length : books.length})
            {/* {getMyBooksCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                {getMyBooksCount()} mine
              </Badge>
            )} */}
          </TabsTrigger>
          <TabsTrigger 
            value="pending"
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
          >
            Pending ({showMyBooksOnly ? filteredPendingBooks.length : pendingBooks.length})
            {getMyPendingBooksCount() > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-700">
                {getMyPendingBooksCount()} mine
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <Card 
                key={book._id} 
                className={`group relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  isMyBook(book) 
                    ? 'border-blue-300 hover:border-blue-400 bg-blue-50/30' 
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                {/* Badge Container */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(book.status || "pending")}
                    {getMyBookBadge(book)}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getFeaturedBadge(book.featured || false)}
                    {getBestsellerBadge(book.bestseller || false)}
                    {getNewReleaseBadge(book.newRelease || false)}
                  </div>
                </div>

                <CardHeader className="p-0 relative">
                  <div className="relative overflow-hidden">
                    <img
                      src={getCurrentImage(book)}
                      alt={getImageAlt(book)}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, book)}
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 transition-colors duration-300 ${
                      isMyBook(book) 
                        ? 'bg-blue-500/0 group-hover:bg-blue-500/10' 
                        : 'bg-black/0 group-hover:bg-black/10'
                    }`} />
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-3">
                  <CardTitle className={`text-lg leading-tight line-clamp-2 transition-colors ${
                    isMyBook(book) 
                      ? 'group-hover:text-blue-600' 
                      : 'group-hover:text-purple-600'
                  }`}>
                    {book.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="line-clamp-1">{book.author}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {formatPrice(book)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{book.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{book.downloadCount || 0}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {book.category}
                    </Badge>
                  </div>

                  {book.uploader && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Uploaded by: {book.uploader.firstName} {book.uploader.lastName}
                      {isMyBook(book) && (
                        <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePreview(book)}
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(book)}
                    className={`flex-1 transition-colors ${
                      isMyBook(book)
                        ? 'hover:bg-green-50 hover:text-green-600 border-green-200'
                        : 'hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(book)}
                    className={`flex-1 transition-colors ${
                      isMyBook(book)
                        ? 'hover:bg-red-50 hover:text-red-600 border-red-200'
                        : 'hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredBooks.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                {showMyBooksOnly ? "No books found in your collection" : "No books found"}
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setShowMyBooksOnly(false);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPendingBooks.map((book) => (
              <Card 
                key={book._id} 
                className={`group relative overflow-hidden border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  isMyBook(book)
                    ? 'border-blue-300 hover:border-blue-400 bg-blue-50/30'
                    : 'border-yellow-200 hover:border-yellow-300 bg-yellow-50/30'
                }`}
              >
                {/* Badge Container */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(book.status || "pending")}
                    {getMyBookBadge(book)}
                  </div>
                  <Badge className={`${isMyBook(book) ? 'bg-blue-500' : 'bg-yellow-500'} text-white border-0`}>
                    Awaiting Review
                  </Badge>
                </div>

                <CardHeader className="p-0 relative">
                  <div className="relative overflow-hidden">
                    <img
                      src={getCurrentImage(book)}
                      alt={getImageAlt(book)}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => handleImageError(e, book)}
                      crossOrigin="anonymous"
                      loading="lazy"
                    />
                    <div className={`absolute inset-0 transition-colors duration-300 ${
                      isMyBook(book)
                        ? 'bg-blue-500/0 group-hover:bg-blue-500/10'
                        : 'bg-yellow-500/0 group-hover:bg-yellow-500/10'
                    }`} />
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 space-y-3">
                  <CardTitle className={`text-lg leading-tight line-clamp-2 transition-colors ${
                    isMyBook(book)
                      ? 'group-hover:text-blue-600'
                      : 'group-hover:text-yellow-600'
                  }`}>
                    {book.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span className="line-clamp-1">{book.author}</span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className={`font-bold ${isMyBook(book) ? 'text-blue-600' : 'text-yellow-600'}`}>
                        {book.currency} {book.price}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <span className="text-xs">
                        {new Date(book.createdAt || "").toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {book.uploader && (
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Uploaded by: {book.uploader.firstName} {book.uploader.lastName}
                      {isMyBook(book) && (
                        <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handlePreview(book)}
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(book)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleReject(book)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredPendingBooks.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                showMyBooksOnly ? 'bg-blue-50' : 'bg-yellow-50'
              }`}>
                <CheckCircle className={`h-8 w-8 ${showMyBooksOnly ? 'text-blue-500' : 'text-yellow-500'}`} />
              </div>
              <p className="text-muted-foreground">
                {showMyBooksOnly 
                  ? "No pending books found in your collection" 
                  : "No pending books for approval"
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {showMyBooksOnly 
                  ? "All your books have been reviewed" 
                  : "All books have been reviewed"
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Book Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Book - {selectedBook?.title}
            </DialogTitle>
            <DialogDescription>
              Update the book information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Book title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={editForm.author}
                  onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Book description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorBio">Author Bio</Label>
              <Textarea
                id="authorBio"
                value={editForm.authorBio}
                onChange={(e) => setEditForm({...editForm, authorBio: e.target.value})}
                placeholder="Author biography"
                rows={2}
              />
            </div>

            {/* Book Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  placeholder="e.g., Fiction, Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={editForm.subcategory}
                  onChange={(e) => setEditForm({...editForm, subcategory: e.target.value})}
                  placeholder="e.g., Fantasy, Physics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={editForm.language}
                  onChange={(e) => setEditForm({...editForm, language: e.target.value})}
                  placeholder="e.g., English, Spanish"
                />
              </div>
            </div>

            {/* Publishing Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={editForm.publisher}
                  onChange={(e) => setEditForm({...editForm, publisher: e.target.value})}
                  placeholder="Publisher name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publicationYear">Publication Year</Label>
                <Input
                  id="publicationYear"
                  type="number"
                  value={editForm.publicationYear}
                  onChange={(e) => setEditForm({...editForm, publicationYear: e.target.value})}
                  placeholder="2024"
                  min="1900"
                  max="2030"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edition">Edition</Label>
                <Input
                  id="edition"
                  value={editForm.edition}
                  onChange={(e) => setEditForm({...editForm, edition: e.target.value})}
                  placeholder="e.g., First Edition"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                  placeholder="0.00"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={editForm.currency} 
                  onValueChange={(value) => setEditForm({...editForm, currency: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount %</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={editForm.discountPercentage}
                  onChange={(e) => setEditForm({...editForm, discountPercentage: e.target.value})}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Book Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input
                  id="isbn"
                  value={editForm.isbn}
                  onChange={(e) => setEditForm({...editForm, isbn: e.target.value})}
                  placeholder="ISBN number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalPages">Total Pages</Label>
                <Input
                  id="totalPages"
                  type="number"
                  value={editForm.totalPages}
                  onChange={(e) => setEditForm({...editForm, totalPages: e.target.value})}
                  placeholder="0"
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="previewPages">Preview Pages</Label>
                <Input
                  id="previewPages"
                  value={editForm.previewPages}
                  onChange={(e) => setEditForm({...editForm, previewPages: e.target.value})}
                  placeholder='e.g., [1, 2, 3] or "1-5"'
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                placeholder="Comma-separated tags (e.g., fiction, fantasy, adventure)"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple tags with commas
              </p>
            </div>

            {/* SEO & Metadata */}
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={editForm.metaDescription}
                onChange={(e) => setEditForm({...editForm, metaDescription: e.target.value})}
                placeholder="SEO meta description for search engines"
                rows={2}
              />
            </div>

            {/* Flags */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Featured</Label>
                <Select 
                  value={editForm.featured.toString()} 
                  onValueChange={(value) => setEditForm({...editForm, featured: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bestseller</Label>
                <Select 
                  value={editForm.bestseller.toString()} 
                  onValueChange={(value) => setEditForm({...editForm, bestseller: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>New Release</Label>
                <Select 
                  value={editForm.newRelease.toString()} 
                  onValueChange={(value) => setEditForm({...editForm, newRelease: value === 'true'})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBook}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Book
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Reject Book
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{selectedBook?.title}".
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="border-2 focus:border-red-300"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedBook?.title}
            </DialogTitle>
            <DialogDescription>
              by {selectedBook?.author}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={selectedBook ? getCurrentImage(selectedBook) : "/placeholder-book.png"}
                  alt={selectedBook ? getImageAlt(selectedBook) : "Book Cover"}
                  className="w-48 h-64 object-cover rounded-lg shadow-lg"
                  onError={(e) => selectedBook && handleImageError(e, selectedBook)}
                  crossOrigin="anonymous"
                  loading="lazy"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getStatusBadge(selectedBook?.status || 'pending')}
                  {getFeaturedBadge(selectedBook?.featured || false)}
                  {getBestsellerBadge(selectedBook?.bestseller || false)}
                  {getNewReleaseBadge(selectedBook?.newRelease || false)}
                  {selectedBook && isMyBook(selectedBook) && (
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">
                      <BookOpen className="h-3 w-3 mr-1" />
                      My Book
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedBook?.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <strong>Category:</strong> 
                      <span>{selectedBook?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Language:</strong> 
                      <span>{selectedBook?.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Pages:</strong> 
                      <span>{selectedBook?.totalPages}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Price:</strong> 
                      <span>{selectedBook?.currency} {selectedBook?.price}</span>
                      {selectedBook?.discountPercentage && selectedBook.discountPercentage > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-xs ml-2">
                          -{selectedBook.discountPercentage}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <strong>Views:</strong> 
                      <span>{selectedBook?.viewCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Downloads:</strong> 
                      <span>{selectedBook?.downloadCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>Publisher:</strong> 
                      <span>{selectedBook?.publisher || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <strong>ISBN:</strong> 
                      <span>{selectedBook?.isbn || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {selectedBook?.uploader && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-sm">
                      <strong>Uploaded by:</strong>
                      <div className="flex items-center gap-2">
                        <span>{selectedBook.uploader.firstName} {selectedBook.uploader.lastName}</span>
                        {isMyBook(selectedBook) && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Uploaded on:</span>
                      <span>{new Date(selectedBook.createdAt || "").toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookShop;