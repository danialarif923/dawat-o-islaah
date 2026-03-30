import Intro from "./Intro";
import WhatWeOffer from "./WhatWeOffer";
import IslamicTools from "./IslamicTools";

const Footer = () => {
  return (
    <div className="flex flex-col gap-10 lg:gap-0 lg:flex-row lg:justify-around lg:items-start py-16 px-10 md:px-16 lg:px-20 bg-[#157347] space-x-10 border-t-3 border-amber-500">
      <Intro />
      <WhatWeOffer />
      <IslamicTools />
    </div>
  );
};

export default Footer;
