import { Badge } from "./ui/badge";
import book5 from "@/assets/book5.jpg";
import book6 from "@/assets/book6.jpg";
import book3 from "@/assets/book3.jpg";
import book7 from "@/assets/book7.jpg";

const deals = [
  { id: 1, title: "Beauty of Structures", author: "JAYDEN JUDAH", price: "Rs.14,021.37", image: book5, badge: "#1 NEW YORK TIMES BEST SELLING BOOK" },
  { id: 2, title: "The Red Desert", author: "SAGE ISAIAS", price: "Rs.11,477.50", oldPrice: "Rs.13,444.82", sale: "15%", image: book6 },
  { id: 3, title: "The Stadium by Night", author: "ERIK MARTIN", price: "Rs.10,042.81", badge: "NEW TIME BESTSELLER", image: book3 },
  { id: 4, title: "Adventurous Eating", author: "JAMES DYLAN", price: "Rs.5,726.75", image: book7 },
];

const DailyDeals = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">DAILY DEALS</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {deals.map((deal) => (
            <div key={deal.id} className="group cursor-pointer bg-background rounded-lg overflow-hidden shadow-lg">
              <div className="relative">
                {deal.badge && (
                  <Badge className="absolute top-4 left-4 z-10 bg-shop-gold text-foreground">
                    {deal.badge}
                  </Badge>
                )}
                {deal.sale && (
                  <Badge className="absolute top-4 left-4 z-10 bg-primary">
                    {deal.sale}
                  </Badge>
                )}
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">{deal.author}</p>
                <h3 className="font-semibold mb-2">{deal.title}</h3>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold text-primary">{deal.price}</span>
                  {deal.oldPrice && (
                    <span className="text-sm text-muted-foreground line-through">{deal.oldPrice}</span>
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

export default DailyDeals;
