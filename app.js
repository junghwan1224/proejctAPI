var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
var fileUpload = require("express-fileupload");

var cors = require("cors");
require("dotenv").config();
var app = express();

var options = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB,
};

app.use(
  cors({
    credentials: true,
    origin: [
      "https://montar.co.kr",
      "http://localhost:3000",
      "http://localhost:3002",
    ],
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.use(
  session({
    secret: "HERMES",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 900000 }, // 15 minutes
    store: new MySQLStore(options),
  })
);

// Routes for user and admin:
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const acmeChallengeRouter = require("./routes/acmeChallenge");
userRouter(app);
adminRouter(app);
acmeChallengeRouter(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
