// components/NewArrivals.tsx
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookService, Book, PopularCategory } from "@/services/bookService";
import { Loader2,BookOpen } from "lucide-react";

const NewArrivals = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<PopularCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNewReleases();
    fetchCategories();
  }, []);

  const fetchNewReleases = async () => {
    try {
      setLoading(true);
      const response = await BookService.getNewReleases(8);

      if (response?.success && response?.data?.books) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error("Error fetching new releases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await BookService.getPopularCategories();
      if (response?.success && Array.isArray(response?.data)) {
        setCategories(response.data.slice(0, 4));
      } else {
        setCategories([
          { _id: "fiction", name: "Fiction", bookCount: 0, totalViews: 0 },
          { _id: "non-fiction", name: "Non-Fiction", bookCount: 0, totalViews: 0 },
          { _id: "science", name: "Science", bookCount: 0, totalViews: 0 },
          { _id: "technology", name: "Technology", bookCount: 0, totalViews: 0 }
        ]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchBooksByCategory = async (category: string) => {
    try {
      setLoading(true);
      const response = await BookService.getBooksByCategory(category, 1, 8);
      if (response?.success && response?.data?.books) {
        setBooks(response.data.books);
      }
    } catch (error) {
      console.error("Error fetching books by category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "all") {
      fetchNewReleases();
    } else {
      fetchBooksByCategory(tab);
    }
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
    book: Book
  ) => {
    e.currentTarget.src = "placeholder-book.png";
    e.currentTarget.alt = "Placeholder book cover";
  };

  const getCurrentImage = (book: Book) => {
    return book.coverImages?.[0] || "/placeholder-book.png";
  };

  const getImageAlt = (book: Book) => {
    return book.title || "Book Cover";
  };

  if (loading || categoriesLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-2">NEW ARRIVALS</h2>
          <div className="w-16 h-1 bg-primary mx-auto mb-8"></div>
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-muted-foreground">Loading books...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
    <div className="text-center mb-12">
      <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-4" />
      <h2 className="text-4xl font-bold mb-2 text-amber-900">NEW ARRIVALS</h2>
      <p className="text-amber-600 mb-4">Latest Books & Publications</p>
      <div className="w-16 h-1 bg-amber-600 mx-auto"></div>
    </div>


        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => handleTabChange("all")}
            size="sm"
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category._id}
              variant={activeTab === category._id ? "default" : "outline"}
              onClick={() => handleTabChange(category._id)}
              size="sm"
            >
              {category.name ||
                category._id.charAt(0).toUpperCase() + category._id.slice(1)}
            </Button>
          ))}
        </div>

        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.slice(0, 4).map((book) => (
              <div
                key={book._id}
                className="group cursor-pointer bg-card rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
                onClick={() => navigate(`/book/${book._id}`)}
              >
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  {book.newRelease && (
                    <Badge className="absolute top-4 right-4 z-10 bg-green-500">
                      NEW
                    </Badge>
                  )}

                  <img
                    src={getCurrentImage(book)}
                    alt={getImageAlt(book)}
                    className="w-full aspect-[3/4] object-cover transition-all duration-500"
                    onError={(e) => handleImageError(e, book)}
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {book.author || "Unknown Author"}
                  </p>
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                    {book.title || "Untitled"}
                  </h3>

                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-primary">
                      {book.currency || "$"}{" "}
                      {(book.discountedPrice ?? book.price ?? 0).toFixed(2)}
                    </span>
                    {book.discountedPrice &&
                      book.discountedPrice < book.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {book.currency || "$"}{" "}
                          {(book.price ?? 0).toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {books.slice(4, 8).map((book) => (
              <div
                key={book._id}
                className="group cursor-pointer bg-card rounded-lg p-4 hover:shadow-lg transition-shadow duration-300"
                onClick={() => navigate(`/book/${book._id}`)}
              >
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  {book.newRelease && (
                    <Badge className="absolute top-4 right-4 z-10 bg-green-500">
                      NEW
                    </Badge>
                  )}

                  <img
                    src={getCurrentImage(book)}
                    alt={getImageAlt(book)}
                    className="w-full aspect-[3/4] object-cover transition-all duration-500"
                    onError={(e) => handleImageError(e, book)}
                    crossOrigin="anonymous"
                    loading="lazy"
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                    {book.author || "Unknown Author"}
                  </p>
                  <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem] flex items-center justify-center">
                    {book.title || "Untitled"}
                  </h3>

                  <div className="flex items-center justify-center gap-2">
                    <span className="font-bold text-primary">
                      {book.currency || "$"}{" "}
                      {(book.discountedPrice ?? book.price ?? 0).toFixed(2)}
                    </span>
                    {book.discountedPrice &&
                      book.discountedPrice < book.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {book.currency || "$"}{" "}
                          {(book.price ?? 0).toFixed(2)}
                        </span>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {books.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No books found in this category.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => handleTabChange("all")}
            >
              View All Books
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
