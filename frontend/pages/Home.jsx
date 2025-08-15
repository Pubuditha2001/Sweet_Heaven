import React from "react";
import Cake from "../components/Cake";

const cakes = [
  {
    name: "Vanilla Dream",
    description: "Classic vanilla cake with buttercream",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCahFx11XcWgBIPhf6D1Rx654avfQAraffDcbk4jQxS-y1XkF8v5mXVEPffqAaRVR3NmdK4JpH0weAUeB5bvX6IVcYI3DjYJs1n8GV6bLQCCyXWwQLhYfHs1j6ywUoXJOZjyo0FBxs1NLpn7-6Fa6LNheT2NcbOBWSThpOqr951-XP68ByghcfGg71DtGaXBFl49Pl1dTiQsK6Cv6jQsMt3lWA5bdPvAW9I9DI8FjhZNJ-gMHS_15Sq7jeqc180mbPLwLY8YVwHwJQu",
  },
  {
    name: "Chocolate Decadence",
    description: "Rich chocolate cake with ganache",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5BT1l39A9UVa-vhLr_M0s97Ht0OADAGexsBJIcSMZSYzp5st7Or6IUOIU01zO7UD1OvGwreos7VJBiLvBpRLa15nAa0rjHIAhL_iIANaU7EpMvw5khHDH7JqqB1Umu7ZDcuPoqtUihdjtzBYh3S4TA4ypJUMRNxd9h62831Z-20Qcd9EKTHcIEnPRviA0baydRW36thXZorIvSS_H5BVu2EeoDrqNvRFb1j2c-5LonqeqGH3YyA4yhpkQ2nCw5RHI7ns8m3v2Lzvw",
  },
  {
    name: "Strawberry Bliss",
    description: "Strawberry cake with cream cheese frosting",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCcx5RCBzwKSbkakOu-BT5iDg-vj8oQZHxm9XHLacNPRmCsSBF9TOv7es66K3q4o8LDMVFpV-szkS5Q59oV7_P7axoCAx0d4NquCCv-0owj14wtdkxS_kvt2iHWkqxSxP-2qusP17ZW7d1d5hZmE06rz2muYAINtpIqHwrOfvlZDnmlHJX8xvTZ50kZTkrIDnlvIXRlz-KSqzPk7Z3r9sTUJJvgvrVph6HEb5ymjD6cgBldOfCCFS1TYGlDk4jq4SbajxPn9bbeMY5O",
  },
  {
    name: "Lemon Zest",
    description: "Tangy lemon cake with glaze",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYRVx9SLQ5YmX9zT6oRo2oc6xWgqHoAo3EuwFHjhqFrx-xMTBf3ZFB49hzEuuIKMboTr9_YM52_F1jzRurWxho5GHie2MBAgHvqhtHUSrMtb9_qyGBV4QBvUlC4GN5szKLrggdasS54eB53N0mwAKZuTDROo84wqSnh3zV0vfAhZCDwY_NcPJJ34XiOR1egqKTnECa9CP3780QIoIpZdO9k8IEyfGZMc2zSrhuzj_AyGa_Vw00G9t4HlwZxDmj_FCg7gRxhu4RfLV8",
  },
];

const Home = () => {
  return (
    <div
      className="flex flex-col min-h-screen bg-white justify-between overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      {/* Hero Section */}
      <div className="px-4 pt-4 pb-2">
        <div
          className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-xl min-h-[200px]"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDhfvHS9UdazjhNQISl4-6m-69meLjfwNoEJtj41Hmc7ZK_ywnCTJY4jIJzeBxT-CWGgbEx-mg_PanQlb-wi7i5jSSEd6Mq6f2vrh_C0C7ATnN4naozelxidhLb2oy3QqSi710GDRcwbGrgBNt_1clOhFR-GJxGULPYlCtwHab4sAnhflAQ9i4VQfusNRK1yrxbVjooOCTEe1Y-iOM_fZEVPPZmwSj3PBY59KUlH0Ht7ZRq6G9PXQM1qbusCwGl2aBsxyUrle_1w2ZS")`,
          }}
        ></div>
      </div>

      {/* Featured Cakes */}
      <div className="bg-white rounded-t-xl -mt-2 pt-4 px-4">
        <h2 className="text-[#181113] text-xl font-bold mb-4">
          Featured Cakes
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {cakes.map((cake, index) => (
            <Cake key={index} cake={cake} />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="flex px-4 py-3 justify-center mt-auto">
        <button className="w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-[#eb477e] text-white text-base font-bold">
          Order Custom Cake
        </button>
      </div>
    </div>
  );
};

export default Home;
