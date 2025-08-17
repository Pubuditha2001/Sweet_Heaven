import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import Cake from "../../components/Cake";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import Contact from "../Contact/Contact"; // Import the Contact component
import FAQ from "../FAQ/FAQ"; // Import the FAQ component
import { fetchCakes } from "../../api/cake";

const Home = forwardRef((props, ref) => {
  const scrollRef = useRef(null);
  const [cakes, setCakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isScrollable, setIsScrollable] = useState(false);
  const [autoSlide, setAutoSlide] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Create refs for scroll targets
  const contactRef = useRef(null);
  const faqRef = useRef(null);

  // State to handle scroll requests
  const [scrollTarget, setScrollTarget] = useState(null);

  // Expose scroll functions to parent components
  useImperativeHandle(ref, () => ({
    scrollToContact: () => setScrollTarget("contact"),
    scrollToFAQ: () => setScrollTarget("faq"),
  }));

  useEffect(() => {
    async function loadCakes() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchCakes();
        setCakes(data);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    }
    loadCakes();
  }, []);

  const featuredCakes = cakes.filter((cake) => cake.isFeatured);

  // Check if cake list is scrollable
  useEffect(() => {
    function checkScrollable() {
      const el = scrollRef.current;
      if (el) {
        setIsScrollable(el.scrollWidth > el.clientWidth + 2); // +2 for rounding
      }
    }
    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [featuredCakes, loading]);

  // Handle scroll events to track position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      setScrollPosition(el.scrollLeft);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Improved infinite scroll implementation
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || featuredCakes.length === 0) return;

    // Calculate the threshold based on item width
    const cakeItem = el.querySelector('div[class*="flex-shrink-0"]');
    const itemWidth = cakeItem
      ? cakeItem.offsetWidth + (isMobile ? 50 : 24)
      : 220;

    // Calculate viewport width and total content width
    const viewportWidth = el.clientWidth;
    const contentWidth = el.scrollWidth;

    const handleScroll = () => {
      setScrollPosition(el.scrollLeft);

      // If we scroll to the end, jump to the beginning
      if (el.scrollLeft + viewportWidth >= contentWidth - itemWidth / 2) {
        // Immediately jump to the start without animation
        el.scrollTo({ left: 0, behavior: "auto" });
      }

      // If we scroll to the beginning (backward), jump to the end
      if (el.scrollLeft === 0 && scrollPosition > itemWidth) {
        // Immediately jump to near the end without animation
        el.scrollTo({
          left: contentWidth - viewportWidth - itemWidth,
          behavior: "auto",
        });
      }
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [scrollPosition, featuredCakes.length, isMobile]);

  // Enhanced auto-slide logic for smoother infinite scrolling
  useEffect(() => {
    if (!isScrollable || !autoSlide) return;
    const el = scrollRef.current;
    if (!el) return;

    // Get width of single item for smoother scrolling
    const cakeItem = el.querySelector('div[class*="flex-shrink-0"]');
    const itemWidth = cakeItem
      ? cakeItem.offsetWidth + (isMobile ? 16 : 24)
      : 220;

    const viewportWidth = el.clientWidth;
    const contentWidth = el.scrollWidth;

    const interval = setInterval(() => {
      // Current scroll position
      const currentPos = el.scrollLeft;

      // Check if we're near the end
      const isNearEnd = currentPos + viewportWidth >= contentWidth - itemWidth;

      if (isNearEnd) {
        // Jump to beginning without animation
        el.scrollTo({ left: 0, behavior: "auto" });
        // After a small delay, scroll smoothly to show movement
        setTimeout(() => {
          el.scrollBy({ left: itemWidth / 2, behavior: "smooth" });
        }, 50);
      } else {
        // Normal scrolling
        el.scrollBy({ left: itemWidth, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isScrollable, autoSlide, featuredCakes, loading, isMobile]);

  // Improved scroll function for manual navigation
  const scroll = (direction) => {
    stopAutoSlide();
    if (scrollRef.current) {
      const el = scrollRef.current;
      // Calculate the width of a single cake item including gap
      const cakeItem = el.querySelector('div[class*="flex-shrink-0"]');
      const itemWidth = cakeItem
        ? cakeItem.offsetWidth + (isMobile ? 16 : 24)
        : 220;

      // Get total width and current position
      const totalWidth = el.scrollWidth;
      const currentPos = el.scrollLeft;
      const viewportWidth = el.clientWidth;

      if (direction === "right") {
        // Check if we're at the end
        if (currentPos + viewportWidth >= totalWidth - itemWidth / 2) {
          // Jump to beginning instantly
          el.scrollTo({ left: 0, behavior: "auto" });
          // Then after a tiny delay, start scrolling smoothly
          setTimeout(() => {
            el.scrollBy({ left: itemWidth / 2, behavior: "smooth" });
          }, 50);
        } else {
          // Normal scrolling
          el.scrollBy({ left: itemWidth, behavior: "smooth" });
        }
      } else if (direction === "left") {
        // Check if we're at the beginning
        if (currentPos < itemWidth / 2) {
          // Jump to end instantly
          el.scrollTo({
            left: totalWidth - viewportWidth,
            behavior: "auto",
          });
          // Then after a tiny delay, start scrolling smoothly
          setTimeout(() => {
            el.scrollBy({ left: -itemWidth / 2, behavior: "smooth" });
          }, 50);
        } else {
          // Normal scrolling
          el.scrollBy({ left: -itemWidth, behavior: "smooth" });
        }
      }
    }
  };

  const stopAutoSlide = () => {
    setAutoSlide(false);
  };

  // Update isMobile state on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll when target changes
  useEffect(() => {
    if (scrollTarget) {
      const targetRef = scrollTarget === "contact" ? contactRef : faqRef;
      if (targetRef.current) {
        const elementPosition = targetRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset;
        // Get navbar height (fixed or sticky)
        const navbar = document.querySelector("nav");
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        window.scrollTo({
          top: offsetPosition - navbarHeight,
          behavior: "smooth",
        });
      }
      setScrollTarget(null);
    }
  }, [scrollTarget, isMobile]);

  // Handle URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#contact-section") {
      setTimeout(() => setScrollTarget("contact"), 100);
    } else if (hash === "#faq-section") {
      setTimeout(() => setScrollTarget("faq"), 100);
    } else if (!hash || hash === "#" || window.location.pathname === "/") {
      // Scroll to top if no hash or just home
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    }
  }, []);

  // Simplified scroll functions for home page buttons
  const scrollToContact = () => setScrollTarget("contact");
  const scrollToFAQ = () => setScrollTarget("faq");

  return (
    <div className="flex flex-col bg-white overflow-x-hidden">
      {/* Business Description */}
      <div className="pt-4 px-4 text-center mb-2" data-section="home">
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Welcome to Sweet Heaven! We craft delicious cakes and cupcakes for
          every occasion, using only the finest ingredients. Whether you want a
          classic treat or a custom creation, our bakery brings joy and
          sweetness to your celebrations.
        </p>
      </div>
      {/* Call to Action - Improved mobile styling with FAQ button */}
      <div className="grid grid-cols-2 gap-2 px-4 sm:px-8 py-3 mt-2 sm:flex sm:justify-center sm:gap-5 md:gap-10 lg:gap-16">
        <button
          onClick={() => (window.location.href = "/menu")}
          className="flex items-center justify-center rounded-lg py-2 px-2 sm:px-4 bg-pink-600 text-white text-xs sm:text-sm md:text-base font-medium hover:bg-pink-700 transition-colors shadow-sm"
          type="button"
        >
          Menu
        </button>

        <button
          onClick={() => (window.location.href = "/custom-cake")}
          className="flex items-center justify-center rounded-lg py-2 px-2 sm:px-4 bg-pink-600 text-white text-xs sm:text-sm md:text-base font-medium hover:bg-pink-700 transition-colors shadow-sm"
          type="button"
        >
          Custom Cakes
        </button>

        <button
          onClick={scrollToContact}
          className="flex items-center justify-center rounded-lg py-2 px-2 sm:px-4 bg-pink-600 text-white text-xs sm:text-sm md:text-base font-medium hover:bg-pink-700 transition-colors shadow-sm col-span-1"
          type="button"
        >
          Contact
        </button>

        <button
          onClick={scrollToFAQ}
          className="flex items-center justify-center rounded-lg py-2 px-2 sm:px-4 bg-pink-600 text-white text-xs sm:text-sm md:text-base font-medium hover:bg-pink-700 transition-colors shadow-sm col-span-1"
          type="button"
        >
          FAQ
        </button>
      </div>
      {/* Featured Cakes */}
      <div className="bg-white rounded-t-xl pt-4 px-0 sm:px-4 max-w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-4 sm:mb-6 text-center">
          Featured Cakes
        </h2>
        {loading && <div>Loading cakes...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && !error && (
          <div className="relative flex items-center">
            {/* Left arrow */}
            {isScrollable && (
              <button
                className="hidden md:flex items-center justify-center mr-3 w-10 h-10 rounded-full bg-white border border-pink-300 shadow-md hover:bg-pink-50 transition-all"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                type="button"
                style={{ borderRadius: "50%" }}
              >
                <FontAwesomeIcon
                  icon={faAngleLeft}
                  className="w-5 h-5 text-pink-600"
                />
              </button>
            )}

            {/* Cake list */}
            <div
              className="flex overflow-x-auto gap-4 md:gap-6 lg:gap-8 pb-2 no-scrollbar px-4 sm:pl-6"
              ref={scrollRef}
              style={{
                scrollPaddingLeft: "16px",
                scrollPaddingRight: "16px",
                scrollSnapType: isMobile ? "none" : "x mandatory",
                scrollBehavior: "smooth",
              }}
              onMouseEnter={() => setAutoSlide(false)}
              onMouseLeave={() => setAutoSlide(true)}
            >
              {featuredCakes.map((cake, index) => (
                <div
                  style={
                    isMobile
                      ? {
                          width: "calc(50% - 8px)",
                          minWidth: "calc(50% - 8px)",
                          maxWidth: "calc(50% - 8px)",
                        }
                      : {
                          width: "calc(25% - 24px)",
                          minWidth: "220px",
                          maxWidth: "220px",
                          scrollSnapAlign: "center",
                          flex: "1 0 auto",
                        }
                  }
                  className="flex-shrink-0"
                  key={cake._id || cake.id || index}
                >
                  <Cake cake={cake} />
                </div>
              ))}
            </div>

            {/* Right arrow */}
            {isScrollable && (
              <button
                className="hidden md:flex items-center justify-center ml-3 w-10 h-10 rounded-full bg-white border border-pink-300 shadow-md hover:bg-pink-50 transition-all"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                type="button"
                style={{ borderRadius: "50%" }}
              >
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className="w-5 h-5 text-pink-600"
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contact Section - Using ref instead of ID */}
      <div ref={contactRef} className="scroll-mt-20" data-section="contact">
        <Contact />
      </div>

      {/* FAQ Section - Using ref instead of ID */}
      <div ref={faqRef} className="scroll-mt-20" data-section="faq">
        <FAQ />
      </div>
    </div>
  );
});

export default Home;
