import template from './template';
import telegram from './telegram';
import sendMail from './sendMail';
import * as CryptoJS from 'crypto-js';
import sendDatabase from './sendDatabase';

export default {
	async fetch(env, ctx, url_data, razor_response, razorStatusEndpoint, razorAuthHeader, statusUrl, DEVELOPMENT_MODE, invoiceDomain) {

		let data;
		try {
			const cyphertext = decodeURIComponent(url_data);
			const bytes = CryptoJS.AES.decrypt(cyphertext.toString(), env.URLEncryptionKey);
			const stringJson = bytes.toString(CryptoJS.enc.Utf8);
			data = JSON.parse(stringJson);
		} catch(error){
			return new Response("Data Integrity Check Failed :-(");
		}

		// Data Validation For Missing Keys
		if (! data.hasOwnProperty("date") && ! data.hasOwnProperty("id") && ! data.hasOwnProperty("name") && ! data.hasOwnProperty("phone") && ! data.hasOwnProperty("email") && ! data.hasOwnProperty("amount")){
			const fail_data = {invoiceUrl: env.BillingURL};
			const HTML_TEMPLATE = await template.fetchTemplate("failed",fail_data);
			return new Response(HTML_TEMPLATE, {
				headers: {
				  'content-type': 'text/html;charset=UTF-8'
				}
			  });
		}

		// Transaction ID From Encrypted URL Data
		const transaction_id = data.id;

		let payment_mode;
		let billData;

		// Calling RazorPay Check API
		const response = await fetch(`${razorStatusEndpoint}/${razor_response.payment_id}`, {
    	    method: 'GET',
    	    headers: {
    	      'Content-Type': 'application/json',
    	      'Authorization': razorAuthHeader
    	    }
    	  });
		
		// Reading API Response 
		const res_data = await response.json();

		// Response Data Validation Check
		if (res_data.hasOwnProperty("error")){
			const fail_data = {invoiceUrl: env.BillingURL};
			const HTML_TEMPLATE = await template.fetchTemplate("failed",fail_data);
			return new Response(HTML_TEMPLATE, {
				headers: {
				  'content-type': 'text/html;charset=UTF-8'
				}
			  });
		}
		
		// When Payment is Successful
		if (res_data.status === "captured" && res_data.captured === true) {
			// Payment Done Using CARD
			if (res_data.method === "card"){
				if (res_data.card.type === "credit"){
					payment_mode = "CREDIT CARD";
				}
				else {
					payment_mode = "DEBIT CARD";
				}
			}
			else {
				payment_mode=String(res_data.method).toUpperCase();
			}

			// Encoding billData So It Can Be Passed Via URL
			billData = {
				status: "paid",
				invoice_no: String(razor_response.payment_id),
				date: String(data.date),
				id: String(data.id),
				name: String(data.name),
				phone: String(data.phone),
				mode: String(payment_mode),
				amount: Number(data.amount)
			};

			let jsonBillString = JSON.stringify(billData);
			let encodedJsonBillString = CryptoJS.AES.encrypt(jsonBillString, env.URLEncryptionKey);
			let encoded_bill_data = encodeURIComponent(encodedJsonBillString);
			const invoiceUrl = `${invoiceDomain}/?data=${encoded_bill_data}`;

			// Updating Database
			ctx.waitUntil(sendDatabase.fetch(data,payment_mode,invoiceUrl));
			
			// Sending Telegram Message
			const messageBody = `
<b>=====================</b>
<b> Received &#8377;${data.amount}</b>
<b>=====================</b>
<b>Date:</b> ${data.date}
<b>Payment ID:</b> ${razor_response.payment_id}
<b>Trxn ID:</b> ${data.id}
<b>From:</b> ${data.name}
<b>Phone:</b> ${data.phone}
<b>Email:</b> ${data.email}
<b>Mode:</b> ${payment_mode}
<b>Invoice:</b> <a href='${invoiceUrl}'>Open Invoice</a>`;			
			
			// Sending Telegram And Email in Background
			ctx.waitUntil(telegram.sendMessage(messageBody,DEVELOPMENT_MODE));
			// Send Email Only In Production Mode (In Testing Mode Its Not Possible via MailChannels)
			if (DEVELOPMENT_MODE === false){
				ctx.waitUntil(sendMail.send({...data,payment_mode,invoiceUrl,invoice:razor_response.payment_id}));
			}
			
		}
		else {
			billData = {
				status: "failed"
			}
		}

		const jsonBillString = JSON.stringify(billData);
		const encodedJsonBillString = CryptoJS.AES.encrypt(jsonBillString, env.URLEncryptionKey);
		const encoded_bill_data = encodeURIComponent(encodedJsonBillString);
		const redirectURL = `${statusUrl}?data=${encoded_bill_data}`;

		// Header For Redirection Response
		const header = new Headers({
			'Location': redirectURL,
			'Referrer-Policy': 'no-referrer', // This will remove the referrer information
			'Cache-Control': 'no-cache, no-store, must-revalidate',
			'Pragma': 'no-cache',
			'Expires': '0',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
			'Access-Control-Max-Age': '86400'
			});
		
		// Respond with a 301 status code for a permanent redirect
		return new Response(null, {
			status: 301,
			headers: header
		});
	},
};
