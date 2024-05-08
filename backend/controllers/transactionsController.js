const Transaction = require('../models/transactionsModel');

exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.createTransaction = async (req, res) => {
    try {
        const newTransaction = new Transaction(req.body);
        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
