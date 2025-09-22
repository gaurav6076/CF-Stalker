import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function StatisticsCharts({ problemsByRating, problemsByTopic }) {
  // Vibrant colors for the pie chart
  const pieColors = [
    '#FF6384', // Bright Pink
    '#36A2EB', // Bright Blue
    '#FFCE56', // Bright Yellow
    '#4BC0C0', // Turquoise
    '#9966FF', // Purple
    '#FF9F40', // Orange
    '#32CD32', // Lime Green
    '#BA55D3', // Medium Orchid
    '#FF4500', // Orange Red
    '#1E90FF', // Dodger Blue
    '#FFD700', // Gold
    '#98FB98', // Pale Green
    '#DDA0DD', // Plum
    '#87CEEB', // Sky Blue
    '#F08080', // Light Coral
  ];

  // Prepare data for rating histogram
  const ratingData = {
    labels: Object.keys(problemsByRating).sort((a, b) => a - b),
    datasets: [
      {
        label: 'Number of Problems',
        data: Object.entries(problemsByRating)
          .sort(([a], [b]) => a - b)
          .map(([_, problems]) => problems.length),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for topic pie chart
  const topicData = {
    // Create labels with counts included
    labels: Object.entries(problemsByTopic).map(([topic, problems]) => 
      `${topic} (${problems.length})`
    ),
    datasets: [
      {
        data: Object.values(problemsByTopic).map(problems => problems.length),
        backgroundColor: pieColors,
        borderColor: pieColors.map(color => color.replace('1)', '1)')),
        borderWidth: 2,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgb(224, 224, 224)', // text-cf-text
          font: {
            size: 12,
            weight: 'bold'
          },
          padding: 20,
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10
        }
      },
      title: {
        display: true,
        color: 'rgb(79, 195, 247)', // text-cf-blue
        font: {
          size: 18,
          weight: 'bold'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgb(27, 27, 27)', // bg-cf-dark
        titleColor: 'rgb(79, 195, 247)', // text-cf-blue
        bodyColor: 'rgb(224, 224, 224)', // text-cf-text
        borderColor: 'rgb(75, 85, 99)', // border-cf-gray
        borderWidth: 1,
        padding: 12,
        bodyFont: {
          size: 14
        }
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: {
        ticks: {
          color: 'rgb(224, 224, 224)' // text-cf-text
        },
        grid: {
          color: 'rgba(224, 224, 224, 0.1)' // text-cf-text with opacity
        }
      },
      y: {
        ticks: {
          color: 'rgb(224, 224, 224)' // text-cf-text
        },
        grid: {
          color: 'rgba(224, 224, 224, 0.1)' // text-cf-text with opacity
        }
      }
    }
  };

  const pieOptions = {
    ...commonOptions,
    plugins: {
      ...commonOptions.plugins,
      legend: {
        ...commonOptions.plugins.legend,
        position: 'bottom',
        align: 'center',
        labels: {
          ...commonOptions.plugins.legend.labels,
          padding: 15,
          font: {
            size: 13,
            weight: 'bold'
          },
          color: 'rgb(224, 224, 224)', // text-cf-text
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 10,
          boxHeight: 10,
          lineHeight: 1.5,
          textOverflow: 'ellipsis'
        },
        maxHeight: 200,
        maxWidth: 800,
        textDirection: 'ltr',
        rtl: false
      },
      datalabels: {
        display: false
      },
      tooltip: {
        ...commonOptions.plugins.tooltip,
        callbacks: {
          label: function(context) {
            const label = context.label.split(' (')[0];
            const value = context.parsed;
            return `${label}: ${value} problems`;
          }
        }
      }
    },
    layout: {
      padding: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 80
      }
    },
    maintainAspectRatio: false,
    aspectRatio: 1,
    radius: '85%'
  };

  // Custom plugin to arrange legend in two columns with better spacing
  const legendPlugin = {
    id: 'legendColumns',
    beforeInit: function(chart) {
      const originalFit = chart.legend.fit;
      chart.legend.fit = function fit() {
        originalFit.bind(chart.legend)();
        this.height = this.maxHeight;
        
        // Arrange items in two columns with more space
        const itemWidth = this.width / 2;
        let currentColumn = 0;
        let currentRow = 0;
        
        this.legendItems.forEach((item, i) => {
          item.x = currentColumn * itemWidth + 20; // Added left padding
          item.y = currentRow * 30; // Increased vertical spacing
          
          currentColumn++;
          if (currentColumn >= 2) {
            currentColumn = 0;
            currentRow++;
          }
        });
      };
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating Distribution Histogram */}
      <div className="bg-cf-dark dark:bg-cf-dark-light rounded-lg p-6 shadow-cf">
        <h3 className="text-xl font-bold text-cf-blue dark:text-cf-blue-light mb-4">Problem Rating Distribution</h3>
        <div className="h-[300px]">
          <Bar
            data={ratingData}
            options={{
              ...barOptions,
              plugins: {
                ...barOptions.plugins,
                title: {
                  ...barOptions.plugins.title,
                  text: 'Problems by Rating',
                  color: 'rgb(79, 195, 247)' // text-cf-blue
                },
                legend: {
                  ...barOptions.plugins.legend,
                  labels: {
                    ...barOptions.plugins.legend.labels,
                    color: 'rgb(79, 195, 247)' // text-cf-blue
                  }
                }
              },
              scales: {
                x: {
                  ticks: {
                    color: 'rgb(224, 224, 224)' // text-cf-text
                  },
                  grid: {
                    color: 'rgba(224, 224, 224, 0.1)' // text-cf-text with opacity
                  }
                },
                y: {
                  ticks: {
                    color: 'rgb(224, 224, 224)' // text-cf-text
                  },
                  grid: {
                    color: 'rgba(224, 224, 224, 0.1)' // text-cf-text with opacity
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Topic Distribution Pie Chart */}
      <div className="bg-cf-dark dark:bg-cf-dark-light rounded-lg p-6 shadow-cf">
        <h3 className="text-xl font-bold text-cf-blue dark:text-cf-blue-light mb-4">Problem Topic Distribution</h3>
        <div className="relative" style={{ height: '600px' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full">
              <Pie
                data={topicData}
                options={{
                  ...pieOptions,
                  plugins: {
                    ...pieOptions.plugins,
                    title: {
                      ...pieOptions.plugins.title,
                      text: 'Problems by Topic',
                      color: 'rgb(79, 195, 247)', // text-cf-blue
                      font: {
                        size: 20,
                        weight: 'bold'
                      }
                    },
                    legend: {
                      ...pieOptions.plugins.legend,
                      labels: {
                        ...pieOptions.plugins.legend.labels,
                        color: 'rgb(224, 224, 224)', // text-cf-text
                        padding: 15,
                        font: {
                          size: 13,
                          weight: 'bold'
                        }
                      }
                    },
                    tooltip: {
                      bodyFont: {
                        size: 14
                      },
                      padding: 12,
                      titleColor: 'rgb(79, 195, 247)', // text-cf-blue
                      bodyColor: 'rgb(224, 224, 224)', // text-cf-text
                      backgroundColor: 'rgb(27, 27, 27)', // bg-cf-dark
                      borderColor: 'rgb(75, 85, 99)', // border-cf-gray
                      borderWidth: 1
                    }
                  }
                }}
                plugins={[legendPlugin]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatisticsCharts; 