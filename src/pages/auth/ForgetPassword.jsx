import { useState } from "react";
import { Link } from "react-router-dom";
import IconMain from "../../../assets/Icons/IconMain.jpeg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to send reset password email
    console.log("Password reset requested for:", email);
    // Example API call:
    // try {
    //   const response = await fetch('/api/forgot-password', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email })
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     setIsSubmitted(true);
    //   }
    // } catch (error) {
    //   console.error('Error:', error);
    // }

    // For demo purposes, we'll just set submitted to true
    setIsSubmitted(true);
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
              Reset your password
            </h1>

            {isSubmitted ? (
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  If an account exists with {email}, you will receive an email
                  with instructions to reset your password.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Didn&apos;t receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="font-medium text-blue-600 hover:underline dark:text-primary-500"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  to="/signin"
                  className="inline-block mt-4 text-sm font-medium text-blue-600 hover:underline dark:text-primary-500"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                <p className="text-gray-600 dark:text-gray-300">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password.
                </p>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Your email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 outline-none"
                    placeholder="name@company.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white bg-blue-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 cursor-pointer"
                >
                  Send reset link
                </button>
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Remember your password?{" "}
                  <Link
                    to="/signin"
                    className="font-medium text-blue-600 hover:underline dark:text-primary-500"
                  >
                    Sign in
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

export default ForgotPassword;
