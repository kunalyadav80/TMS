export default {
	async fetch(url_data,invoiceDomain, corsHeaders) {

        const html_template = `
        <!DOCTYPE html>
        <html lang="en">

        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Protected</title>
          <link rel="icon" href="data:image/x-icon;base64,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">
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: #1a73e8 ;
            }

            .form-container {
              max-width: 400px;
              width: 80%;
              padding: 20px;
              box-sizing: border-box;
              background-color: #fff;
              border-radius: 8px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
            }

            .form-group {
              margin-bottom: 20px;
            }

            .form-group label {
              display: block;
              margin-bottom: 5px;
              font-weight: bold;
            }

            .form-group input[type="password"] {
              width: 100%;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 5px;
              box-sizing: border-box;
              font-size: 16px;
            }

            #submit {
              width: 80px;
              padding: 10px;
              border: none;
              border-radius: 5px;
              background-color: #007bff;
              color: #fff;
              font-size: 16px;
              cursor: pointer;
              transition: background-color 0.3s ease;
            }

            #submit:hover {
              background-color: #0056b3;
            }
          </style>

          <script>
            const handleForm = async (event) => {
              event.preventDefault();

              let button = document.getElementById("submit");
              button.disabled = true;
              button.innerHTML = "Wait";

              const pass = event.srcElement[0].value;

              const payload = JSON.stringify({
                password:pass
              })

              const url = "${invoiceDomain}/?data=${url_data}";

              try{
                  const response = await fetch(url,
                  {
                    method:'POST',
                    headers:{'Content-Type': 'application/json'},
                    body: payload
                  })
                  .then(response => response.text());

                  if (response === "Wrong Password"){
                    document.getElementById("message").innerHTML = "Wrong Password";
                    document.getElementById("message").style.display = "block";
                  }

                  else if (response === "Invoice Not Found"){
                    document.getElementById("message").innerHTML = "Your URL is Incorrect";
                    document.getElementById("message").style.display = "block";
                  }

                  else if (response.includes("<!--Made By Kunal-->")) {
                    const blob = new Blob([response], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    window.location.href = url;
                  }
            } catch(error){
              document.getElementById("message").innerHTML = "Server Can't Be Reached";
              document.getElementById("message").style.display = "block";
            } finally {
              button.disabled = false;
              button.innerHTML = "Submit";
            }
            }
          </script>
        </head>

        <body>
          <div class="form-container">
            <center>
            <img width="150px" src="data:image/png;base64,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" alt="">
            </center>
            <form onsubmit="handleForm(event)">
              <div class="form-group">
                <label for="password" style="font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif; margin-bottom: 5%;">Invoice Password:</label>
                <input type="password" id="password" name="password" placeholder="Last 4 Digit" required>
                <small id="message" style="color: red; font-size: 15px; margin-top: 5px; display: none;"></small>
              </div>
              <center>
              <div class="form-group">
                <button id="submit" type="submit">Submit</button>
              </div>
            </center>
            <pre style="font-family: Arial, Helvetica, sans-serif; font-size: 12px;">
            <strong>Hint:</strong>
            Last 4 Digits of Your Phone

            <strong>Example:</strong>
            Mobile: 1234567890
            Password: 7890
            </pre>
            </form>
          </div>
        </body>

        </html>`;

		// Respond with a 301 status code for a permanent redirect
		return new Response(html_template, {
			status: 200,
			headers: { 'content-type': 'text/html', ...corsHeaders }
		});

    // return new Response(url_data,{status:200})
	},
};
