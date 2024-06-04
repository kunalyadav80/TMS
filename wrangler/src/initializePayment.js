import * as CryptoJS from 'crypto-js';

export default {
	async fetch(request, env, data, corsHeaders, razorPaymentEndpoint, razorAuthHeader, redirect_url, razorKey) {
		const url = new URL(request.url);

	    // Function For Getting Current Date
		function getDate(){
			// Getting Date
			let today = new Date();
			let yyyy = today.getFullYear();
			let mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero indexed, so +1 is necessary
			let dd = String(today.getDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		}
			
		// Generating Random TransactionID and MUID
		const transaction_id = ((String(crypto.randomUUID()).replaceAll('-','')).substring(0, 27)).toUpperCase();
		
		const amount_in_paise = Number(data.amount*100)

		const date = getDate()
		
		// Transaction Data For Database
		const TransactionalData = JSON.stringify({
			date:date,
			id:transaction_id,
			name:data.name,
			phone:data.phone,
			email:data.email,
			amount:data.amount
		});

		// Encoding TransactionData In B64 So It Can Be Passed As URL Parameter For Checking Route.
		const ciphertext = CryptoJS.AES.encrypt(TransactionalData, env.URLEncryptionKey);
		const encoded_transaction_data = encodeURIComponent(ciphertext);

		// Headers For API Request
		const myHeaders = new Headers();
		myHeaders.append("Authorization", razorAuthHeader);
		myHeaders.append("Content-Type", "application/json");

		// Body For API Request
		const RazorApiPayload = JSON.stringify({
			"amount": amount_in_paise,
			"currency": "INR",
			"receipt": String(transaction_id),
			"notes":{
				callback_url: `${redirect_url}/?data=${encoded_transaction_data}`,
				key: razorKey
			}});

		
	    // Calling RazorPay API
		const response = await fetch(razorPaymentEndpoint, {
    	    method: 'POST',
    	    headers: myHeaders,
    	    body: RazorApiPayload
    	  });
		  
		// Reading API Response 
		const res_data = await response.json();

		return new Response(JSON.stringify(res_data), {
			status: 200,
			headers: corsHeaders
		  });
	},
};
