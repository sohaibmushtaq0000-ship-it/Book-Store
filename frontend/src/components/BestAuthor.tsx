import { Facebook, Instagram, Twitter } from "lucide-react";
import { FaTwitter } from "react-icons/fa";
import author from "@/assets/author.jpg";
import book1 from "@/assets/book1.jpg";
import book2 from "@/assets/book2.jpg";

const BestAuthor = () => {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-2">BEST AUTHOR OF THE WEEK</h2>
          <div className="w-16 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {/* Book 1 */}
          <div className="text-center">
            <img src={book1} alt="Book" className="w-full max-w-[200px] mx-auto mb-4 rounded shadow-lg" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">SAGE ISAIAS</p>
            <h3 className="font-semibold">Girls at the Golden City</h3>
            <p className="text-primary font-bold">Rs.3,443.25</p>
          </div>

          {/* Book 2 */}
          <div className="text-center">
            <img src={book2} alt="Book" className="w-full max-w-[200px] mx-auto mb-4 rounded shadow-lg" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">JAMES DYLAN</p>
            <h3 className="font-semibold">Vistit in the North</h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-primary font-bold">Rs.2,869.37</span>
              <span className="text-sm text-muted-foreground line-through">Rs.3,173.44</span>
            </div>
          </div>

          {/* Author */}
          <div className="text-center">
            <img src={author} alt="Author" className="w-full max-w-[250px] mx-auto mb-4 rounded shadow-lg" />
            <h3 className="text-xl font-bold mb-2">Dwayne Johnson <span className="text-sm font-normal text-muted-foreground">- author</span></h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
              Pellentesque posuere eros lobortis scelerisque blandit. Donec id tellus lacinia an tincidual risus ac, consequat velit.
            </p>
            
            <div className="mb-4">
              <h4 className="font-semibold mb-3">My Awards</h4>
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="bg-shop-gold/10 rounded-full p-3">
                    <div className="w-12 h-12 mx-auto bg-shop-gold/20 rounded-full flex items-center justify-center text-xs font-bold">
                      #{i}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-foreground text-background rounded flex items-center justify-center hover:bg-primary">
                <FaTwitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-foreground text-background rounded flex items-center justify-center hover:bg-primary">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-foreground text-background rounded flex items-center justify-center hover:bg-primary">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestAuthor;
