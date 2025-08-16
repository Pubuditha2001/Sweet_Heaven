import React, { useRef } from "react";
import Cake from "../components/Cake";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const cakes = [
  {
    name: "Vanilla Dream",
    description: "Classic vanilla cake with buttercream",
    img: "cakes/normal-cakes/vanila-cake.jpg",
    price: 350,
  },
  {
    name: "Chocolate Decadence",
    description: "Rich chocolate cake with ganache",
    img: "cakes/normal-cakes/chocolate-cake.jpeg",
    price: 400,
  },
  {
    name: "Strawberry Bliss",
    description: "Strawberry cake with cream cheese frosting",
    img: "cakes/normal-cakes/strawberry-cake.jpg",
    price: 380,
  },
  {
    name: "Lemon Zest",
    description: "Tangy lemon cake with glaze",
    img: "cakes/normal-cakes/coffee-cake.jpeg",
    price: 360,
  },
  {
    name: "Vanilla Dream",
    description: "Classic vanilla cake with buttercream",
    img: "cakes/normal-cakes/vanila-cake.jpg",
    price: 350,
  },
  {
    name: "Chocolate Decadence",
    description: "Rich chocolate cake with ganache",
    img: "cakes/normal-cakes/chocolate-cake.jpeg",
    price: 400,
  },
  {
    name: "Strawberry Bliss",
    description: "Strawberry cake with cream cheese frosting",
    img: "cakes/normal-cakes/strawberry-cake.jpg",
    price: 380,
  },
  {
    name: "Lemon Zest",
    description: "Tangy lemon cake with glaze",
    img: "cakes/normal-cakes/coffee-cake.jpeg",
    price: 360,
  },
];

const Home = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className="flex flex-col bg-white overflow-x-hidden"
      style={
        {
          // fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif',
          // fontSize: "1.15rem",
        }
      }
    >
      {/* Business Description */}
      <div className="pt-4 px-4 text-center mb-2">
        <p className="text-gray-700 text-base sm:text-lg">
          Welcome to Sweet Heaven! We craft delicious cakes and cupcakes for
          every occasion, using only the finest ingredients. Whether you want a
          classic treat or a custom creation, our bakery brings joy and
          sweetness to your celebrations.
        </p>
      </div>
      /* Call to Action */
      <div className="flex px-8 py-3 justify-center mt-2 gap-5 md:gap-20">
        <button
          onClick={() => (window.location.href = "/custom-cake")}
          className="w-full md:w-1/4 lg:w-1/6 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-pink-600 text-white text-base font-bold flex"
          type="button"
        >
          Custom Cakes
        </button>
        <button
          onClick={() => (window.location.href = "/menu")}
          className="w-full md:w-1/4 lg:w-1/6 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-pink-600 text-white text-base font-bold border border-[#eb477e] flex"
          type="button"
        >
          Menu
        </button>
      </div>
      {/* Featured Cakes */}
      <div className="bg-white rounded-t-xl pt-4 px-0 sm:px-4 max-w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-pink-600 mb-4 sm:mb-6 text-center">
          Featured Cakes
        </h2>
        <div className="relative flex items-center">
          {/* Left arrow */}
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

          {/* Cake list */}
          <div
            className="flex overflow-x-auto gap-4 md:gap-6 lg:gap-8 pb-2 no-scrollbar pl-4 sm:pl-6"
            ref={scrollRef}
            style={{
              scrollPaddingLeft: "16px",
              scrollPaddingRight: "16px",
              paddingRight: "16px",
            }}
          >
            {cakes.map((cake, index) => (
              <div
                style={{
                  width: "180px",
                  minWidth: "180px",
                  maxWidth: "180px",
                }}
                className="flex-shrink-0 md:w-[220px] md:min-w-[220px] md:max-w-[220px] lg:w-[250px] lg:min-w-[250px] lg:max-w-[250px]"
                key={index}
              >
                <Cake cake={cake} />
              </div>
            ))}
          </div>

          {/* Right arrow */}
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
        </div>
      </div>
    </div>
  );
};

export default Home;
