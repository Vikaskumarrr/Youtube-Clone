const express = require("express");
require('dotenv').config();
const clc = require("cli-color")
const session = require("express-session");
const mongodbSession = require("connect-mongodb-session")(session);


// File-Improts
const db = require("./db")
const authRouter = require("./routers/authRouter");

// Constant
const app = express();
const PORT = process.env.PORT;
const store = new mongodbSession({
    uri : process.env.MONGO_URI,
    collection: "session",
})


//MiddleWares
app.use(express.json())
app.use(session({
    secret : process.env.SECRET_KEY,
    store : store,
    resave: false,
    saveUninitialized : false,
}))
app.use("/auth", authRouter)

app.listen(PORT,()=>{ 
    console.log(clc.yellowBright.underline("Server is up and runing PORT:8000"))
});
