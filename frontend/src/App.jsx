import "./App.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Products from "../pages/Products";
import CustomCake from "../pages/CustomCake";
import Cart from "../pages/Cart";
import Admin from "../pages/Admin";
import Hero from "../components/Hero";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Create a wrapper component that decides when to show Hero
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      {isHomePage && <Hero />} {/* Only show Hero on home page */}
      <main className="container mx-auto px-0 md:px-8 lg:px-12 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/custom-cake" element={<CustomCake />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin" element={<Admin />} />
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
