import { Button } from "./ui/button";
import { Package, Lock, Tag, RotateCcw } from "lucide-react";
import lawBooks1 from "@/assets/law-books-1.jpg";
import lawBooks2 from "@/assets/law-books-2.jpg";
import lawBooks3 from "@/assets/law-books-3.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const HeroSection = () => {
  const slides = [
    {
      badge: "Legal Expertise",
      title: "Professional Law Books Collection",
      description: "Comprehensive legal resources including constitutional law, case studies, and legal proceedings. Essential reading for legal professionals and students.",
      image: lawBooks1,
      imageAlt: "Professional law books with scales of justice and gavel"
    },
    {
      badge: "Legal Education",
      title: "Constitutional & Statute Law",
      description: "Explore our extensive collection of constitutional law books, legal documents, and authoritative legal references for your practice or studies.",
      image: lawBooks2,
      imageAlt: "Constitutional law books with judge's gavel and legal documents"
    },
    {
      badge: "Legal Library",
      title: "Complete Legal Reference Collection",
      description: "From legal textbooks to statute books, build your comprehensive legal library with our prestigious collection of law resources.",
      image: lawBooks3,
      imageAlt: "Legal textbooks with Lady Justice statue in law library"
    }
  ];

  return (
    <section className="relative overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="container mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6 animate-fade-in">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">
                      {slide.badge}
                    </p>
                    <h2 className="text-5xl font-bold leading-tight">
                      {slide.title.includes("Professional") ? (
                        <>
                          Professional <span className="text-primary">Law Books</span> Collection
                        </>
                      ) : slide.title.includes("Constitutional") ? (
                        <>
                          <span className="text-primary">Constitutional</span> & Statute Law
                        </>
                      ) : (
                        <>
                          Complete <span className="text-primary">Legal Reference</span> Collection
                        </>
                      )}
                    </h2>
                    <p className="text-muted-foreground max-w-md">
                      {slide.description}
                    </p>
                    <Button size="lg" className="mt-6">
                      Shop Now
                    </Button>
                  </div>
                  
                  <div className="relative animate-scale-in">
                    <img 
                      src={slide.image} 
                      alt={slide.imageAlt}
                      className="w-full rounded-lg shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Features Bar */}
      <div className="bg-background border-t border-b py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <Package className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-sm uppercase">Free Shipping</h3>
                <p className="text-xs text-muted-foreground">Order over $100</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Lock className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-sm uppercase">Secure Payment</h3>
                <p className="text-xs text-muted-foreground">100% Secure Payment</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Tag className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-sm uppercase">Best Price</h3>
                <p className="text-xs text-muted-foreground">Guaranteed Price</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <RotateCcw className="h-10 w-10 text-primary" />
              <div>
                <h3 className="font-semibold text-sm uppercase">Free Returns</h3>
                <p className="text-xs text-muted-foreground">Within 30 Days returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;