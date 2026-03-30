import { Link } from "react-router-dom";
import SihahSittaGrid from "../../components/AppComponents/Home/SihahSittaGrid";
import { useLanguage } from "../../context/LanguageContext";

const SihahSitta = () => {
  const { t, language } = useLanguage();

  // Get books from translation file
  const books = t("sihahSitta.books");

  // Map links to books (since links are not in translation files)
  const links = [
    "/hadith/al-tirmidhi",
    "/hadith/sahih-bukhari",
    "/hadith/sahih-muslim",
    "/hadith/abu-dawood",
    "/hadith/sunan-nasai",
    "/hadith/ibn-e-majah",
  ];

  // Compose the books array with links
  const sihahSitta = books.map((book, idx) => ({
    ...book,
    link: links[idx],
    slug: links[idx].split("/").pop(),
  }));

  return (
    <div className="px-6 sm:px-14 md:px-20 lg:px-32 flex flex-col gap-y-10">
      <h2 className="text-center font-bold text-2xl sm:text-3xl mb-4">
        {t("sihahSitta.sectionTitle")}
      </h2>
      <SihahSittaGrid books={sihahSitta} />
      <div className="text-center mt-4">
        <Link
          to={"hadith"}
          className="px-4 py-4 bg-[#1E3A5F] uppercase font-bold text-white rounded"
        >
          {t("sihahSitta.readAll")}
        </Link>
      </div>
    </div>
  );
};

export default SihahSitta;
