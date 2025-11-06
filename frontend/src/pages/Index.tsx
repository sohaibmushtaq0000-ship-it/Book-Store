import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import BookFestival from "@/components/BookFestival";
import BestAuthor from "@/components/BestAuthor";
import SpecialOffers from "@/components/SpecialOffers";
import DailyDeals from "@/components/DailyDeals";
import LatestNews from "@/components/LatestNews";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <NewArrivals />
        <BookFestival />
        <BestAuthor />
        <SpecialOffers />
        <DailyDeals />
        <LatestNews />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
