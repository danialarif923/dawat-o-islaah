import { Outlet } from "react-router-dom";
import Header from "../components/AppComponents/Header";
import Footer from "../components/AppComponents/Footer";
import HeaderBanner from "../components/AppComponents/Banner/HeaderBanner";
import FooterBanner from "../components/AppComponents/Banner/FooterBanner";
import Hero from "../pages/home/Hero";

export function WithHeroLayout() {
  return (
    <div>
      <div className="fixed right-0 left-0 z-50">
        <HeaderBanner />
        <Header />
      </div>
      <Hero />
      <Outlet />
      <Footer />
      <FooterBanner />
    </div>
  );
}

export function WithoutHeroLayout() {
  return (
    <div>
      <div className="fixed right-0 left-0 z-50">
        <HeaderBanner />
        <Header />
      </div>
      {/* Add bg-[#157347] to match your forum header */}
      <div className="h-48 md:h-44 lg:h-32 bg-[#157347]" /> 
      <Outlet />
      <Footer />
      <FooterBanner />
    </div>
  );
}
