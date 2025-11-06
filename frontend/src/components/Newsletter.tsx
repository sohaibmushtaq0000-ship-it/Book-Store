import { Button } from "./ui/button";
import { Input } from "./ui/input";

const Newsletter = () => {
  return (
    <section className="py-16 bg-muted border-t">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-primary">SUBSCRIBE TO OUR NEWS LETTER</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email address to receive regular updates, as well as news on upcoming events and specific offers.
              </p>
            </div>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Email Address" 
                className="flex-1"
              />
              <Button variant="default" className="bg-foreground hover:bg-foreground/90">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
