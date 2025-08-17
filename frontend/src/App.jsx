import "./App.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Menu from "../pages/Menu";
import CustomCake from "../pages/CustomCake";
import Cart from "../pages/Cart";
// import Admin from "../pages/Admin";
import Contact from "../pages/Contact";
import Hero from "../components/Hero";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef } from "react";

// Create a wrapper component that decides when to show Hero
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const homeRef = useRef(null);

  // Handle scroll to element if URL has hash
  useEffect(() => {
    if (location.hash && isHomePage && homeRef.current) {
      setTimeout(() => {
        if (location.hash === "#contact-section") {
          homeRef.current.scrollToContact();
        } else if (location.hash === "#faq-section") {
          homeRef.current.scrollToFAQ();
        }
      }, 300);
    }
  }, [location, isHomePage]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar homeRef={homeRef} />
      {isHomePage && <Hero />}
      <main className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<Home ref={homeRef} />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/custom-cake" element={<CustomCake />} />
          <Route path="/cart" element={<Cart />} />
          {/* <Route path="/admin" element={<Admin />} /> */}
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
