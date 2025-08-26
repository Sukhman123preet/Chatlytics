import { useState, useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import React from 'react';

// Add Boxicons CSS dynamically if not already present
const boxiconsLink = document.createElement('link');
boxiconsLink.rel = 'stylesheet';
boxiconsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/boxicons/2.1.4/css/boxicons.min.css';
if (!document.querySelector('link[href*="boxicons"]')) {
  document.head.appendChild(boxiconsLink);
}
// Hero component, now controlled by props from App.jsx
function Hero({ onFileUpload, onProceedToDashboard, uploadProgress, isProcessing }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { isAuthenticated } =true;
  // Handle drag over event
  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default to allow drop
    setIsDragOver(true); // Set drag over state for styling
  };

  // Handle drag leave event
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false); // Reset drag over state
  };

  // Handle file drop event
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false); // Reset drag over state

    const files = e.dataTransfer.files; // Get files from drop event
    if (files[0]) {
      onFileUpload(files[0]); // Call the parent's file upload handler
    }
  };

  // Handle file selection via input
  const handleFileSelect = (e) => {
    if (e.target.files[0]) {
      onFileUpload(e.target.files[0]); // Call the parent's file upload handler
    }
  };

  return (

    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-slate-500 via-slate-300 to-slate-100 bg-clip-text text-transparent">
              Analyze Your WhatsApp Chats
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Discover patterns and insights from your WhatsApp conversations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - 3 Step Process Description */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white mb-6">How It Works</h2>

            {/* Step 1: Upload */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <i className="bx bxs-folder-open text-blue-500 text-xl"></i>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Upload Chat File</h3>
                <p className="text-white/60 text-sm">
                  Upload your WhatsApp chat export file. Your data stays private.
                </p>
              </div>
            </div>

            {/* Step 2: Select Analysis */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <i className="bx bxs-chart text-blue-300 text-xl"></i>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Select Analysis Type</h3>
                <p className="text-white/60 text-sm">
                  select users or have statistics for overall group.
                </p>
              </div>
            </div>

            {/* Step 3: View Results */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-white/10 rounded-full backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <i className="bx bxs-receipt text-yellow-100 text-xl"></i>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">View Results</h3>
                <p className="text-white/60 text-sm">
                  Get visualizations and insights from your chat data.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - File Upload Area */}
          <div className="lg:pl-6">
            <div
              className={`
                relative p-8 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer
                ${isDragOver
                  ? 'border-gray-400 bg-gray-800/50'
                  : 'border-gray-600 bg-gray-800/20 hover:border-gray-500'
                }
                ${isProcessing ? 'border-gray-400 bg-gray-800/50' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".txt" // Only accept .txt files
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileSelect}
                disabled={isProcessing} // Disable input during processing
              />

              {!isProcessing ? (
                // Display upload prompt when not processing
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/30">
                      <i className="bx bxs-folder-open text-blue-400 text-3xl"></i>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-3">
                    {isDragOver ? 'Drop your file here' : 'Upload Your Chat Export'}
                  </h3>
                  <p className="text-white/60 mb-6">
                    {uploadProgress == 100
                      ? "File uploaded successfully! Click on Proceed to Dashboard."
                      : "Drag & drop your file or click to browse"}
                  </p>

                  <div className="flex justify-center space-x-4 text-xs text-white/50">
                    <span>.txt file</span>
                  </div>
                </div>
              ) : (
                // Display processing status when processing
                <div className="text-center">
                  <div className="mb-6">
                    <div className="inline-flex p-4 bg-emerald-500/20 rounded-2xl backdrop-blur-sm border border-emerald-400/30">
                      <i className="bx bx-check text-emerald-400 text-3xl"></i>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-4">Processing Your Chat...</h3>
                  <div className="w-full bg-slate-800/60 rounded-full h-3 mb-3 border border-slate-700/50">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-3 rounded-full transition-all duration-500 ease-out shadow-sm shadow-emerald-400/20"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-emerald-200/80 font-medium">{uploadProgress}% Complete</p>
                </div>
              )}
            </div>

            {/* CTA Button - "Proceed to Dashboard" */}
            <div className="mt-8 flex justify-center">
              <button
                onClick={onProceedToDashboard} // Calls the parent's handler
                disabled={uploadProgress < 100} // Button enabled only when upload is 100%
                className={`px-8 py-3 font-semibold rounded-lg transition-all duration-300 ${uploadProgress >= 100
                    ? 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/30 cursor-pointer'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed' // Disabled styling
                  }`}
              >
                Proceed to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;