export default {
	async fetch(redirectUrl) {
		// The Response class has static methods to create common Response objects as a convenience
		// Redirecting To Payment Page
		const header = new Headers({
		'Location': redirectUrl,
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
