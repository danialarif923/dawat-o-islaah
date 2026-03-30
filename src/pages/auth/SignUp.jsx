import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoSection from "./LogoSection";
import { authApiClient } from "../../api/backendApi";
import toast, { Toaster } from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    receive_daily_email: true, // ✅ NEW
  });

  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
    if (name === "email") {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPasswordError("");
    setEmailError("");

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setIsSubmitting(false);
      return;
    }

    if (!formData.acceptTerms) {
      alert("Please accept the terms and conditions");
      setIsSubmitting(false);
      return;
    }

    const apiData = {
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      password: formData.password,
      receive_daily_email: formData.receive_daily_email, // ✅ NEW
    };

    try {
      const response = await authApiClient.post(
        "api/auth/register/",
        apiData
      );

      console.log("Registration successful:", response.data);

      toast.success("User created successfully 🎉");

      if (formData.receive_daily_email) {
        toast.success("You'll receive daily Ayat & Hadith emails 📩");
      }

      navigate("/signin");
    } catch (error) {
      console.error("Signup error:", error);

      if (error.response && error.response.data.email) {
        setEmailError(error.response.data.email[0]);
      } else {
        setEmailError("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 py-8 md:h-screen">
      <Toaster />
      <LogoSection />

      <div className="flex flex-col justify-center px-6 w-full md:py-8 mx-auto lg:py-0 md:w-[50%]">
        <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 sm:p-8">
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
              Create your account
            </h1>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                  required
                />
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                required
              />
              {emailError && (
                <p className="text-sm text-red-500">{emailError}</p>
              )}

              {/* Password */}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                required
              />
              {passwordError && (
                <p className="text-sm text-red-500">{passwordError}</p>
              )}

              {/* Terms */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  required
                />
                <label className="text-sm text-gray-500">
                  I accept the Terms & Conditions
                </label>
              </div>

              {/* ✅ NEW: Daily Email Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="receive_daily_email"
                  checked={formData.receive_daily_email}
                  onChange={handleChange}
                />
                <label className="text-sm text-gray-600">
                  Receive daily Ayat & Hadith via email 📩
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>

              {/* Login link */}
              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/signin" className="text-blue-600">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignUp;