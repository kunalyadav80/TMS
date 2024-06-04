const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { checkUserExistence, setupUser, updateUser, getUserData, createTransactionCloudflare, getUserPhoneCloudflare, getLastTransaction, getAllTransactionsOfSpecificUser, createTransactionAdmin, getUserDataUsingPhoneAdmin, getAllUserDataAdmin, getAllTransactionsAdmin, getUserTransactionsUsingEmailAdmin, getStatsAdmin, updateUserTransactionsUsingID, deleteUserTransactionsUsingID } = require("./db_operations");
const { authMiddleware } = require("./auth_middleware");
const { authMiddlewareAdmin } = require("./auth_middleware_admin");
const fs = require('fs');
const https = require('https');



// ░░░███████╗███╗░░██╗██╗░░░██╗
// ░░░██╔════╝████╗░██║██║░░░██║
// ░░░█████╗░░██╔██╗██║╚██╗░██╔╝
// ░░░██╔══╝░░██║╚████║░╚████╔╝░
// ██╗███████╗██║░╚███║░░╚██╔╝░░
// ╚═╝╚══════╝╚═╝░░╚══╝░░░╚═╝░░░

// Environment Variables
require("dotenv").config();
const DEV_MODE = process.env.DEV_MODE;
let DB_HOST;
let DB_USER;
let DB_PASS;
let DB_NAME;
let DB_PORT;
let PORT;

const INVOICE_URL_ENCRYPTION_KEY = process.env.INVOICE_URL_ENCRYPTION_KEY;
const CUSTOM_DOMAIN = process.env.CUSTOM_DOMAIN;

if (DEV_MODE == "true"){
  DB_HOST = process.env.DB_HOST_TEST;
  DB_USER = process.env.DB_USER_TEST;
  DB_PASS = process.env.DB_PASS_TEST;
  DB_NAME = process.env.DB_NAME_TEST;
  DB_PORT = process.env.DB_PORT_TEST;
  PORT = Number(process.env.PORT_TEST);
}
else if (DEV_MODE == "false"){
  DB_HOST = process.env.DB_HOST_PROD;
  DB_USER = process.env.DB_USER_PROD;
  DB_PASS = process.env.DB_PASS_PROD;
  DB_NAME = process.env.DB_NAME_PROD;
  DB_PORT = process.env.DB_PORT_PROD;
  PORT = Number(process.env.PORT_PROD);
}
else {
  console.log("Something Wrong With .env File")
}


// ███████╗██╗░░██╗██████╗░██████╗░███████╗░██████╗░██████╗
// ██╔════╝╚██╗██╔╝██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝
// █████╗░░░╚███╔╝░██████╔╝██████╔╝█████╗░░╚█████╗░╚█████╗░
// ██╔══╝░░░██╔██╗░██╔═══╝░██╔══██╗██╔══╝░░░╚═══██╗░╚═══██╗
// ███████╗██╔╝╚██╗██║░░░░░██║░░██║███████╗██████╔╝██████╔╝
// ╚══════╝╚═╝░░╚═╝╚═╝░░░░░╚═╝░░╚═╝╚══════╝╚═════╝░╚═════╝░
const app = express();

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(bodyParser.json());



// ██████╗░░█████╗░████████╗░█████╗░██████╗░░█████╗░░██████╗███████╗  ██████╗░░█████╗░░█████╗░██╗░░░░░
// ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝  ██╔══██╗██╔══██╗██╔══██╗██║░░░░░
// ██║░░██║███████║░░░██║░░░███████║██████╦╝███████║╚█████╗░█████╗░░  ██████╔╝██║░░██║██║░░██║██║░░░░░
// ██║░░██║██╔══██║░░░██║░░░██╔══██║██╔══██╗██╔══██║░╚═══██╗██╔══╝░░  ██╔═══╝░██║░░██║██║░░██║██║░░░░░
// ██████╔╝██║░░██║░░░██║░░░██║░░██║██████╦╝██║░░██║██████╔╝███████╗  ██║░░░░░╚█████╔╝╚█████╔╝███████╗
// ╚═════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚═════╝░╚═╝░░╚═╝╚═════╝░╚══════╝  ╚═╝░░░░░░╚════╝░░╚════╝░╚══════╝

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASS,
  port: DB_PORT,
});


