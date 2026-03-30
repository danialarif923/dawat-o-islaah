import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import IconMain from "../../../assets/Icons/IconMain.jpeg";

const SetNewPassword = () => {
  const location = useLocation();
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Extract reset token from URL query parameters on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      setResetToken(token);
    } else {
      setError("Reset token is missing. Please use the link from your email.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Include the reset token from the URL in the Authorization header
          Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 py-8 md:h-screen">
      <div className="items-center flex justify-center md:w-[50%]">
        <div className="flex flex-col items-center space-y-4 mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="h-40 w-40 mr-4" src={IconMain} alt="logo" />
          <div className="text-3xl">Dawat O Islaah</div>
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 md:py-8 mx-auto lg:py-0 md:w-[50%]">
        <div className="rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Reset Your Password
            </h1>

            {isSuccess ? (
              <div className="space-y-4">
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
                  Password reset successfully! You can now log in with your new
                  password.
                </div>
                <Link
                  to="/signin"
                  className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 inline-block"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !resetToken}
                  className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-4 h-4 mr-2 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
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
                      Processing...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Remember your password?{" "}
                  <Link
                    to="/signin"
                    className="font-medium text-blue-600 hover:underline dark:text-primary-500"
                  >
                    Back to login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SetNewPassword;
