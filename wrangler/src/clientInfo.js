export default {
	async fetch(request,corsHeaders) {
		const ip = request.headers.get('cf-connecting-ip');
    const data = await fetch(`http://ip-api.com/json/${ip}`).then(res=>res.json())
    const isp = data.isp;
    const city = data.city;

        const result = {
            ip,
            isp,
            city
          }
        
        return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders })
	},
};
