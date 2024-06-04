const CryptoJS = require("crypto-js");

// ░█████╗░██╗░░░░░░█████╗░██╗░░░██╗██████╗░███████╗██╗░░░░░░█████╗░██████╗░███████╗
// ██╔══██╗██║░░░░░██╔══██╗██║░░░██║██╔══██╗██╔════╝██║░░░░░██╔══██╗██╔══██╗██╔════╝
// ██║░░╚═╝██║░░░░░██║░░██║██║░░░██║██║░░██║█████╗░░██║░░░░░███████║██████╔╝█████╗░░
// ██║░░██╗██║░░░░░██║░░██║██║░░░██║██║░░██║██╔══╝░░██║░░░░░██╔══██║██╔══██╗██╔══╝░░
// ╚█████╔╝███████╗╚█████╔╝╚██████╔╝██████╔╝██║░░░░░███████╗██║░░██║██║░░██║███████╗
// ░╚════╝░╚══════╝░╚════╝░░╚═════╝░╚═════╝░╚═╝░░░░░╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝╚══════╝

async function createTransactionCloudflare(data,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO transactions(id,date,email,mode,amount,url) VALUES ('${data.id}','${data.date}','${data.email}','${data.mode}',${data.amount},'${data.url}');`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==0){
          res.status(200).json({ success: true });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

async function getUserPhoneCloudflare(id,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT users.phone FROM transactions JOIN users ON transactions.email = users.email WHERE transactions.id = '${id}';`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length>0){
          res.status(200).json({ phone: result.rows[0].phone });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

// ░█████╗░██████╗░███╗░░░███╗██╗███╗░░██╗
// ██╔══██╗██╔══██╗████╗░████║██║████╗░██║
// ███████║██║░░██║██╔████╔██║██║██╔██╗██║
// ██╔══██║██║░░██║██║╚██╔╝██║██║██║╚████║
// ██║░░██║██████╔╝██║░╚═╝░██║██║██║░╚███║
// ╚═╝░░╚═╝╚═════╝░╚═╝░░░░░╚═╝╚═╝╚═╝░░╚══╝


// █▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █ █▄░█ █▀▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄▄ █▀▄ ██▄ █▀█ ░█░ █ █░▀█ █▄█   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
async function createTransactionAdmin(data,pool,res,INVOICE_URL_ENCRYPTION_KEY,CUSTOM_DOMAIN){
  const transaction_id = ((String(crypto.randomUUID()).replaceAll('-','')).substring(0, 27)).toUpperCase();

  const billData = {
    status: "paid",
    invoice_no: `IN-${String(Math.floor(Math.random()*1000))}`,
    date: String(data.date),
    id: transaction_id,
    name: String(data.name),
    phone: String(data.phone),
    mode: String(data.mode),
    amount: Number(data.amount)
  };

  const invoiceDomain = `${CUSTOM_DOMAIN}/api/invoice`;
  let jsonBillString = JSON.stringify(billData);
  let encodedJsonBillString = CryptoJS.AES.encrypt(jsonBillString, INVOICE_URL_ENCRYPTION_KEY);
  let encoded_bill_data = encodeURIComponent(encodedJsonBillString);
  const invoiceUrl = `${invoiceDomain}/?data=${encoded_bill_data}`;

  try {
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO transactions(id,date,email,mode,amount,url) VALUES ('${transaction_id}','${data.date}','${data.email}','${data.mode}',${data.amount},'${invoiceUrl}');`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==0){
          res.status(200).json({ success: true });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// █░█ █▀█ █▀▄ ▄▀█ ▀█▀ █▀▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄█ █▀▀ █▄▀ █▀█ ░█░ ██▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
// Update Transaction Using Transaction ID For Admin
async function updateUserTransactionsUsingID(data,pool,res,CUSTOM_DOMAIN,INVOICE_URL_ENCRYPTION_KEY){
  const billData = {
    status: "paid",
    invoice_no: `IN-${String(Math.floor(Math.random()*1000))}`,
    date: String(data.date),
    id: String(data.id),
    name: String(data.name),
    phone: String(data.phone),
    mode: String(data.mode),
    amount: Number(data.amount)
  };

  const invoiceDomain = `${CUSTOM_DOMAIN}/api/invoice`;
  let jsonBillString = JSON.stringify(billData);
  let encodedJsonBillString = CryptoJS.AES.encrypt(jsonBillString, INVOICE_URL_ENCRYPTION_KEY);
  let encoded_bill_data = encodeURIComponent(encodedJsonBillString);
  const invoiceUrl = `${invoiceDomain}/?data=${encoded_bill_data}`;

  try {
      const client = await pool.connect();
      const result = await client.query(`UPDATE transactions SET date='${data.date}', mode='${data.mode}', amount='${data.amount}', url='${invoiceUrl}' WHERE transactions.id='${data.id}';`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==0){
          res.status(200).json({ success: true });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }

    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// █▀█ █▀▀ ▄▀█ █▀▄   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▀▄ ██▄ █▀█ █▄▀   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
async function getUserTransactionsUsingEmailAdmin(email,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT * FROM transactions WHERE email = '${email}' ORDER BY transactions.invoice DESC;`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length>0){
          res.status(200).json({ data: result.rows });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }

    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// █▀▄ █▀▀ █░░ █▀▀ ▀█▀ █▀▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄▀ ██▄ █▄▄ ██▄ ░█░ ██▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█

async function deleteUserTransactionsUsingID(id,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`DELETE FROM transactions WHERE transactions.id='${id}';`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==0){
          res.status(200).json({ success: true });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }

    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

// █░█ █▀ █▀▀ █▀█   █▀▄ ▄▀█ ▀█▀ ▄▀█   █░█ █▀ █ █▄░█ █▀▀   █▀█ █░█ █▀█ █▄░█ █▀▀
// █▄█ ▄█ ██▄ █▀▄   █▄▀ █▀█ ░█░ █▀█   █▄█ ▄█ █ █░▀█ █▄█   █▀▀ █▀█ █▄█ █░▀█ ██▄
async function getUserDataUsingPhoneAdmin(phone,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT * FROM users WHERE users.phone = '${phone}';`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length>0){
          res.status(200).json({ data: result.rows });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }

    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

// ▄▀█ █░░ █░░   █░█ █▀ █▀▀ █▀█ █▀   █▀▄ ▄▀█ ▀█▀ ▄▀█
// █▀█ █▄▄ █▄▄   █▄█ ▄█ ██▄ █▀▄ ▄█   █▄▀ █▀█ ░█░ █▀█
async function getAllUserDataAdmin(pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT * FROM users ORDER BY name;`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length>0){
          res.status(200).json({ data: result.rows });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }

    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// ▄▀█ █░░ █░░   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▀█ █▄▄ █▄▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█
async function getAllTransactionsAdmin(pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT transactions.invoice, transactions.id, transactions.date, transactions.email, transactions.mode, transactions.amount, transactions.url, users.phone, users.name
      FROM transactions
      JOIN users ON transactions.email = users.email
      ORDER BY transactions.invoice DESC
      LIMIT 1000;`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if (result.rows.length>0){
          res.status(200).json({ data: result.rows });
        }
        else if (result.rows.length==0){
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// █▀█ █▀▀ ▄▀█ █▀▄ █ █▄░█ █▀▀   █▀ ▀█▀ ▄▀█ ▀█▀ █▀
// █▀▄ ██▄ █▀█ █▄▀ █ █░▀█ █▄█   ▄█ ░█░ █▀█ ░█░ ▄█
async function getStatsAdmin(pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT (SELECT COUNT(*) FROM users) AS count_user, (SELECT COUNT(*) FROM transactions) AS count_transaction,(SELECT SUM(amount) FROM transactions) AS total_received;`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if (result.rows.length>0){
          res.status(200).json({ data: result.rows });
        }
        else if (result.rows.length==0){
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// ░█████╗░██╗░░░██╗░██████╗████████╗░█████╗░███╗░░░███╗███████╗██████╗░  ██████╗░░█████╗░██╗░░░██╗████████╗███████╗
// ██╔══██╗██║░░░██║██╔════╝╚══██╔══╝██╔══██╗████╗░████║██╔════╝██╔══██╗  ██╔══██╗██╔══██╗██║░░░██║╚══██╔══╝██╔════╝
// ██║░░╚═╝██║░░░██║╚█████╗░░░░██║░░░██║░░██║██╔████╔██║█████╗░░██████╔╝  ██████╔╝██║░░██║██║░░░██║░░░██║░░░█████╗░░
// ██║░░██╗██║░░░██║░╚═══██╗░░░██║░░░██║░░██║██║╚██╔╝██║██╔══╝░░██╔══██╗  ██╔══██╗██║░░██║██║░░░██║░░░██║░░░██╔══╝░░
// ╚█████╔╝╚██████╔╝██████╔╝░░░██║░░░╚█████╔╝██║░╚═╝░██║███████╗██║░░██║  ██║░░██║╚█████╔╝╚██████╔╝░░░██║░░░███████╗
// ░╚════╝░░╚═════╝░╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░░░░╚═╝╚══════╝╚═╝░░╚═╝  ╚═╝░░╚═╝░╚════╝░░╚═════╝░░░░╚═╝░░░╚══════╝


// █░█ █▀ █▀▀ █▀█   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█ █▀
// █▄█ ▄█ ██▄ █▀▄   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█ ▄█
async function getAllTransactionsOfSpecificUser(email,pool,res){
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT * FROM transactions WHERE transactions.email = '${email}' ORDER BY transactions.invoice DESC;`);
        client.release();
        if (result.hasOwnProperty("rows")){
          if (result.rows.length>0){
            res.status(200).json({ data: result.rows });
          }
          else if (result.rows.length==0){
            res.status(401).send('Unauthorized');
          }
        }
        else {
          res.status(401).send('Unauthorized');
        }
      } catch (err) {
        res.status(401).send('Unauthorized');
      }
}


// █░░ ▄▀█ █▀ ▀█▀   ▀█▀ █▀█ ▄▀█ █▄░█ █▀ ▄▀█ █▀▀ ▀█▀ █ █▀█ █▄░█
// █▄▄ █▀█ ▄█ ░█░   ░█░ █▀▄ █▀█ █░▀█ ▄█ █▀█ █▄▄ ░█░ █ █▄█ █░▀█
async function getLastTransaction(email,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT * FROM transactions WHERE transactions.email = '${email}' ORDER BY transactions.invoice DESC LIMIT 1;`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==1) {
          res.status(200).json({ data: result.rows });
        }
        if(result.rows.length==0) {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

// █░█ █▀ █▀▀ █▀█   █ █▄░█ █▀▀ █▀█
// █▄█ ▄█ ██▄ █▀▄   █ █░▀█ █▀░ █▄█
async function getUserData(email,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT * FROM users WHERE users.email = '${email}';`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length>0){
          res.status(200).json({ data: result.rows });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }

    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}


// █░█ █▀ █▀▀ █▀█   █▀ ▀█▀ ▄▀█ ▀█▀ █░█ █▀
// █▄█ ▄█ ██▄ █▀▄   ▄█ ░█░ █▀█ ░█░ █▄█ ▄█
async function checkUserExistence(email,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`SELECT * FROM users WHERE users.email = '${email}';`);
      client.release();

      if (result.hasOwnProperty("rows")){
        if(result.rows.length>0){
          res.status(200).json({ data: true });
        }
        else {
          res.status(200).json({ data: false });
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

// █░█ █▀ █▀▀ █▀█   █▀▀ █▀█ █▀▀ ▄▀█ ▀█▀ █ █▀█ █▄░█
// █▄█ ▄█ ██▄ █▀▄   █▄▄ █▀▄ ██▄ █▀█ ░█░ █ █▄█ █░▀█
async function setupUser(data,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`INSERT INTO users(email,name,phone) VALUES('${data.email}','${data.name}','${data.phone}');`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==0){
          res.status(200).json({ success: true });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

// █░█ █▀ █▀▀ █▀█   █░█ █▀█ █▀▄ ▄▀█ ▀█▀ █ █▀█ █▄░█
// █▄█ ▄█ ██▄ █▀▄   █▄█ █▀▀ █▄▀ █▀█ ░█░ █ █▄█ █░▀█
async function updateUser(data,pool,res){
  try {
      const client = await pool.connect();
      const result = await client.query(`UPDATE users SET name='${data.name}', phone='${data.phone}' WHERE users.email='${data.email}';`);
      client.release();
      if (result.hasOwnProperty("rows")){
        if(result.rows.length==0){
          res.status(200).json({ success: true });
        }
        else {
          res.status(401).send('Unauthorized');
        }
      }
      else {
        res.status(401).send('Unauthorized');
      }
    } catch (err) {
      res.status(401).send('Unauthorized');
    }
}

exports.getAllTransactionsOfSpecificUser = getAllTransactionsOfSpecificUser;
exports.getUserData = getUserData;
exports.checkUserExistence = checkUserExistence;
exports.setupUser = setupUser;
exports.updateUser = updateUser;
exports.getLastTransaction = getLastTransaction;

exports.createTransactionCloudflare = createTransactionCloudflare;
exports.getUserPhoneCloudflare = getUserPhoneCloudflare;

exports.createTransactionAdmin = createTransactionAdmin;
exports.getUserDataUsingPhoneAdmin = getUserDataUsingPhoneAdmin;
exports.getAllUserDataAdmin = getAllUserDataAdmin;
exports.getAllTransactionsAdmin = getAllTransactionsAdmin;
exports.getStatsAdmin = getStatsAdmin;
exports.getUserTransactionsUsingEmailAdmin = getUserTransactionsUsingEmailAdmin;
exports.updateUserTransactionsUsingID = updateUserTransactionsUsingID;
exports.deleteUserTransactionsUsingID = deleteUserTransactionsUsingID;