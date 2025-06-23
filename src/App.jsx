import React, { useState, useCallback } from 'react';
import Navbar from './Navbar.jsx';
import Hero from './Hero.jsx';
import WhatsAppAnalyzer from './whatsAppAnalyzer.jsx';

function App() {
  // State to hold the processed chat data (array of message objects)
  const [chatData, setChatData] = useState(null);
  // State to control which main view is shown: upload (Hero) or analysis (WhatsAppAnalyzer)
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  // State for upload progress, passed down to Hero
  const [uploadProgress, setUploadProgress] = useState(0);
  // State for indicating if a file is currently being processed, passed down to Hero
  const [isProcessing, setIsProcessing] = useState(false);

  // Utility function to parse the raw WhatsApp chat data from the text file.
  // This is crucial for transforming the flat text into a structured array of messages.
  const processChatData = useCallback((data) => {
    // Regex to match lines in the format "DD/MM/YY, HH:MM [AM/PM] - User: Message"
    const pattern = /(\d{2}\/\d{2}\/\d{2,4}, \d{1,2}:\d{2}\s?[ap]m) - ([^:]+): (.*)/g;
    const matches = [];
    let match;

    // Iterate through the raw chat data to find all message matches
    while ((match = pattern.exec(data)) !== null) {
      matches.push({
        dateTime: match[1], // e.g., "15/06/23, 10:30 AM"
        user: match[2].trim(), // e.g., "John Doe"
        message: match[3] // e.g., "Hey, how are you?"
      });
    }

    // Map the raw matches to a more detailed and usable format,
    // including Date objects and derived properties like month, year, day, etc.
    return matches.map(item => {
      // Convert 2-digit year to 4-digit for Date object
      // e.g., "15/06/23" becomes "2023-06-15" for correct Date parsing
      const dateString = item.dateTime.replace(/(\d{2})\/(\d{2})\/(\d{2})/, '20$3-$2-$1');
      const dateObj = new Date(dateString);

      return {
        ...item,
        dateObj, // JavaScript Date object
        month: dateObj.getMonth() + 1, // Month (1-12)
        year: dateObj.getFullYear(), // Full year (e.g., 2023)
        day: dateObj.getDate(), // Day of the month
        hour: dateObj.getHours(), // Hour (0-23)
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'long' }), // e.g., "Monday"
        monthName: dateObj.toLocaleDateString('en-US', { month: 'long' }) // e.g., "June"
      };
    });
  }, []);

  // Callback function passed to Hero to handle file selection/drop.
  // It simulates file reading and processing progress.
  const handleFileUpload = useCallback((file) => {
    setIsProcessing(true); // Start processing indicator
    setUploadProgress(0);   // Reset progress
    setChatData(null);      // Clear any previously loaded chat data

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result; // Get the raw text content of the file

      let progress = 0;
      // Simulate progress increase over time
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval); // Stop the simulation when 100%
          setIsProcessing(false);   // End processing indicator
          
          // Once simulated processing is complete, parse the real data
          const parsedData = processChatData(fileContent);
          setChatData(parsedData); // Store the structured chat data in state
        }
      }, 200); // Progress updates every 200ms
    };
    reader.readAsText(file); // Read the file as plain text
  }, [processChatData]); // Dependency array ensures memoization based on processChatData

  // Callback function passed to Hero for the "Proceed to Dashboard" button.
  const handleProceedToDashboard = useCallback(() => {
    // Only allow proceeding if upload is 100% complete and chatData is available
    console.log('Proceeding to dashboard with upload progress:', uploadProgress, 'and chat data:', chatData);
    if (uploadProgress === 100 && chatData) {
      setShowAnalyzer(true); // Switch to the analysis view
    }
  }, [uploadProgress, chatData]); // Dependencies for memoization

  // Callback function passed to WhatsAppAnalyzer to allow returning to the upload screen.
  const handleBackToUpload = useCallback(() => {
    setChatData(null);      // Clear chat data
    setShowAnalyzer(false); // Switch back to the Hero (upload) view
    setUploadProgress(0);   // Reset upload progress
    setIsProcessing(false); // Reset processing status
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative">
      <Navbar /> {/* Your navigation bar */}

      {/* Conditional rendering: show Analyzer if showAnalyzer is true, otherwise show Hero */}
      {showAnalyzer ? (
        <WhatsAppAnalyzer
          chatData={chatData}       // Pass the processed chat data to the analyzer
          onBackToUpload={handleBackToUpload} // Pass the function to return to upload screen
        />
      ) : (
        <Hero
          onFileUpload={handleFileUpload}         // Pass function to handle file input
          onProceedToDashboard={handleProceedToDashboard} // Pass function for dashboard button
          uploadProgress={uploadProgress}         // Pass current upload progress
          isProcessing={isProcessing}             // Pass current processing status
        />
      )}
    </div>
  );
}

export default App;
