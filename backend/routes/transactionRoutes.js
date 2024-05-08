const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionsController');

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);

module.exports = router;