// ░█████╗░██╗░░░░░░█████╗░██╗░░░██╗██████╗░███████╗██╗░░░░░░█████╗░██████╗░███████╗
// ██╔══██╗██║░░░░░██╔══██╗██║░░░██║██╔══██╗██╔════╝██║░░░░░██╔══██╗██╔══██╗██╔════╝
// ██║░░╚═╝██║░░░░░██║░░██║██║░░░██║██║░░██║█████╗░░██║░░░░░███████║██████╔╝█████╗░░
// ██║░░██╗██║░░░░░██║░░██║██║░░░██║██║░░██║██╔══╝░░██║░░░░░██╔══██║██╔══██╗██╔══╝░░
// ╚█████╔╝███████╗╚█████╔╝╚██████╔╝██████╔╝██║░░░░░███████╗██║░░██║██║░░██║███████╗
// ░╚════╝░╚══════╝░╚════╝░░╚═════╝░╚═════╝░╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚══════╝



// Creating Transaction For Cloudflare Workers
app.post("/api/create/transaction", (req, res) => {
  const { authorization } = req.headers;
  if (authorization === "YOUR-AUTH-TOKEN-FOR-API"){
    const data = req.body;
    createTransactionCloudflare(data,pool,res);
  }
  else {
    res.status(401).send('Unauthorized');
  }
});

// Retriving User Phone Number For Cloudflare Workers Invoice Password
app.post("/api/get/userphone", (req, res) => {
  const { authorization } = req.headers;
  if (authorization === "YOUR-AUTH-TOKEN-FOR-API"){
    const data = req.body;
    getUserPhoneCloudflare(data.id,pool,res);
  }
  else {
    res.status(401).send('Unauthorized');
  }
});




// ░█████╗░██████╗░███╗░░░███╗██╗███╗░░██╗
// ██╔══██╗██╔══██╗████╗░████║██║████╗░██║
// ███████║██║░░██║██╔████╔██║██║██╔██╗██║
// ██╔══██║██║░░██║██║╚██╔╝██║██║██║╚████║
// ██║░░██║██████╔╝██║░╚═╝░██║██║██║░╚███║
// ╚═╝░░╚═╝╚═════╝░╚═╝░░░░░╚═╝╚═╝╚═╝░░╚══╝

// API FOR CHECKING USER EXISTENCE IN DATABASE
app.post("/api/admin/check/userstatus",authMiddlewareAdmin, (req, res) => {
  checkUserExistence(req.body.email, pool, res);
});

// █░█ █▀ █▀▀ █▀█   █ █▄░█ █▀▀ █▀█
// █▄█ ▄█ ██▄ █▀▄   █ █░▀█ █▀░ █▄█
// POST request For Reading User Data
app.post("/api/admin/get/userdata",authMiddlewareAdmin, (req, res) => {
  getUserData(req.body.email, pool, res);
});



// █░█ █▀ █▀▀ █▀█   █▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █ █▀█ █▄░█
// █▄█ ▄█ ██▄ █▀▄   █▄▄ █▀▄ ██▄ █▀█ ░█░ █ █▄█ █░▀█
// POST request For Setting Up User Account
app.post("/api/admin/setupuser",authMiddlewareAdmin, (req, res) => {
  const data = req.body;
  if (
    !data.hasOwnProperty("name") &&
    !data.hasOwnProperty("phone") &&
    !data.hasOwnProperty("email")
  ) {
    res.status(200).json({ error: "Body Data Missing Properties" });
  } else {
    setupUser(data, pool, res);
  }
});

// █░█ █▀ █▀▀ █▀█   █░█ █▀█ █▀▄ ▄▀█ ▀█▀ █ █▀█ █▄░█
// █▄█ ▄█ ██▄ █▀▄   █▄█ █▀▀ █▄▀ █▀█ ░█░ █ █▄█ █░▀█
// POST request For Updating User
app.post("/api/admin/updateuser",authMiddlewareAdmin, (req, res) => {
  const data = req.body;
  if (
    !data.hasOwnProperty("name") &&
    !data.hasOwnProperty("phone") &&
    !data.hasOwnProperty("email")
  ) {
    res.status(200).json({ error: "Body Data Missing Properties" });
  } else {
    updateUser(data, pool, res);
  }
});


