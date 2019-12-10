var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);

var cors = require("cors");
require("dotenv").config();
var app = express();

var options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: null,
  database: process.env.DB
};

// cors
// const allowedOrigins = ["http://192.168.0.13:3000", "http://yourapp.com"];
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002"
    ]
  })
  // cors({
  //   origin: function(origin, callback) {
  //     // allow requests with no origin
  //     // (like mobile apps or curl requests)
  //     if (!origin) return callback(null, true);
  //     if (allowedOrigins.indexOf(origin) === -1) {
  //       var msg =
  //         "The CORS policy for this site does not " +
  //         "allow access from the specified Origin.";
  //       return callback(new Error(msg), false);
  //     }
  //     return callback(null, true);
  //   }
  // })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "HERMES",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 900000 }, // 15 minutes
    store: new MySQLStore(options)
  })
);

// Router setup
const verifyTokenRouter = require("./routes/verify");
const accountRouter = require("./routes/account");
const articleRouter = require("./routes/article");
const paymentRouter = require("./routes/payment");
const basketRouter = require("./routes/basket");
const favoriteRouter = require("./routes/favorite");
const productRouter = require("./routes/product");
const deliveryRouter = require("./routes/delivery");
const addressRouter = require("./routes/address");
const rosterRouter = require("./routes/roster");
const inquiryRouter = require("./routes/inquiry");
const transactionRouter = require("./routes/transaction");

app.use("/api/verify-token", verifyTokenRouter);
app.use("/api/account", accountRouter);
app.use("/api/article", articleRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/basket", basketRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/product", productRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/inquiry", inquiryRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/roster", rosterRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
