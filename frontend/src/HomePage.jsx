import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TransactionStatistics from './TransactionStatistics';
import BarChart from './BarChart';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [error, setError] = useState(null);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [chartData, setChartData] = useState(null);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchData();
  }, [currentPage, searchTerm, selectedMonth, selectedYear]);

  const fetchData = () => {
    const queryParams = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
      month: selectedMonth,
      year: selectedYear
    };

    axios.get('http://localhost:8000/transactions', { params: queryParams })
      .then(response => {
        setTransactions(response.data.transactions);
        const totalPages = Math.ceil(response.data.total_transactions / ITEMS_PER_PAGE);
        setTotalPages(totalPages);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setError('Error fetching data. Please try again later.');
      });
  };

  const fetchChartData = () => {
    axios.get('http://localhost:8000/pie-chart')
      .then(response => {
        setChartData(response.data);
      })
      .catch(error => {
        console.error('Error fetching chart data:', error);
      });
  };

  const handleSearch = event => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleMonthChange = event => {
    setSelectedMonth(event.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = event => {
    setSelectedYear(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = direction => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(prevPage => prevPage - 1);
    } else if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handleShowStatistics = () => {
    const url = `/statistics/${selectedMonth}/${selectedYear}`;
    window.open(url, '_blank');
  };

  const handleShowChart = () => {
    setShowChart(true);
    fetchChartData();
  };

  return (
    <>
      <div>
        <div>
          <input
            type="text"
            placeholder="Search transaction"
            value={searchTerm}
            onChange={handleSearch}
          />
          <select value={selectedMonth} onChange={handleMonthChange}>
            <option value="">All Months</option>
            {[...Array(12)].map((_, index) => (
              <option key={index} value={index}>{new Date(2000, index, 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <select value={selectedYear} onChange={handleYearChange}>
            <option value="">All Years</option>
            {[...Array(10)].map((_, index) => (
              <option key={index} value={2022 - index}>{2022 - index}</option>
            ))}
          </select>
          <button onClick={handleShowStatistics}>Show Statistics</button>
          <button onClick={handleShowChart}>Show Chart</button>
        </div>
        {error ? (
          <p>{error}</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Category</th>
                  <th>Sold</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.title}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.price}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.sold ? 'Yes' : 'No'}</td>
                    <td><img src={transaction.image} alt={transaction.title} style={{ width: '50px', height: '50px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div>
              <button onClick={() => handlePageChange('prev')} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => handlePageChange('next')} disabled={currentPage === totalPages}>Next</button>
            </div>
          </>
        )}
      </div>
      {showStatistics && <TransactionStatistics selectedMonth={selectedMonth} selectedYear={selectedYear} />}
      {showChart && <BarChart chartData={chartData} />}
    </>
  );
}

export default HomePage;
