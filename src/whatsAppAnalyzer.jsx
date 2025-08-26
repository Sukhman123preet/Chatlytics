import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import Chart from 'chart.js/auto'; // Import Chart.js

// Add Boxicons CSS dynamically if not already present
const boxiconsLink = document.createElement('link');
boxiconsLink.rel = 'stylesheet';
boxiconsLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/boxicons/2.1.4/css/boxicons.min.css';
if (!document.querySelector('link[href*="boxicons"]')) {
  document.head.appendChild(boxiconsLink);
}

// Add Chart.js CDN dynamically if not already present
const chartjsScript = document.createElement('script');
chartjsScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
chartjsScript.async = true;
if (!document.querySelector('script[src*="chart.js"]')) {
  document.head.appendChild(chartjsScript);
}


// WhatsAppAnalyzer component, now receives chatData and onBackToUpload as props
function WhatsAppAnalyzer({ chatData, onBackToUpload }) {
  const [selectedUser, setSelectedUser] = useState('overall'); // State for user filter
  const [analysisData, setAnalysisData] = useState(null); // State to hold all analysis results

  // Refs for Chart.js canvas elements
  const pieChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const dayChartRef = useRef(null);
  const monthChartRef = useRef(null);

  // Store Chart.js instances to destroy them on re-render
  const charts = useRef({});

  // Utility function to extract URLs from message text
  const extractURLs = useCallback((text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  }, []);

  // Utility function to extract emojis from message text (supports wide range of emojis)
  const extractEmojis = useCallback((text) => {
    const emojiRegex = /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
    return text.match(emojiRegex) || [];
  }, []);

  // Function to calculate general statistics (total messages, words, media, URLs, emojis)
  const fetchStats = useCallback((user, data) => {
    let filteredData = user === 'overall' ? data : data.filter(item => item.user === user);
    
    let totalMessages = filteredData.length;
    let totalWords = 0;
    let mediaMessages = 0;
    let totalUrls = 0;
    let emojiFreq = {};

    filteredData.forEach(item => {
      const message = item.message;
      
      if (message === '<Media omitted>') {
        mediaMessages++;
      } else {
        const words = message.split(/\s+/).filter(word => word.length > 0); // Split by whitespace and filter empty strings
        totalWords += words.length;
        
        const urls = extractURLs(message);
        totalUrls += urls.length;
        
        const emojis = extractEmojis(message);
        emojis.forEach(emoji => {
          emojiFreq[emoji] = (emojiFreq[emoji] || 0) + 1;
        });
      }
    });

    return {
      totalMessages,
      totalWords,
      mediaMessages,
      totalUrls,
      emojiFreq,
      filteredData
    };
  }, [extractEmojis, extractURLs]);

  // Function to determine the most active users for the "overall" view
 // Function to determine the most active users for the "overall" view
const getMostActiveUsers = useCallback((data) => {
  const userCounts = {};
  data.forEach(item => {
    userCounts[item.user] = (userCounts[item.user] || 0) + 1;
  });

  const totalMessages = data.length;

  // Sort users by message count in descending order
  const sortedUsers = Object.entries(userCounts)
    .sort(([, a], [, b]) => b - a);

  // Top 5 users only
  const topUsers = sortedUsers.slice(0, 5);

  // Remaining users count as "Others"
  const othersCount = sortedUsers.slice(5).reduce((sum, [, count]) => sum + count, 0);

  // Prepare final array with "Others"
  const result = topUsers.map(([user, count]) => ({
    user,
    count,
    percentage: ((count / totalMessages) * 100).toFixed(1)
  }));

  if (othersCount > 0) {
    result.push({
      user: "Others",
      count: othersCount,
      percentage: ((othersCount / totalMessages) * 100).toFixed(1)
    });
  }

  return result;
}, []);


  // Function to get quarterly message timeline
  const getQuarterlyTimeline = useCallback((user, data) => {
    let filteredData = user === 'overall' ? data : data.filter(item => item.user === user);
    
    const quarterlyData = {};
    filteredData.forEach(item => {
      const quarter = Math.ceil(item.month / 3); // Determine the quarter (1-4)
      const key = `Q${quarter}-${item.year}`;
      quarterlyData[key] = (quarterlyData[key] || 0) + 1;
    });
    
    // Sort by year and then quarter for correct timeline order
    return Object.entries(quarterlyData)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => {
        const [qA, yA] = a.time.substring(1).split('-').map(Number);
        const [qB, yB] = b.time.substring(1).split('-').map(Number);
        if (yA !== yB) return yA - yB;
        return qA - qB;
      });
  }, []);

  // Function to get message activity by day of the week
  const getWeekActivity = useCallback((user, data) => {
    let filteredData = user === 'overall' ? data : data.filter(item => item.user === user);
    
    const dayActivity = {
      'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0
    }; // Initialize with all days to ensure order
    filteredData.forEach(item => {
      dayActivity[item.dayName]++;
    });
    
    return Object.entries(dayActivity).map(([day, count]) => ({ day, count }));
  }, []);

  // Function to get message activity by month
  const getMonthActivity = useCallback((user, data) => {
    let filteredData = user === 'overall' ? data : data.filter(item => item.user === user);
    
    const monthActivity = {
        'January': 0, 'February': 0, 'March': 0, 'April': 0, 'May': 0, 'June': 0,
        'July': 0, 'August': 0, 'September': 0, 'October': 0, 'November': 0, 'December': 0
    }; // Initialize with all months to ensure order
    filteredData.forEach(item => {
      monthActivity[item.monthName]++;
    });
    
    return Object.entries(monthActivity).map(([month, count]) => ({ month, count }));
  }, []);

  // Function to create hourly activity heat map data
  const getHourlyHeatMap = useCallback((user, data) => {
    let filteredData = user === 'overall' ? data : data.filter(item => item.user === user);
    
    const heatMapData = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Initialize heat map with zeros for all hours and days
    days.forEach(day => {
      heatMapData[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        heatMapData[day][hour] = 0;
      }
    });
    
    // Populate heat map with actual message counts
    filteredData.forEach(item => {
      heatMapData[item.dayName][item.hour]++;
    });
    
    return heatMapData;
  }, []);

  // useEffect hook to re-calculate analysis data whenever chatData or selectedUser changes
  useEffect(() => {
    if (chatData && chatData.length > 0) { // Ensure chatData exists and is not empty
      const stats = fetchStats(selectedUser, chatData);
      const mostActive = getMostActiveUsers(chatData); // Most active users are always overall
      const quarterly = getQuarterlyTimeline(selectedUser, chatData);
      const weekActivity = getWeekActivity(selectedUser, chatData);
      const monthActivity = getMonthActivity(selectedUser, chatData);
      const heatMap = getHourlyHeatMap(selectedUser, chatData);
      
      setAnalysisData({
        stats,
        mostActive,
        quarterly,
        weekActivity,
        monthActivity,
        heatMap
      });
    } else {
      setAnalysisData(null); // Reset analysis data if chatData is cleared
    }
  }, [chatData, selectedUser, fetchStats, getMostActiveUsers, getQuarterlyTimeline, getWeekActivity, getMonthActivity, getHourlyHeatMap]);

  // Define colors for Pie Chart segments
  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#FF00FF', '#00FFFF'];

  // Effect to render Chart.js charts when analysisData is available
  useEffect(() => {
    if (analysisData) {
      // Destroy existing charts to prevent memory leaks/duplicates
      Object.values(charts.current).forEach(chart => chart.destroy());
      charts.current = {}; // Clear the chart instances

      // Render Pie Chart
      if (selectedUser === 'overall' && analysisData.mostActive.length > 0 && pieChartRef.current) {
        const ctx = pieChartRef.current.getContext('2d');
        charts.current.pieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: analysisData.mostActive.map(d => d.user),
            datasets: [{
              data: analysisData.mostActive.map(d => d.count),
              backgroundColor: pieColors.slice(0, analysisData.mostActive.length),
              hoverOffset: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#F9FAFB' // White text for legend
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed !== null) {
                      label += context.parsed + ' (' + analysisData.mostActive[context.dataIndex].percentage + '%)';
                    }
                    return label;
                  }
                },
                backgroundColor: '#1F2937',
                titleColor: '#F9FAFB',
                bodyColor: '#F9FAFB',
                borderColor: '#6B7280',
                borderWidth: 1,
                cornerRadius: 8,
              }
            }
          }
        });
      }

      // Render Line Chart
      if (analysisData.quarterly.length > 0 && lineChartRef.current) {
        const ctx = lineChartRef.current.getContext('2d');
        charts.current.lineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: analysisData.quarterly.map(d => d.time),
            datasets: [{
              label: 'Messages',
              data: analysisData.quarterly.map(d => d.count),
              borderColor: '#8B5CF6',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              tension: 0.1,
              pointBackgroundColor: '#8B5CF6',
              pointBorderColor: '#fff',
              pointHoverRadius: 8,
              pointHoverBackgroundColor: '#8B5CF6',
              pointHoverBorderColor: '#fff',
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: '#9CA3AF' }, // X-axis label color
                grid: { color: '#374151' } // X-axis grid line color
              },
              y: {
                ticks: { color: '#9CA3AF' }, // Y-axis label color
                grid: { color: '#374151' } // Y-axis grid line color
              }
            },
            plugins: {
              legend: {
                display: false // Hide legend for single dataset
              },
              tooltip: {
                backgroundColor: '#1F2937',
                titleColor: '#F9FAFB',
                bodyColor: '#F9FAFB',
                borderColor: '#6B7280',
                borderWidth: 1,
                cornerRadius: 8,
              }
            }
          }
        });
      }

      // Render Bar Chart (Most Busy Days)
      if (analysisData.weekActivity.length > 0 && dayChartRef.current) {
        const ctx = dayChartRef.current.getContext('2d');
        charts.current.dayChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: analysisData.weekActivity.map(d => d.day),
            datasets: [{
              label: 'Messages',
              data: analysisData.weekActivity.map(d => d.count),
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: '#9CA3AF' },
                grid: { color: '#374151' }
              },
              y: {
                ticks: { color: '#9CA3AF' },
                grid: { color: '#374151' }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#1F2937',
                titleColor: '#F9FAFB',
                bodyColor: '#F9FAFB',
                borderColor: '#6B7280',
                borderWidth: 1,
                cornerRadius: 8,
              }
            }
          }
        });
      }

      // Render Bar Chart (Most Busy Months)
      if (analysisData.monthActivity.length > 0 && monthChartRef.current) {
        const ctx = monthChartRef.current.getContext('2d');
        charts.current.monthChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: analysisData.monthActivity.map(d => d.month),
            datasets: [{
              label: 'Messages',
              data: analysisData.monthActivity.map(d => d.count),
              backgroundColor: '#F59E0B',
              borderColor: '#F59E0B',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: '#9CA3AF' },
                grid: { color: '#374151' }
              },
              y: {
                ticks: { color: '#9CA3AF' },
                grid: { color: '#374151' }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: '#1F2937',
                titleColor: '#F9FAFB',
                bodyColor: '#F9FAFB',
                borderColor: '#6B7280',
                borderWidth: 1,
                cornerRadius: 8,
              }
            }
          }
        });
      }
    }

    // Cleanup function to destroy charts when component unmounts or data changes
    return () => {
      Object.values(charts.current).forEach(chart => chart.destroy());
      charts.current = {};
    };
  }, [analysisData, selectedUser, pieColors]);


  // If analysisData is not yet available (e.g., still loading or no data), show a loading message
  if (!analysisData) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-white text-xl">
        <i className='bx bx-loader-alt bx-spin text-4xl mb-4'></i>
        <p>Loading analysis...</p>
      </div>
    );
  }

  // Get unique users for the dropdown filter, including 'overall' option
  const uniqueUsers = ['overall', ...new Set(chatData.map(item => item.user))];

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white text-center md:text-left">WhatsApp Chat Analysis</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* User filter dropdown */}
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg px-4 py-2 text-white w-full sm:w-auto"
            >
              {uniqueUsers.map(user => (
                <option key={user} value={user} className="bg-slate-800 text-white">
                  {user}
                </option>
              ))}
            </select>
            {/* Back to upload button */}
            <button
              onClick={onBackToUpload}
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white transition-colors w-full sm:w-auto"
            >
              Upload New File
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
  <div className="flex items-center justify-between">
    <h3 className="text-white/70 text-sm font-medium">Total Messages</h3>
    <img
      src="/total.gif" // 👈 your gif path here
      alt="Message Icon"
      className="w-8 h-8 rounded-xl "
    />
  </div>
  <p className="text-2xl font-bold text-white">{analysisData.stats.totalMessages}</p>
