import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import LogoSection from "./LogoSection";
import { authApiClient, setAuthToken } from "../../api/backendApi";
import { useAuthData } from "../../context/AuthContext";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, token } = useAuthData();

  useEffect(() => {
    const checkAuth = () => {
      if (token) {
        setAuthToken(token);
        navigate("/");
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApiClient.post("api/auth/login/", {
        email: formData.email,
        password: formData.password,
      });

      const { access, user } = response.data;
      setAuthToken(access);
      login(access, user, formData.remember);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Login failed. Please try again.",
      );
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    // window.location.href = `${BACKEND_BASE_URL}auth/google/`; // Update with your actual endpoint
  };

  return (
    <section className="flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 py-8 md:h-screen">
      <LogoSection />
      <div className="flex flex-col justify-center px-6 w-full md:py-8 mx-auto lg:py-0 md:w-[50%]">
        <div className="rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Sign in to your account
            </h1>

            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                  placeholder="name@company.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="space-y-2 md:flex items-center justify-between">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="remember"
                      name="remember"
                      type="checkbox"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="text-gray-500 dark:text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                <Link
                  to="/forget-password"
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-primary-500"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              {/* Google Login Button */}
              {/* <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-gray-600 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-700 dark:focus:ring-gray-800 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FcGoogle className="w-5 h-5" />
                Sign in with Google
              </button> */}

              {/* Sign Up Link */}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don&apos;t have an account yet?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 hover:underline dark:text-primary-500"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