// █▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █ █▄░█ █▀▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄▄ █▀▄ ██▄ █▀█ ░█░ █ █░▀█ █▄█   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
// Creating Transaction
app.post("/api/admin/create/transaction", authMiddlewareAdmin, (req, res) => {

    if (! req.body.hasOwnProperty("email") && ! req.body.hasOwnProperty("transaction")){
      res.status(401).send('Unauthorized');
    }
    else {
      let data = req.body.transaction;
      // Validation
      if (data.hasOwnProperty("name") &&
          data.hasOwnProperty("phone") &&
          data.hasOwnProperty("email") &&
          data.hasOwnProperty("date") &&
          data.hasOwnProperty("mode") &&
          data.hasOwnProperty("amount"))
          {
            createTransactionAdmin(data,pool,res,INVOICE_URL_ENCRYPTION_KEY,CUSTOM_DOMAIN);
          }
        else {
          res.status(401).send('Unauthorized');
        }
    }
});



// █░█ █▀ █▀▀ █▀█   █▀▄ ▄▀█ ▀█▀ ▄▀█   █░█ █▀ █ █▄░█ █▀▀   █▀█ █░█ █▀█ █▄░█ █▀▀
// █▄█ ▄█ ██▄ █▀▄   █▄▀ █▀█ ░█░ █▀█   █▄█ ▄█ █ █░▀█ █▄█   █▀▀ █▀█ █▄█ █░▀█ ██▄
// Reading User Using Phone
app.post("/api/admin/searchuser", authMiddlewareAdmin, (req, res) => {
  if (! req.body.hasOwnProperty("email") && ! req.body.hasOwnProperty("user")){
    res.status(401).send('Unauthorized');
  }
  else {
    let data = req.body.user;
    // Payload Validation
    if (data.hasOwnProperty("phone")) {
        getUserDataUsingPhoneAdmin(data.phone,pool,res);
      }
    else {
        res.status(401).send('Unauthorized');
      }
    }
});


// █▀█ █▀▀ ▄▀█ █▀▄ █ █▄░█ █▀▀   █▀ █▀█ █▀▀ █▀▀ █ █▀▀ █ █▀▀   █░█ █▀ █▀▀ █▀█   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▀▄ ██▄ █▀█ █▄▀ █ █░▀█ █▄█   ▄█ █▀▀ ██▄ █▄▄ █ █▀░ █ █▄▄   █▄█ ▄█ ██▄ █▀▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
// Reading User Transaction Using Email
app.post("/api/admin/searchtransaction", authMiddlewareAdmin, (req, res) => {
  if (! req.body.hasOwnProperty("email") && ! req.body.hasOwnProperty("user")){
    res.status(401).send('Unauthorized');
  }
  else {
    let data = req.body.user;
    // Payload Validation
    if (data.hasOwnProperty("email")) {
        getUserTransactionsUsingEmailAdmin(data.email,pool,res);
      }
    else {
        res.status(401).send('Unauthorized');
      }
    }
});


// █░█ █▀█ █▀▄ ▄▀█ ▀█▀ █▀▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄█ █▀▀ █▄▀ █▀█ ░█░ ██▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
// Updating User Transaction Using ID
app.post("/api/admin/updatetransaction", authMiddlewareAdmin, (req, res) => {
  if (! req.body.hasOwnProperty("email") && ! req.body.hasOwnProperty("transaction")){
    res.status(401).send('Unauthorized');
  }
  else {
    let data = req.body.transaction;
    // Payload Validation
    if (data.hasOwnProperty("name") && data.hasOwnProperty("email") && data.hasOwnProperty("phone") && data.hasOwnProperty("id") && data.hasOwnProperty("date") && data.hasOwnProperty("mode") && data.hasOwnProperty("amount")) {
        updateUserTransactionsUsingID(data, pool, res, CUSTOM_DOMAIN, INVOICE_URL_ENCRYPTION_KEY);
      }
    else {
        res.status(401).send('Unauthorized');
      }
    }
});


// █▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
// Delete User Transaction Using ID
app.post("/api/admin/deletetransaction", authMiddlewareAdmin, (req, res) => {
  if (! req.body.hasOwnProperty("email") && ! req.body.hasOwnProperty("transaction")){
    res.status(401).send('Unauthorized');
  }
  else {
    let data = req.body.transaction;
    // Payload Validation
    if (data.hasOwnProperty("id")) {
        deleteUserTransactionsUsingID(data.id,pool,res);
      }
    else {
        res.status(401).send('Unauthorized');
      }
    }
});

