import { useState } from "react";
import { Link } from "react-router-dom";
import IconMain from "../../../assets/Icons/IconMain.jpeg";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include auth token if needed
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setIsSuccess(true);
      setFormData({ old_password: "", new_password: "" });
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
              Change Password
            </h1>

            {isSuccess ? (
              <div className="space-y-4">
                <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
                  Password changed successfully!
                </div>
                <Link
                  to="/"
                  className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 inline-block"
                >
                  Return to Dashboard
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
                    htmlFor="old_password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="old_password"
                    id="old_password"
                    value={formData.old_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="new_password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
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
                    "Change Password"
                  )}
                </button>

                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Want to return to your profile?{" "}
                  <Link
                    to="/"
                    className="font-medium text-blue-600 hover:underline dark:text-primary-500"
                  >
                    Go back
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

export default ChangePassword;