</div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
    <h3 className="text-white/70 text-sm font-medium">Total words</h3>
    <img
      src="/total.gif" // 👈 your gif path here
      alt="Message Icon"
      className="w-8 h-8 rounded-xl "
    />
  </div>
            <p className="text-2xl font-bold text-white">{analysisData.stats.totalWords}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
    <h3 className="text-white/70 text-sm font-medium">Media shared</h3>
    <img
      src="/media.gif" // 👈 your gif path here
      alt="Message Icon"
      className="w-8 h-8 rounded-xl "
    />
  </div>
            <p className="text-2xl font-bold text-white">{analysisData.stats.mediaMessages}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
    <h3 className="text-white/70 text-sm font-medium">Links shared</h3>
    <img
      src="/click.gif" // 👈 your gif path here
      alt="Message Icon"
      className="w-8 h-8 rounded-xl "
    />
  </div>
            <p className="text-2xl font-bold text-white">{analysisData.stats.totalUrls}</p>
          </div>
        </div>

        {/* Most Active Users (only shown for overall view) */}
        {selectedUser === 'overall' && analysisData.mostActive.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Most Active Users</h3>
              <div className="relative" style={{ height: '300px' }}> {/* Container for responsive canvas */}
                <canvas ref={pieChartRef}></canvas>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">User Statistics</h3>
              <div className="space-y-3">
                {analysisData.mostActive.map((user, index) => (
                  <div key={index} className="flex justify-between items-center text-white">
                    <span>{user.user}</span>
                    <div className="text-right">
                      <div className="font-semibold">{user.count} messages</div>
                      <div className="text-white/60 text-sm">{user.percentage}% of total</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Emoji Analysis */}
        {Object.keys(analysisData.stats.emojiFreq).length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Most used Emojis</h3>
            <div className="flex flex-wrap gap-4">
              {Object.entries(analysisData.stats.emojiFreq)
                .sort(([,a], [,b]) => b - a) // Sort by frequency
                .slice(0, 10) // Show top 10 emojis
                .map(([emoji, count], index) => (
                  <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-white">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Quarterly Timeline */}
        {analysisData.quarterly.length > 0 && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Quarterly Timeline</h3>
            <div className="relative" style={{ height: '300px' }}> {/* Container for responsive canvas */}
              <canvas ref={lineChartRef}></canvas>
            </div>
          </div>
        )}

        {/* Activity by Day and Month */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Most Busy Days</h3>
            <div className="relative" style={{ height: '300px' }}> {/* Container for responsive canvas */}
              <canvas ref={dayChartRef}></canvas>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Most Busy Months</h3>
            <div className="relative" style={{ height: '300px' }}> {/* Container for responsive canvas */}
              <canvas ref={monthChartRef}></canvas>
            </div>
          </div>
        </div>

        {/* Hourly Heat Map (remains as HTML grid as it's not a standard chart type for libraries like Chart.js) */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Hourly Activity Heat Map</h3>
          <div className="overflow-x-auto">
            {/* Grid for hours labels */}
            <div className="grid grid-cols-[auto_repeat(24,minmax(24px,1fr))] gap-1 min-w-max pb-2">
              <div className="w-10"></div> {/* Empty corner for alignment */}
              {Array.from({length: 24}, (_, i) => (
                <div key={i} className="text-white/60 text-xs text-center p-1 font-semibold">{i < 10 ? `0${i}` : i}</div>
              ))}
            </div>
            {/* Grid for day rows and hourly cells */}
            <div className="grid grid-cols-[auto_repeat(24,minmax(24px,1fr))] gap-1 min-w-max">
              {Object.entries(analysisData.heatMap).map(([day, hours]) => (
                <React.Fragment key={day}>
                  <div className="text-white/60 text-xs p-1 font-semibold text-right">{day.slice(0, 3)}</div>
                  {Object.entries(hours).map(([hour, count]) => {
                    // Calculate intensity for background color
                    const maxCount = Math.max(...Object.values(analysisData.heatMap).flatMap(Object.values));
                    const intensity = maxCount > 0 ? Math.min(count / maxCount, 1) : 0;
                    
                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="w-full h-8 rounded flex items-center justify-center text-xs text-center"
                        style={{
                          backgroundColor: `rgba(139, 92, 246, ${intensity * 0.8 + 0.1})`, // Base opacity + intensity
                          color: intensity > 0.5 ? 'white' : '#9CA3AF', // Text color based on intensity
                          fontWeight: count > 0 ? 'bold' : 'normal'
                        }}
                        title={`${day} ${hour}:00 - ${count} messages`}
                      >
                        {count > 0 ? count : ''}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppAnalyzer;