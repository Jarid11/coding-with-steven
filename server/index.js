/*if we were connecting to a database
require('dotenv').config();
const massive = require('massive');

Every server is an api but not all api's are servers(like react)
*/
require("dotenv").config();
const express = require("express");
const { json } = require("body-parser"); //json is language of servers
const cors = require("cors");
const port = 3001;
const app = express();
const session = require("express-session");
//if it is in an app.use, it is a top level middleware
// app.use((req, res, next) => {
//   if (req.method != "GET") {
//     res.status(405).json({ message: "this api is read only" });
//   } else {
//     next();
//   }
// });
//request level middlewares are per each request. ei logger in http req

//calling next under the hood
app.use(json());
app.use(cors());

//this is our session object
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false /*dont save a session unless if it was interacted with. This helps save on storage and cookies*/,
    resave: false,
    cookie: {
      maxAge: 2 * 7 * 24 * 60 * 60 * 1000
    }
  })
);

app.use(logger);

app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  next();
});
app.post("/api/cart", (req, res) => {
  req.session.cart.push(req.body);
  res.status(200).json(req.session.cart);
});

app.get("/api/cart", (req, res) => {
  if (req.query.type) {
    const filtered = req.session.cart.filter(
      (val = val.type === req.query.type)
    );
    res.status(200).json(filtered);
  } else {
    res.status(200).json(req.session.cart);
  }
});

app.get("/api/test", (req, res, next) => {
  res.status(200).json({ message: "its working!!" });
});
app.get("/api/nomids", (req, res, next) => {
  res.status(200).json({ message: "no middles" });
});
app.post("/api/adminpath", isAuthed, (req, res, next) => {
  res.status(200).json({ message: "some sensitive info" });
});

app.delete("/api/cart/:type", (req, res) => {
  if (!req.session.cart.length) {
    res.status(500).json({ message: "nothing in cart" });
  } else {
    const { cart } = req.session;
    const filtered = cart.filter(val => (val.type = req.params.type));
    req.session.cart = filtered;
    res.status(200).json(req.session.cart);
  }
});

//delete session

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`i am listening on ${port}`);
});

/*next is provided by our node used by our 
middlewares. Next is a function that tells 
us to go to the next funciton in the chain..
Any custom middlewares you use, you must
make your own next function;
*/
function logger(req, res, next) {
  console.log("REQ.SESSION: ", req.session);
  console.log("REQ.BODY: ", req.body);
  console.log("REQ.QUERY: ", req.query);
  next();
}
function isAuthed(req, res, next) {
  if (req.body.user.role === "Admin") {
    next();
  } else {
    res.status(401).json({ message: "unauthorized" });
  }
}
