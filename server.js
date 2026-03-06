require("dotenv").config();

const express = require("express");

const mongoose = require("mongoose");

const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());

app.use(express.json());

mongoose.connect(process.env.MONGO_URI)

.then(()=>console.log("MongoDB Connected"))

.catch(err=>console.log(err));

app.use("/api",userRoutes);

app.listen(process.env.PORT,()=>{

console.log("Server running");

});