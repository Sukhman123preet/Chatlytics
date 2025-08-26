import React from "react";

function Navbar({ onBackToUpload }) {
  return (
    <nav className="relative flex justify-between items-center w-full max-w-7xl mx-auto py-6 px-6 z-10">
      {/* Logo */}
      <div
        className="flex items-center space-x-3 group cursor-pointer"
        onClick={onBackToUpload} // click logo to trigger callback
      >
        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
          <img
            width="32"
            height="32"
            src="./image.png"
            alt="financial-growth-analysis"
            className="drop-shadow-lg"
          />
        </div>
        <span className="text-white font-bold text-xl tracking-wide">
          Chatlytics
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-8">
        <a
          href="#home"
          onClick={onBackToUpload}
          className="relative text-white/90 text-lg font-medium hover:text-white transition-all duration-300 group pb-2 cursor-pointer"
        >
          Home
          <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
        </a>
        
      </div>

      
    </nav>
  );
}

export default Navbar;
