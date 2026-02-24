import React from "react";

const Authentication = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Main Container */}
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-sm flex overflow-hidden min-h-[600px]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </div>

            {/* Header */}
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              Hello, <br /> Welcome Back
            </h1>
            <p className="text-gray-400 mb-10 text-sm">
              Welcome back to your special place
            </p>

            {/* Form */}
            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="johndoe@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400"
                />
              </div>

              {/* Extras */}
              <div className="flex items-center justify-between text-xs font-medium py-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    defaultChecked
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  className="text-gray-400 hover:text-teal-600 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button className="bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors mt-4">
                Sign In
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-8">
            Don't have an account?{" "}
            <a href="#" className="text-teal-500 font-semibold hover:underline">
              Sign Up
            </a>
          </p>
        </div>

        {/* Right Side: Decorative Gradient Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem]">
            {/* You can add an image or illustration here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authentication;
