// services/transactionService.js

const axios = require("axios");
const Transaction = require("../models/transactionsModel"); // Assuming you have a Transaction model defined

async function saveUniqueTransactions() {
    try {
        // Fetch transaction data from the API
        const response = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");
        const transactionsData = response.data;

        // Iterate over each transaction data
        for (const transactionData of transactionsData) {
            // Check if the transaction already exists in the database
            const existingTransaction = await Transaction.findOne({ id: transactionData.id });

            // If the transaction does not exist, save it to the database
            if (!existingTransaction) {
                const transaction = new Transaction({
                    id: transactionData.id,
                    title: transactionData.title,
                    price: transactionData.price,
                    description: transactionData.description,
                    category: transactionData.category,
                    image: transactionData.image,
                    sold: transactionData.sold,
                    dateOfSale: transactionData.dateOfSale
                });
                await transaction.save();
                console.log("Transaction saved:", transaction);
            } else {
                console.log("Transaction already exists:", existingTransaction);
            }
        }

        console.log("All unique transactions saved to the database.");
    } catch (error) {
        console.error("Error saving transactions:", error);
        throw error;
    }
}

module.exports = saveUniqueTransactions;
