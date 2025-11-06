import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockBooks } from "@/data/mockBooks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, ShoppingCart, Heart, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const book = mockBooks.find((b) => b.id === Number(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!book) {
    return <div>Book not found</div>;
  }

  const handleAddToCart = () => {
    toast({ title: "Added to cart", description: `${book.title} has been added to your cart` });
  };

  const handleAddToWishlist = () => {
    toast({ title: "Added to wishlist", description: `${book.title} has been added to your wishlist` });
  };

  const handleBuyNow = () => {
    toast({ title: "Redirecting to checkout", description: "Processing your order..." });
  };

  // Mock additional images
  const bookImages = [book.image, book.image, book.image];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Left side - Images */}
          <div>
            <div className="mb-4">
              <img
                src={bookImages[selectedImage]}
                alt={book.title}
                className="w-full h-[500px] object-cover rounded-lg shadow-lg"
              />
            </div>
            <div className="flex gap-2">
              {bookImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-24 h-32 border-2 rounded overflow-hidden ${
                    selectedImage === idx ? "border-primary" : "border-border"
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">{book.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">by {book.author}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(book.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({book.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">₹{book.price.toFixed(2)}</span>
                {book.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{book.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm font-medium">Formats:</span>
                  {book.formats.map((format) => (
                    <Badge key={format} variant="secondary">{format}</Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Language:</span> {book.language}</div>
                  <div><span className="font-medium">Pages:</span> {book.pages}</div>
                  <div><span className="font-medium">Publisher:</span> {book.publisher}</div>
                  <div><span className="font-medium">Publication:</span> {book.publicationDate}</div>
                  <div><span className="font-medium">ISBN:</span> {book.isbn}</div>
                  <div><span className="font-medium">Category:</span> {book.category}</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.min(book.quantity, quantity + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button onClick={handleAddToWishlist} variant="outline">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                </div>
                <Button onClick={handleBuyNow} variant="secondary" className="w-full">
                  Buy It Now
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className={book.inStock ? "text-green-600" : "text-red-600"}>
                  {book.inStock ? `✓ In stock` : "Out of stock"}
                </span>
                <span className="text-muted-foreground">• {book.quantity} available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Information</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">About This Book</h3>
                <p className="text-muted-foreground leading-relaxed">{book.description}</p>
                <div className="mt-6 space-y-2">
                  <p className="font-medium">Key Features:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Comprehensive coverage of {book.category.toLowerCase()}</li>
                    <li>Written by leading expert {book.author}</li>
                    <li>Updated with latest legal precedents and cases</li>
                    <li>Includes practical examples and case studies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Shipping Information</h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>We offer a secure and convenient shipping policy. Orders placed before noon are dispatched on the same day.</p>
                  <div className="space-y-2">
                    <p><span className="font-medium text-foreground">Standard Delivery:</span> 5-7 business days</p>
                    <p><span className="font-medium text-foreground">Express Delivery:</span> 2-3 business days</p>
                    <p><span className="font-medium text-foreground">Shipping Cost:</span> Calculated at checkout</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="font-medium">Excellent Resource</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This book is an invaluable resource for anyone studying {book.category.toLowerCase()}. 
                      The explanations are clear and the case studies are highly relevant.
                    </p>
                  </div>
                  <div className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      <span className="font-medium">Great for professionals</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive and well-organized. A must-have for legal professionals and students alike.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Best Sellers */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Best Sellers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mockBooks.slice(0, 4).map((b) => (
              <Card
                key={b.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/book/${b.id}`)}
              >
                <CardContent className="p-4">
                  <img src={b.image} alt={b.title} className="w-full h-32 object-cover rounded mb-2" />
                  <p className="text-sm font-medium line-clamp-2">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookDetail;