// █▀█ █▀▀ ▄▀█ █▀▄ █ █▄░█ █▀▀   ▄▀█ █░░ █░░   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▀▄ ██▄ █▀█ █▄▀ █ █░▀█ █▄█   █▀█ █▄▄ █▄▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█
// Reading All Transaction of All Users
app.post("/api/admin/transactions", authMiddlewareAdmin, (req, res) => {
    getAllTransactionsAdmin(pool,res);
});


// ▄▀█ █░░ █░░   █░█ █▀ █▀▀ █▀█ █▀   █▀▄ ▄▀█ ▀█▀ ▄▀█
// █▀█ █▄▄ █▄▄   █▄█ ▄█ ██▄ █▀▄ ▄█   █▄▀ █▀█ ░█░ █▀█
// Reading All Users Data
app.post("/api/admin/users", authMiddlewareAdmin, (req, res) => {
  if (! req.body.hasOwnProperty("email")){
    res.status(401).send('Unauthorized');
  }
  else {
        getAllUserDataAdmin(pool,res);
  }
});



// █▀█ █▀▀ ▄▀█ █▀▄ █ █▄░█ █▀▀   █▀ ▀█▀ ▄▀█ ▀█▀ █▀
// █▀▄ ██▄ █▀█ █▄▀ █ █░▀█ █▄█   ▄█ ░█░ █▀█ ░█░ ▄█
// Reading Stats
app.post("/api/admin/stats", authMiddlewareAdmin, (req, res) => {
  if (! req.body.hasOwnProperty("email")){
    res.status(401).send('Unauthorized');
  }
  else {
        getStatsAdmin(pool,res);
  }
});


// ░█████╗░██╗░░░██╗░██████╗████████╗░█████╗░███╗░░░███╗███████╗██████╗░  ██████╗░░█████╗░██╗░░░██╗████████╗███████╗
// ██╔══██╗██║░░░██║██╔════╝╚══██╔══╝██╔══██╗████╗░████║██╔════╝██╔══██╗  ██╔══██╗██╔══██╗██║░░░██║╚══██╔══╝██╔════╝
// ██║░░╚═╝██║░░░██║╚█████╗░░░░██║░░░██║░░██║██╔████╔██║█████╗░░██████╔╝  ██████╔╝██║░░██║██║░░░██║░░░██║░░░█████╗░░
// ██║░░██╗██║░░░██║░╚═══██╗░░░██║░░░██║░░██║██║╚██╔╝██║██╔══╝░░██╔══██╗  ██╔══██╗██║░░██║██║░░░██║░░░██║░░░██╔══╝░░
// ╚█████╔╝╚██████╔╝██████╔╝░░░██║░░░╚█████╔╝██║░╚═╝░██║███████╗██║░░██║  ██║░░██║╚█████╔╝╚██████╔╝░░░██║░░░███████╗
// ░╚════╝░░╚═════╝░╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░░░░╚═╝╚══════╝╚═╝░░╚═╝  ╚═╝░░╚═╝░╚════╝░░╚═════╝░░░░╚═╝░░░╚══════╝



// █░█ █▀ █▀▀ █▀█   █▀ ▀█▀ ▄▀█ ▀█▀ █░█ █▀
// █▄█ ▄█ ██▄ █▀▄   ▄█ ░█░ █▀█ ░█░ █▄█ ▄█
// POST request For Checking User Exists
app.post("/api/check/userstatus",authMiddleware, (req, res) => {
  checkUserExistence(req.body.email, pool, res);
});



// █░█ █▀ █▀▀ █▀█   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▄█ ▄█ ██▄ █▀▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█
// POST request For Reading User Transactions
app.post("/api/get/transactions",authMiddleware, (req, res) => {
  getAllTransactionsOfSpecificUser(req.body.email, pool, res);
});



// █░░ ▄▀█ █▀ ▀█▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄▄ █▀█ ▄█ ░█░   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
// POST request For Reading Last Transactions
app.post("/api/get/last/transaction",authMiddleware, (req, res) => {
  getLastTransaction(req.body.email, pool, res);
});



// █░█ █▀ █▀▀ █▀█   █ █▄░█ █▀▀ █▀█
// █▄█ ▄█ ██▄ █▀▄   █ █░▀█ █▀░ █▄█
// POST request For Reading User Data
app.post("/api/get/userdata",authMiddleware, (req, res) => {
  getUserData(req.body.email, pool, res);
});



// █░█ █▀ █▀▀ █▀█   █▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █ █▀█ █▄░█
// █▄█ ▄█ ██▄ █▀▄   █▄▄ █▀▄ ██▄ █▀█ ░█░ █ █▄█ █░▀█
// POST request For Creating User
app.post("/api/setupuser",authMiddleware, (req, res) => {
  const data = req.body;
  if (
    !data.hasOwnProperty("name") &&
    !data.hasOwnProperty("phone") &&
    !data.hasOwnProperty("email")
  ) {
    res.status(200).json({ error: "Body Data Missing Properties" });
  } else {
    setupUser(data, pool, res);
  }
});



// █░█ █▀ █▀▀ █▀█   █░█ █▀█ █▀▄ ▄▀█ ▀█▀ █ █▀█ █▄░█
// █▄█ ▄█ ██▄ █▀▄   █▄█ █▀▀ █▄▀ █▀█ ░█░ █ █▄█ █░▀█
// POST request For Updating User
app.post("/api/updateuser",authMiddleware, (req, res) => {
  const data = req.body;
  if (
    !data.hasOwnProperty("name") &&
    !data.hasOwnProperty("phone") &&
    !data.hasOwnProperty("email")
  ) {
    res.status(200).json({ error: "Body Data Missing Properties" });
  } else {
    updateUser(data, pool, res);
  }
});



// ░██████╗████████╗░█████╗░██████╗░████████╗██╗███╗░░██╗░██████╗░  ░██████╗███████╗██████╗░██╗░░░██╗███████╗██████╗░
// ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗╚══██╔══╝██║████╗░██║██╔════╝░  ██╔════╝██╔════╝██╔══██╗██║░░░██║██╔════╝██╔══██╗
// ╚█████╗░░░░██║░░░███████║██████╔╝░░░██║░░░██║██╔██╗██║██║░░██╗░  ╚█████╗░█████╗░░██████╔╝╚██╗░██╔╝█████╗░░██████╔╝
// ░╚═══██╗░░░██║░░░██╔══██║██╔══██╗░░░██║░░░██║██║╚████║██║░░╚██╗  ░╚═══██╗██╔══╝░░██╔══██╗░╚████╔╝░██╔══╝░░██╔══██╗
// ██████╔╝░░░██║░░░██║░░██║██║░░██║░░░██║░░░██║██║░╚███║╚██████╔╝  ██████╔╝███████╗██║░░██║░░╚██╔╝░░███████╗██║░░██║
// ╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝╚═╝░░╚══╝░╚═════╝░  ╚═════╝░╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚══════╝╚═╝░░╚═╝



// Start the server
if (DEV_MODE == "false"){
  // Creating SSL Certificate
  const { exec } = require('child_process');
  const HOSTED_DOMAIN = 'YOUR-DOMAIN-WHICH-POINTING-TO-THIS-SERVER-IP';
  const certFilePath = `/etc/letsencrypt/live/${HOSTED_DOMAIN}/cert.pem`;

  // Checking if the file exists

  exec(`/usr/bin/certbot certonly --standalone --preferred-challenges http --agree-tos --no-eff-email --email "admin_email@example.com" -d "${HOSTED_DOMAIN}" --rsa-key-size 2048 --non-interactive --keep-until-expiring`, (error, stdout, stderr) => {
    console.log(stdout);
    const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${HOSTED_DOMAIN}/privkey.pem`, 'utf8');
    const certificate = fs.readFileSync(`/etc/letsencrypt/live/${HOSTED_DOMAIN}/cert.pem`, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const httpsServer = https.createServer(credentials,app);
    httpsServer.listen(PORT,()=>{
      console.log(`HTTPS Server Started on PORT ${PORT}`);
    });
  });
}

else if (DEV_MODE == "true"){
  app.listen(PORT,()=>{
    console.log(`HTTP Started on PORT ${PORT}`);
  });
}
