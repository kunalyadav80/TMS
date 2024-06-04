/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import { Buffer } from 'node:buffer';
import initializePayment from './initializePayment';
import redirect from './redirect';
import checkRoute from './checkRoute';
import statusRoute from './statusRoute';
import invoiceRoute from './invoiceRoute';
import clientInfo from './clientInfo';
import invoicePasswordPage from './invoicePasswordPage';
import * as CryptoJS from 'crypto-js';

// Export a default object containing event handlers
export default {
	// The fetch handler is invoked when this worker receives a HTTP(S) request
	// and should return a Response (optionally wrapped in a Promise)
	async fetch(request, env, ctx) {

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,POST',
			'Access-Control-Allow-Headers': 'Content-Type,Authorization'
		};

		// Setting Development Mode
		// For Production Has To Be false
		const DEVELOPMENT_MODE = false;

		// Declaring API Variables
		const razorPaymentEndpoint = 'https://api.razorpay.com/v1/orders'; // Don't Include / at the End
		const razorStatusEndpoint = 'https://api.razorpay.com/v1/payments'; // Don't Include / at the End
		let razorAuthHeader;
		let redirect_url;
		let invoiceDomain;
		let statusUrl; // For Redirecting User To Respective Transaction Page (Success or Failure)
		let razorKey;
		let razorSecret;

		// Testing Environment API KEYS
		if (DEVELOPMENT_MODE===true){
			redirect_url = `${env.LocalDevelopmentURL}/api/check`; // Don't Include / at the End
			invoiceDomain = `${env.LocalDevelopmentURL}/api/invoice`; // Don't Include / at the End
			razorAuthHeader = `Basic ${Buffer.from(String(env.RazorAPI_Test)+":"+String(env.RazorSecret_Test)).toString('base64')}`
			statusUrl = `${env.LocalDevelopmentURL}/api/status` // Don't Include / at the End
			razorKey = env.RazorAPI_Test;
			razorSecret = env.RazorSecret_Test;
		}

		// PRODUCTION Environment API KEYS
		else if (DEVELOPMENT_MODE===false){
			redirect_url = `${env.WorkerURL}/api/check`; // Don't Include / at the End
			invoiceDomain = `${env.CustomDomain}/api/invoice`; // Don't Include / at the End
			razorAuthHeader = `Basic ${Buffer.from(String(env.RazorAPI_Prod)+":"+String(env.RazorSecret_Prod)).toString('base64')}`
			statusUrl = `${env.CustomDomain}/api/status` // Don't Include / at the End
			razorKey = env.RazorAPI_Prod;
			razorSecret = env.RazorSecret_Prod;
		}

		// You'll find it helpful to parse the request.url string into a URL object. Learn more at https://developer.mozilla.org/en-US/docs/Web/API/URL
		const url = new URL(request.url);

		// For Handeling CORS
		if (request.method === "OPTIONS") {
			// Handle CORS pre-flight request.
			return new Response(null,{status:204,headers:corsHeaders});
		}

		// For Initializing Payment
		else if (url.pathname === '/api/pay' && request.method === 'POST') {
			// Reading Request Body Data
			const data = await request.json();

			// Reading Request Header
			let headers = {};
			for (let [key, value] of request.headers.entries()) {
				if (key === "authorization"){
				headers = {...headers,[key] : value}
				}
  			}

			// Header Validation
			if (! headers.hasOwnProperty("authorization")){
				return new Response(JSON.stringify({error:"Authorization Token Missing in Request Header."}), {method:204, headers:corsHeaders});
			}
			else if (headers.authorization === env.API_AUTH_TOKEN){
				return initializePayment.fetch(request, env, data, corsHeaders, razorPaymentEndpoint, razorAuthHeader, redirect_url, razorKey);
			}
			else {
				return new Response(JSON.stringify({error:"Authorization Token Missing in Request Header."}), {method:204, headers:corsHeaders});
			}
		}
		// Redirection For Payment Link
		else if (url.pathname.startsWith('/redirect') && request.method === 'GET') {
			const redirectUrl = url.searchParams.get('url');
			if (!redirectUrl) {
				return new Response('Bad request: Missing `redirectUrl` query param', { status: 400 });
			}
			else {
				return redirect.fetch(redirectUrl);
			}
		}

		// Client Will Be Redirect To After Transaction
		else if (url.pathname.startsWith('/api/check') && request.method === 'POST') {
			// Reading Body Response From Razor Pay POST Request
			let res = (await request.text()).split("&").reduce((result, item) => {
				const parts = item.split("=");
				result[parts[0]] = parts[1];
				return result;
			  }, {});

			const razor_response = {
				payment_id: res.razorpay_payment_id,
				razorpay_order_id: res.razorpay_order_id,
				razorpay_signature: res.razorpay_signature,
			}

			// Validating Razor Signature
			if (res.razorpay_signature === CryptoJS.HmacSHA256(res.razorpay_order_id + "|" + res.razorpay_payment_id, razorSecret).toString()){
				// Signature Verification Successful
				const url_data = url.searchParams.get('data');
				return checkRoute.fetch(env, ctx, url_data, razor_response, razorStatusEndpoint, razorAuthHeader, statusUrl, DEVELOPMENT_MODE, invoiceDomain);
			}
			else{
				return new Response("Bad Request",{status:400,headers:corsHeaders})
			}
		}

		// Success or Fail Transaction Status
		else if (url.pathname.startsWith('/api/status') && request.method === 'GET') {
			const url_data = url.searchParams.get('data');
			return statusRoute.fetch(env, corsHeaders, url_data, invoiceDomain);
		}


		// Invoice Password Form Route GET
		else if (url.pathname.startsWith('/api/invoice') && request.method === 'GET') {
			let url_data = String(url.searchParams.get('data'));
			url_data = encodeURIComponent(url_data);
			return invoicePasswordPage.fetch(url_data,invoiceDomain,corsHeaders);
		}

		// Invoice Route POST For HTML Response
		else if (url.pathname.startsWith('/api/invoice') && request.method === 'POST') {
			let url_data = url.searchParams.get('data');
			let user_password;
			let payload;

			try {
				// Reading Request Body Data
				payload = await request.json();
			}
			catch(err){
				return new Response("Wrong Password", {
					status: 200,
					headers: corsHeaders,
					  });
			}


			if (payload.hasOwnProperty('password')){
				user_password = payload.password;
				return invoiceRoute.fetch(env, url_data, String(user_password), corsHeaders);
			}
			else {
				return new Response("Wrong Password", {
					status: 200,
					headers: corsHeaders,
					  });
			}
		}

		// Callback For Development
		else if (url.pathname == '/api/clientinfo' && request.method === 'POST') {
			return clientInfo.fetch(request,corsHeaders);
		}

		else {
			return new Response('Hello World',{status:200,headers:corsHeaders});
		}
	},
};
