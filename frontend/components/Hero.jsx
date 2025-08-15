import React from "react";

const Hero = () => (
  <div className="px-0 pt-0 pb-0">
    <div
      className="bg-cover bg-center flex flex-col justify-end overflow-hidden min-h-[200px] h-64 sm:h-200 md:h-[1000px] lg:h-[1000px] xl:h-[1000px]"
      style={{
        backgroundImage: `url("../src/assets/hero.jpg")`,
      }}
    >
      {/* Logo overlay (optional, if you want logo on hero) */}
      <img
        src="../src/assets/logo.png"
        alt="Sweet Heaven"
        className="w-32 mx-auto mt-6"
      />
    </div>
  </div>
);

export default Hero;
