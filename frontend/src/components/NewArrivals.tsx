import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockBooks } from "@/data/mockBooks";
import { useMemo } from "react";

const NewArrivals = () => {
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
  
  // Only show approved books to users
  const approvedBooks = useMemo(() => 
    mockBooks.filter(book => book.approved !== false).slice(0, 4), 
    []
  );

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">NEW ARRIVALS</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          <Button 
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
            size="sm"
          >
            All
          </Button>
          <Button 
            variant={activeTab === "cook" ? "default" : "outline"}
            onClick={() => setActiveTab("cook")}
            size="sm"
          >
            Cook Book
          </Button>
          <Button 
            variant={activeTab === "history" ? "default" : "outline"}
            onClick={() => setActiveTab("history")}
            size="sm"
          >
            History
          </Button>
          <Button 
            variant={activeTab === "fantasy" ? "default" : "outline"}
            onClick={() => setActiveTab("fantasy")}
            size="sm"
          >
            Fantasy
          </Button>
          <Button 
            variant={activeTab === "romance" ? "default" : "outline"}
            onClick={() => setActiveTab("romance")}
            size="sm"
          >
            Romance
          </Button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {approvedBooks.map((book) => (
            <div key={book.id} className="group cursor-pointer" onClick={() => navigate(`/book/${book.id}`)}>
              <div className="relative mb-4 overflow-hidden rounded-lg">
                {book.originalPrice && (
                  <Badge className="absolute top-4 left-4 z-10 bg-primary">
                    SALE
                  </Badge>
                )}
                <img 
                  src={book.image} 
                  alt={book.title}
                  className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{book.author}</p>
                <h3 className="font-semibold mb-2 line-clamp-2">{book.title}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-primary">₹{book.price.toFixed(2)}</span>
                  {book.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">₹{book.originalPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewArrivals;
