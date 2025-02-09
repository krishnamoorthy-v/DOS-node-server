require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const errorHandler = require("./middleware/errorHandlers")
const account = require("./routes/account")
const student = require("./routes/student")
const security = require("./routes/security")
const warden = require("./routes/warden")
const transaction = require("./routes/transaction")
const logInfo = require("./middleware/log")
const session = require("express-session")
const MongoStore = require("connect-mongo")


app = express()

const PORT = process.env.PORT || 9000
// const IP = process.env.IP
const SESSIONKEY = process.env.SESSIONKEY;
const DBURL = process.env.DBURL;

mongoose.connect(DBURL, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
})
.then( res => console.log("Connected to mongodb successfully"))
.catch( error => console.log("Error while connecting to db ", error))

app.set("trust proxy", 1); // Trust first proxy
app.use(express.json({limit: "5mb"}))
app.use(cors({
    origin: "https://digital-outpass-system.netlify.app",
    credentials: true,
}))
app.use(session({

    secret: SESSIONKEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: DBURL, collectionName: "sessions"}),
    cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "None",
        maxAge: 1000*60*60*24*7 // expire in 7 days
    }
}))

app.use( (req, res, next) => {
    console.log("session: ", req?.session?.loginId)
    next();
})

//log info --> url call and method
app.use(logInfo)

//Standardize the Success Response
app.use( (req, res, next)=> {
    res.Response = (status, message, result) => {
        let info = {status, message}
        if(result){
            info = {status, message, result}
        } 
        res.json(info)
    }
    next();
})

//Standardize the Error Response
app.use( (req, res, next)=> {
    res.errorResponse = (status, title, message) => {
        const info = {status, title, message}
        res.json(info)
    }
    next();
})


app.use("/account", account);
app.use("/student", student);
app.use("/security", security);
app.use("/warden", warden);
app.use("/transaction", transaction);

// app.use("/*", (req, res)=> {
//     res.send(`url not found --> ${req.method}: ${req.url}`)
// })

app.use(errorHandler)


app.listen(PORT, ()=>{
    console.log(`Server Running on :${PORT}`)
})
