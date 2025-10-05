import "./App.css";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home/Home.jsx";
import Menu from "./pages/Menu/Menu.jsx";
import ProductView from "./pages/ProductView/ProductView.jsx";
// import CustomCake from "./pages/CustomCake/CustomCake.jsx";
import Cart from "./pages/Cart/Cart.jsx";
import Contact from "./pages/Contact/Contact.jsx";
import AccessoriesPage from "./pages/Accessories/AccessoriesPage.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import CheckoutDetails from "./pages/Checkout/CheckoutDetails.jsx";
import OrderRequested from "./pages/Checkout/OrderRequested.jsx";
import Hero from "./components/Hero";
import Dashboard from "./admin/pages/Dashboard.jsx";
import UnifiedLogin from "./pages/Auth/UnifiedLogin.jsx";
import AdminNavbar from "./admin/components/AdminNavbar.jsx";
import AdminFooter from "./admin/components/AdminFooter.jsx";
import CakesTable from "./admin/pages/Cakes/CakesTable.jsx";
import AddCakePage from "./admin/pages/Cakes/AddCakePage.jsx";
import EditCakePage from "./admin/pages/Cakes/EditCakePage.jsx";
import OrdersTable from "./admin/pages/Orders/OrdersTable.jsx";
import OrderView from "./admin/pages/Orders/OrderView.jsx";
import AccessoriesTable from "./admin/pages/Accessories/AccessoriesTable.jsx";
import AddAccessories from "./admin/pages/Accessories/AddAccessories.jsx";
import EditAccessories from "./admin/pages/Accessories/EditAccessories.jsx";
import AddToppings from "./admin/pages/Toppings/AddToppings.jsx";
import EditToppings from "./admin/pages/Toppings/EditToppings.jsx";
import ToppingsTable from "./admin/pages/Toppings/ToppingsTable.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Create a wrapper component that decides when to show Hero
function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const homeRef = useRef(null);
  const navigate = useNavigate();

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

  // If user accesses an admin route but is not logged in as admin, redirect to admin login
  useEffect(() => {
    try {
      const hasAdminToken = Boolean(localStorage.getItem("adminToken"));
      if (
        isAdminRoute &&
        !hasAdminToken &&
        !location.pathname.includes("/admin/login")
      ) {
        // preserve next param so login can return
        const next = encodeURIComponent(
          location.pathname + location.search + location.hash || ""
        );
        navigate(`/admin/login?next=${next}`);
      }
    } catch {
      // localStorage may be unavailable in some environments; silently ignore
    }
  }, [isAdminRoute, location, navigate]);

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNavbar />
        <main className="w-full flex-grow">
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/cakes" element={<CakesTable />} />
            <Route path="/admin/cakes/new" element={<AddCakePage />} />
            <Route path="/admin/cakes/edit/:id" element={<EditCakePage />} />
            <Route path="/admin/accessories" element={<AccessoriesTable />} />
            <Route path="/admin/accessories/new" element={<AddAccessories />} />
            <Route
              path="/admin/accessories/edit/:id"
              element={<EditAccessories />}
            />
            <Route path="/admin/toppings" element={<ToppingsTable />} />
            <Route path="/admin/toppings/new" element={<AddToppings />} />
            <Route path="/admin/toppings/edit/:id" element={<EditToppings />} />
            <Route path="/admin/orders" element={<OrdersTable />} />
            <Route path="/admin/orders/:id" element={<OrderView />} />
            <Route path="/admin/login" element={<UnifiedLogin />} />
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
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/product/:id" element={<ProductView />} />
          {/* <Route path="/custom-cake" element={<CustomCake />} /> */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/details" element={<CheckoutDetails />} />
          <Route path="/order-requested" element={<OrderRequested />} />
          <Route path="/login" element={<UnifiedLogin />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router basename="/Sweet_Heaven">
      <AppContent />
    </Router>
  );
}

export default App;
