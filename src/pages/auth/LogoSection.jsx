import IconMain from "../../../assets/Icons/IconMain.jpeg";

const LogoSection = () => {
  return (
    <div className="items-center flex  justify-center md:w-[50%] ">
      <div className="flex flex-col items-center space-y-4 mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <img
          className="h-32 w-32 md:h-40 md:w-40 mr-4"
          src={IconMain}
          alt="logo"
        />
        <div className="text-2xl md:text-3xl">Dawat O Islaah</div>
      </div>
    </div>
  );
};

export default LogoSection;
