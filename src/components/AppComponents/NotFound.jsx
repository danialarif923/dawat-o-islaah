import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();
  return (
    <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>{t("notFound.title")}</h1>
      <h2 style={{ marginBottom: "1rem" }}>{t("notFound.heading")}</h2>
      <p style={{ marginBottom: "2rem" }}>
        {t("notFound.subtitle")}
      </p>
      <Link to="/" style={{ color: "#007bff", textDecoration: "underline" }}>
        {t("notFound.goHome")}
      </Link>
    </div>
  );
};

export default NotFound;
