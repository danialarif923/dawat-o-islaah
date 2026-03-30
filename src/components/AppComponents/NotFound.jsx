import { Link } from "react-router-dom";

const NotFound = () => (
  <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
    <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
    <h2 style={{ marginBottom: "1rem" }}>Page Not Found</h2>
    <p style={{ marginBottom: "2rem" }}>
      Sorry, the page you are looking for does not exist or has been moved.
    </p>
    <Link to="/" style={{ color: "#007bff", textDecoration: "underline" }}>
      Go to Homepage
    </Link>
  </div>
);

export default NotFound;
