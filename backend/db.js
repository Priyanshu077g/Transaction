const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.DB_URL);
        console.log("DB connected successfully" );
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
}


module.exports = connectDB;
