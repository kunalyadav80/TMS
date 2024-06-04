import template from './template';
import * as CryptoJS from 'crypto-js';

export default {
	async fetch(env, corsHeaders, url_data, invoiceDomain) {
		// Decoding Data
		let data;
		try {
			const cyphertext = decodeURIComponent(url_data);
			const bytes = CryptoJS.AES.decrypt(cyphertext.toString(), env.URLEncryptionKey);
			const stringJson = bytes.toString(CryptoJS.enc.Utf8);
			data = JSON.parse(stringJson);
		} catch(error){
			return new Response("Data Integrity Check Failed :-(");
		}

		// Success Validation
		if (data.status != "paid"){
			const fail_data = {invoiceUrl: env.BillingURL};
			const HTML_TEMPLATE = await template.fetchTemplate("failed",fail_data);
			return new Response(HTML_TEMPLATE, {
				headers: {
				  'content-type': 'text/html;charset=UTF-8'
				}
			  });
		}

		if (data.status === "paid"){
			// Encoding billData So It Can Be Passed Via URL
			const billData = {
				invoice_no: String(data.invoice_no),
				date: String(data.date),
				id: String(data.id),
				name: String(data.name),
				phone: String(data.phone),
				mode: String(data.mode),
				amount: Number(data.amount)
			};

			const jsonBillString = JSON.stringify(billData);
			const encodedJsonBillString = CryptoJS.AES.encrypt(jsonBillString, env.URLEncryptionKey);
			const encoded_bill_data = encodeURIComponent(encodedJsonBillString);
			const invoiceLink = `${invoiceDomain}?data=${encoded_bill_data}`;

			const success_data = {
				...billData,
				invoiceUrl:invoiceLink
			};

			const HTML_TEMPLATE = await template.fetchTemplate("success",success_data);
			return new Response(HTML_TEMPLATE, {
				headers: {
				  'content-type': 'text/html;charset=UTF-8'
				}
			  });
		}

		else {
			return new Response("URL is Incorrect :-(");
		}
	},
};
