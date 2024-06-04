export default {
	async fetchTemplate(template,data) {
        if (template === "success"){
		const success_HTML = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="data:image/x-icon;base64,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">
        <title>Payment Success</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: black;
            color: white;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <div style="min-width: 400px; font-family: Arial, sans-serif;">
            <div style="max-width: 430px; margin: 0 auto; background-color: black;color: white; padding: 30px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1);">
                <h2 style="text-align: center; color: #ffbb38;"><span style="color:white;">YOUR</span> BUSINESS NAME</h2>
                <center>
                    <svg width="125px" height="125px" viewBox="0 0 1024 1024" class="icon" version="1.1" fill="#000000"><g stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M511.891456 928.549888c229.548032 0 415.634432-186.0864 415.634432-415.634432C927.525888 283.3664 741.439488 97.28 511.890432 97.28 282.343424 97.28 96.258048 283.3664 96.258048 512.915456c0 229.548032 186.084352 415.634432 415.634432 415.634432" fill="#ffbb38"></path><path d="M436.571136 707.376128l330.3936-330.3936c5.506048-5.507072 8.571904-12.803072 8.633344-20.544512 0.060416-7.85408-2.961408-15.235072-8.511488-20.784128 0.001024-0.012288-0.001024-0.002048-0.001024-0.002048l-0.001024-0.001024c-5.410816-5.409792-12.978176-8.489984-20.687872-8.460288-7.810048 0.032768-15.13984 3.081216-20.640768 8.58112l-309.11488 309.116928-94.99648-94.998528c-5.501952-5.501952-12.833792-8.5504-20.642816-8.58112h-0.115712c-7.69536 0-15.186944 3.08224-20.569088 8.465408-11.360256 11.36128-11.307008 29.899776 0.118784 41.325568l109.924352 109.924352a29.017088 29.017088 0 0 0 4.883456 6.474752c5.658624 5.6576 13.095936 8.482816 20.550656 8.481792a29.31712 29.31712 0 0 0 20.77696-8.604672M511.891456 97.28C282.3424 97.28 96.256 283.3664 96.256 512.915456s186.0864 415.634432 415.635456 415.634432c229.548032 0 415.634432-186.085376 415.634432-415.634432C927.525888 283.365376 741.439488 97.28 511.891456 97.28m0 40.96c50.597888 0 99.661824 9.901056 145.82784 29.427712 44.61056 18.868224 84.683776 45.889536 119.10656 80.31232 34.422784 34.422784 61.444096 74.496 80.313344 119.107584 19.525632 46.164992 29.426688 95.228928 29.426688 145.82784s-9.901056 99.662848-29.426688 145.82784c-18.869248 44.61056-45.89056 84.6848-80.313344 119.107584s-74.496 61.443072-119.10656 80.31232c-46.166016 19.526656-95.229952 29.426688-145.82784 29.426688-50.598912 0-99.662848-9.900032-145.828864-29.426688-44.61056-18.869248-84.683776-45.889536-119.10656-80.31232-34.422784-34.422784-61.444096-74.497024-80.313344-119.107584C147.117056 612.57728 137.216 563.514368 137.216 512.915456s9.901056-99.662848 29.426688-145.82784c18.869248-44.611584 45.89056-84.6848 80.313344-119.107584s74.496-61.444096 119.10656-80.31232C412.228608 148.140032 461.292544 138.24 511.891456 138.24" fill="#000000"></path></g></svg>
                </center>
                <h2 style="text-align: center; color:#ffbb38">Transaction Successful</h2>
                <p style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:white; margin-left:30px;">Dear <strong>${(data.name).toUpperCase()}</strong>,<br>Thank you for your recent transaction with us.<br>We appreciate your trust, and we’ll do our best to continue to give you the kind of service you deserve.</p>
                <br>
                <center><a style="display: inline-block;padding: 10px 20px;background-color: #ffbb38;color: #000;font-weight: bolder;text-decoration: none;border-radius: 5px;transition: background-color 0.3s ease;" href="${data.invoiceUrl}">Open Invoice</a></center>
                <br>
                <hr style="border: 1px solid grey; width:80%;">
                <br>
                <h3 style="color: #ffbb38;">Transaction Details:</h3>
                <ul style="margin-bottom:50px">
                    <li style="color:white"><strong><span style="color:white">Date:</span></strong> ${data.date}</li>
                    <li style="color:white"><strong><span style="color:white">Payment ID</span>:</strong> ${data.invoice_no}</li>
                    <li style="color:white"><strong><span style="color:white">Trnx ID:</span></strong> ${data.id}</li>
                    <li style="color:white"><strong><span style="color:white">Phone:</span></strong> ${data.phone}</li>
                    <li style="color:white"><strong><span style="color:white">Amount:</span></strong> ${data.amount}</li>
                    <li style="color:white"><strong><span style="color:white">Mode:</span></strong> ${data.mode}</li>
                </ul
                <hr style="border: 1px solid grey; width:80%;">
            </div>
        <div>
      </body>
    </html>`

        return success_HTML;}

    else if (template === "failed"){
        const failed_HTML = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" href="data:image/x-icon;base64,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">
            <title>Payment Failed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #1e1e1e;
                color: #fff;
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }

              .container {
                text-align: center;
              }

              h1 {
                color: #ff6961; /* Light Red */
              }

              p {
                color: #ccc;
              }

              .btn {
                display: inline-block;
                padding: 10px 20px;
                background-color: #ff6961; /* Light Red */
                color: #fff; /* White */
                font-weight: bolder;
                text-decoration: none;
                border-radius: 5px;
                transition: background-color 0.3s ease;
              }

              .btn:hover {
                background-color: #ff8b7f; /* Light Red (Lighter shade) */
              }
            </style>
          </head>
          <body>
            <div class="container">
              <svg
                fill="#ff6961"
                height="200px"
                width="200px"
                version="1.1"
                id="Capa_1"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="-49 -49 588.00 588.00"
                xml:space="preserve"
                stroke="#ff6961"
                stroke-width="7.840000000000001"
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  <polygon
                    points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 "
                  ></polygon>
                </g>
              </svg>
              <h1>Transaction Failed!</h1>
              <p>Sorry, your Transaction could not be processed.</p>
              <a class="btn" href="${data.invoiceUrl}">Go Back</a>
            </div>
          </body>
        </html>`
        return failed_HTML;}
	},
};
