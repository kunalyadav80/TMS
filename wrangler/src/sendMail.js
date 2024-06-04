export default {
	async send(data) {

        const html_template=`
<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 430px; margin: 0 auto; background-color: black;color: white; padding: 30px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
        <h2 style="text-align: center; color: #ffbb38;"><span style="color:white;">YOUR</span> BUSINESS NAME</h2>
		<center><img width="100px" src="https://cdn.jsdelivr.net/gh/kunu121/LogoHosting@main/Tick.png" /></center>
        <h2 style="text-align: center; color: white;">Transaction Successful</h2>
        <p style="color:white; margin-left:30px;">Dear <strong>${data.name.toUpperCase()},</strong></p>
        <p style="color:white; margin-left:30px; max-width:400px">We are writing to confirm that your recent transaction has been successfully processed.</p>
        <center><a style="display: inline-block;padding: 10px 20px;background-color: #ffbb38;color: #000;font-weight: bolder;text-decoration: none;border-radius: 5px;transition: background-color 0.3s ease;" href="${data.invoiceUrl}" target="_blank">Open Invoice</a></center>
        <hr style="border: 1px solid grey; width:80%;"
        <h3 style="margin-top:50px; margin-left:40px; color:white;"><span style="color:white;">Transaction Details:</span></h3>
        <ul style="margin-bottom:50px">
            <li style="color:white"><strong><span style="color:white">Date:</span></strong> ${data.date}</li>
            <li style="color:white"><strong><span style="color:white">Payment ID</span>:</strong> ${data.invoice}</li>
            <li style="color:white"><strong><span style="color:white">Transaction ID:</span></strong> ${data.id}</li>
            <li style="color:white"><strong><span style="color:white">Phone:</span></strong> ${data.phone}</li>
            <li style="color:white"><strong><span style="color:white">Amount:</span></strong> ${data.amount}</li>
            <li style="color:white"><strong><span style="color:white">Mode:</span></strong> ${data.payment_mode}</li>
        </ul
        <hr style="border: 1px solid grey; width:80%">
        <p style="text-align: center; color:white">This is an auto-generated email. Please do not reply.</p>
    </div>
<div>`;

        const email_payload = {
            'personalizations': [
                {
                    'to': [
                        {
                            'email': data.email,
                            'name': data.name
                        }
                    ]
                }
            ],
            'from': {
                'email': "CUSTOM-EMAIL@YOUR-BUSINESS-DOMAIN",
                'name': "YOUR-BUSINESS-NAME"
            },
            'subject': 'TRANSACTION SUCCESSFUL',
            'content': [
                {
                    'type': "text/html",
                    'value': html_template
                }
            ]
        }

        email_payload.personalizations = email_payload.personalizations.map((personalization) => {
            return {
              ...personalization,
              dkim_domain: "YOUR-DOMAIN-NAME",
              dkim_private_key: "YOUR-DKIM-KEY",
              dkim_selector: "mailchannels"
            };
        });

        let res;
        let attempts = 0;
        let maxAttempts = 5;
        let success = false;
        while (attempts < maxAttempts && !success) {
        try{
            res = await fetch("https://api.mailchannels.net/tx/v1/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(email_payload)
                });
            if (res.status === 202) {
                success = true;
                // console.log("Email sent successfully.");
            } else {
                success = false;
                // console.log(`Attempt ${attempts + 1} failed with status: ${response.status}`);
            }
        } catch(error) {
            console.log(`Attempt ${attempts + 1} failed with error: ${error.message}`);
        }
        attempts++;
        }

        return res;
	},
};
