import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function TransactionStatistics() {
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState(null);
  const { month, year } = useParams();

  useEffect(() => {
    if (!month || !year) return;

    axios.get(`http://localhost:8000/statistics`, {
      params: {
        month: month,
        year: year
      }
    })
      .then(response => {
        setStatistics(response.data);
      })
      .catch(err => {
        console.error('Error fetching statistics:', err);
        setError('Error fetching statistics. Please try again later.');
      });
  }, [month, year]);

  return (
    <div className="bg-gray-200 p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Transactions Statistics</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        statistics && (
          <>
            <p>Total Amount of Sale: {statistics.total_sale_amount}</p>
            <p>Total Sold Items: {statistics.total_sold_items}</p>
            <p>Total Not Sold Items: {statistics.total_unsold_items}</p>
          </>
        )
      )}
    </div>
  );
}

export default TransactionStatistics;
