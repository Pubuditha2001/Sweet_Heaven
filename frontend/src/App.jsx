import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home/Home.jsx";
import Menu from "./pages/Menu/Menu.jsx";
import ProductView from "./pages/ProductView/ProductView.jsx";
import CustomCake from "./pages/CustomCake/CustomCake.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import Hero from "./components/Hero";
import Dashboard from "./admin/pages/Dashboard.jsx";
import Login from "./pages/Auth/Login.jsx";
import AdminNavbar from "./admin/components/AdminNavbar.jsx";
import AdminFooter from "./admin/components/AdminFooter.jsx";
import CakesTable from "./admin/pages/Cakes/CakesTable.jsx";
import EditCakePage from "./admin/pages/Cakes/EditCakePage.jsx";
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
  const isAdminRoute = location.pathname.startsWith("/admin");
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

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNavbar />
        <main className="w-full flex-grow">
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/cakes" element={<CakesTable />} />
            <Route path="/admin/cakes/edit/:id" element={<EditCakePage />} />
            <Route path="/admin/login" element={<Login />} />
          </Routes>
        </main>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar homeRef={homeRef} />
      {isHomePage && <Hero />}
      <main className="w-full flex-grow">
        <Routes>
          <Route path="/" element={<Home ref={homeRef} />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/custom-cake" element={<CustomCake />} />
          <Route path="/cart" element={<Cart />} />
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
