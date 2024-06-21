// to connect with mongodb database
const mongoose = require("mongoose");
require("dotenv").config();

// connect function of mongodb to connect the database
exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(()=>console.log("DB connected successfully"))
    .catch((error) => {
        console.log("DB connection failed");
        console.error(error);
        process.exit(1);
    })
};