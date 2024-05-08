const express = require('express');
const connectDB = require('./db');
const saveUniqueTransactions = require('./services/transactionService');
const Transaction = require("./models/transactionsModel")
const axios = require("axios")
require('dotenv').config();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());

connectDB();

app.get('/save-transactions', async (req, res) => {
    try {
        await saveUniqueTransactions();
        res.send('Transactions saved successfully.');
    } catch (error) {
        console.error('Error saving transactions:', error);
        res.status(500).send('Error saving transactions.');
    }
});

app.get('/transactions', async (req, res) => {
    try {
        const searchText = req.query.search || '';
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.per_page) || 10;

        const queryConditions = {
            $or: [
                { title: { $regex: searchText, $options: 'i' } },
                { description: { $regex: searchText, $options: 'i' } }
            ]
        };

        const totalTransactions = await Transaction.countDocuments(queryConditions);

        let paginatedTransactions = [];
        if (totalTransactions > 0) {
            paginatedTransactions = await Transaction.find(queryConditions)
                .skip((page - 1) * perPage)
                .limit(perPage);
        }

        res.json({
            total_transactions: totalTransactions,
            transactions: paginatedTransactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).send('Error fetching transactions.');
    }
});

app.get('/statistics', async (req, res) => {
    try {
        const { month, year } = req.query;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const totalSaleAmount = await Transaction.aggregate([
            {
                $match: {
                    sold: true,
                    dateOfSale: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$price" }
                }
            }
        ]);

        const totalSoldItems = await Transaction.countDocuments({
            sold: true,
            dateOfSale: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const totalUnsoldItems = await Transaction.countDocuments({
            sold: false,
            dateOfSale: {
                $gte: startDate,
                $lte: endDate
            }
        });

        res.json({
            month,
            year,
            total_sale_amount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
            total_sold_items: totalSoldItems,
            total_unsold_items: totalUnsoldItems
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).send('Error fetching statistics.');
    }
});

Transaction.aggregate([
    { $group: { _id: null, minYear: { $min: { $year: '$dateOfSale' } }, maxYear: { $max: { $year: '$dateOfSale' } } } }
])
.then(result => {
    const [{ minYear, maxYear }] = result;

    app.get('/pie-chart', async (req, res) => {
        try {
            const { month } = req.query;
            const selectedMonth = parseInt(month);

            if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
                return res.status(400).json({ error: 'Invalid month parameter. Month must be between 1 and 12.' });
            }

            const startDate = new Date(minYear, selectedMonth - 1, 1);
            const endDate = new Date(maxYear, selectedMonth, 0);

            const categoryCounts = await Transaction.aggregate([
                {
                    $addFields: {
                        month: { $month: '$dateOfSale' }
                    }
                },
                {
                    $match: {
                        month: selectedMonth,
                        dateOfSale: { $gte: startDate, $lte: endDate }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const pieChartData = categoryCounts.map(({ _id, count }) => ({
                category: _id,
                items: count
            }));

            res.json(pieChartData);
        } catch (error) {
            console.error('Error retrieving pie chart data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
})
.catch(error => {
    console.error('Error:', error);
});

Transaction.aggregate([
    { $group: { _id: null, minYear: { $min: { $year: '$dateOfSale' } }, maxYear: { $max: { $year: '$dateOfSale' } } } }
])
.then(result => {
    const [{ minYear, maxYear }] = result;

    app.get('/bar-chart', async (req, res) => {
        try {
            const { month } = req.query;
            const selectedMonth = parseInt(month);

            if (isNaN(selectedMonth) || selectedMonth < 1 || selectedMonth > 12) {
                return res.status(400).json({ error: 'Invalid month parameter. Month must be between 1 and 12.' });
            }

            const startDate = new Date(minYear, selectedMonth - 1, 1);
            const endDate = new Date(maxYear, selectedMonth, 0);

            const priceRanges = [
                { min: 0, max: 100 },
                { min: 101, max: 200 },
                { min: 201, max: 300 },
                { min: 301, max: 400 },
                { min: 401, max: 500 },
                { min: 501, max: 600 },
                { min: 601, max: 700 },
                { min: 701, max: 800 },
                { min: 801, max: 900 },
                { min: 901, max: Infinity }
            ];

            const barChartData = [];

            for (const range of priceRanges) {
                const count = await Transaction.countDocuments({
                    price: { $gte: range.min, $lte: range.max },
                    dateOfSale: { $gte: startDate, $lte: endDate }
                });
                barChartData.push({ range: `${range.min}-${range.max}`, count });
            }

            res.json(barChartData);
        } catch (error) {
            console.error('Error retrieving bar chart data:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });
})
.catch(error => {
    console.error('Error:', error);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
