require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const errorHandler = require("./middleware/errorHandlers")
const account = require("./routes/account")
const student = require("./routes/student")
const logInfo = require("./middleware/log")
const session = require("express-session")
const MongoStore = require("connect-mongo")

app = express()

const PORT = process.env.PORT || 9000
const IP = "192.168.89.1"
const SESSIONKEY = process.env.SESSIONKEY;
const DBURL = process.env.DBURL;

mongoose.connect(DBURL)
.then( res => console.log("Connected to mongodb successfully"))
.catch( error => console.log("Error while connecting to db"))



app.use(express.json())
app.use(cors())
app.use(session({
    secret: SESSIONKEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: DBURL, collectionName: "sessions"}),
    cookie: {
        maxAge: 1000*60*60*24*7 // expire in 7 days
    }
}))
app.use(logInfo)



app.use("/account", account);
app.use("/student", student);
app.use(errorHandler)


app.listen(PORT, IP, ()=>{
    console.log(`Server Running on ${IP}:${PORT}`)
})