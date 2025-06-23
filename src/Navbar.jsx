function Navbar() {
  return (
    <nav className="relative flex justify-between items-center w-full max-w-7xl mx-auto py-6 px-6 z-10">
      {/* Logo section with glow effect */}
      <div className="flex items-center space-x-3 group cursor-pointer">
        <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
          <img 
            width="32" 
            height="32" 
            src="./image.png" 
            alt="financial-growth-analysis"
            className="drop-shadow-lg"
          />
        </div>
        <span className="text-white font-bold text-xl tracking-wide">Chatlytics</span>
      </div>
      
      {/* Navigation links with better spacing and effects */}
      <div className="flex space-x-8">
        <a 
          href="#home" 
          className="relative text-white/90 text-lg font-medium hover:text-white transition-all duration-300 group pb-2"
        >
          Home
          <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
        </a>
        <a 
          href="#about" 
          className="relative text-white/90 text-lg font-medium hover:text-white transition-all duration-300 group pb-2"
        >
          About Us
          <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
        </a>
      </div>
      
      {/* Enhanced buttons with better UX */}
      <div className="flex space-x-4">
        {/* Login button - subtle style */}
        <button className="
          px-4 py-2 rounded-xl text-white font-semibold
          bg-white/10 backdrop-blur-sm border border-white/30
          hover:bg-white/20 hover:border-white/40
          hover:-translate-y-0.5 
          shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-white/50
        ">
          Login
        </button>
        
        {/* Sign Up button - primary action */}
        <button className="
          px-4 py-2 rounded-xl text-white font-semibold
          bg-gradient-to-r from-blue-600 to-purple-600
          hover:from-blue-500 hover:to-purple-500
          border border-blue-400/30 hover:border-purple-400/50
          hover:-translate-y-0.5 
          shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-purple-500/30
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-purple-400
        ">
          Sign Up
        </button>
      </div>
    </nav>
  );
}

export default Navbar;