import React from "react";

const Hero = () => (
  <div className="px-0 pt-0 pb-0">
    <div
      className="bg-cover bg-center flex flex-col justify-center items-center overflow-hidden h-48 sm:h-64 hero-lg-height relative"
      style={{
        backgroundImage: `url("../src/assets/hero.jpg")`,
      }}
    >
      <div
        className="flex items-center justify-center p-20 logo-gradient"
        style={{ zIndex: 2 }}
      >
        <img
          src="../src/assets/logo.png"
          alt="Sweet Heaven"
          className="w-40 sm:w-40 md:w-56 lg:w-64 mx-auto"
        />
      </div>
    </div>
  </div>
);

export default Hero;
