import React from 'react';
import { Bar } from 'react-chartjs-2';

function BarChart({ chartData }) {
  return (
    <div>
      <h2>Bar Chart</h2>
      <div>
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default BarChart;
