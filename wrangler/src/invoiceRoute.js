import * as CryptoJS from 'crypto-js';

export default {
	async fetch(env, url_data, user_password, corsHeaders) {
		let data;
		try {
			const cyphertext = decodeURIComponent(url_data);
			const bytes = CryptoJS.AES.decrypt(cyphertext.toString(), env.URLEncryptionKey);
			const stringJson = bytes.toString(CryptoJS.enc.Utf8);
			data = JSON.parse(stringJson);
		} catch(error){
			return new Response("Invoice Not Found", {
        status: 200,
        headers: corsHeaders,
          });
		}

    if (data.phone.slice(-4) != user_password){
        try {
        const user_phone_from_db = await fetch("https://your-express-server-domain/api/get/userphone",{
            method:"post",
            headers:{"Authorization":"your-api-token",
            "Content-Type":"application/json"},
            body:JSON.stringify({id:data.id})
        }).then(res=>res.json()).then(data=>data.phone);

        if (user_phone_from_db.slice(-4) != user_password){
            return new Response("Wrong Password", {
                status: 200,
                headers: corsHeaders,
            });
        }
        }
        catch(error){
            return new Response("Wrong Password", {
                status: 200,
                headers: corsHeaders,
                  });
        }
    }

		async function formatDate(dateString) {
			// Split the date string into year, month, and day
			const [year, month, day] = dateString.split('-');

			// Rearrange the date parts in DD-MM-YYYY format
			const formattedDate = `${day}-${month}-${year}`;

			return formattedDate;
		}

		async function numberToWords(num) {
			var ones = ["", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "];
			var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
			if ((num = num.toString()).length > 9) return "Overflow: Maximum 9 digits supported";
			let n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
			if (!n) return;
			var str = "";
			str += n[1] != 0 ? (ones[Number(n[1])] || tens[n[1][0]] + " " + ones[n[1][1]]) + "Crore " : "";
			str += n[2] != 0 ? (ones[Number(n[2])] || tens[n[2][0]] + " " + ones[n[2][1]]) + "Lakh " : "";
			str += n[3] != 0 ? (ones[Number(n[3])] || tens[n[3][0]] + " " + ones[n[3][1]]) + "Thousand " : "";
			str += n[4] != 0 ? (ones[Number(n[4])] || tens[n[4][0]] + " " + ones[n[4][1]]) + "Hundred " : "";
			str += n[5] != 0 ? (str != "" ? "and " : "") + (ones[Number(n[5])] || tens[n[5][0]] + " " + ones[n[5][1]]) : "";
			return str;
		}

		async function calculateTaxes(totalAmount) {
			// Calculate subtotal (exclude 18% tax)
			const subtotal = totalAmount  / 1.18;

			// Calculate SGST and CGST (9% each)
			const sgst = subtotal * 0.09;
			const cgst = subtotal * 0.09;

			// Calculate total (subtotal + SGST + CGST)
			const total = subtotal + sgst + cgst;

			// Create and return the result object
			const result = {
			  subtotal: subtotal.toFixed(2),
			  sgst: sgst.toFixed(2),
			  cgst: cgst.toFixed(2),
			  total: total.toFixed(2)
			};

			return result;
		}

		const billData = {
			invoice_no: String(data.invoice_no),
			date: await formatDate(data.date),
			id: String(data.id),
			name: String(data.name),
			phone: String(data.phone),
			mode: String(data.mode),
			amount: Number(data.amount),
			words: await numberToWords(data.amount),
			taxes: await calculateTaxes(data.amount)
		};

		const htmlContent = `
<!--Made By Kunal-->
        <html>
            <head>
                <title>Invoice</title>
                <link rel="icon" href="data:image/x-icon;base64,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">
                <meta name="viewport" content="width=device-width, initial-scale=0.45">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
            </head>
            <body style="background-color: white; width: 794px; height: 1010px;">
                <script>
                    const makePDF = async () => {
                        const downloadButton = document.getElementById("download");
                        downloadButton.disabled = true;
                        downloadButton.style.display = "none";
                        const { jsPDF } = window.jspdf;

                        let doc = new jsPDF({unit: 'px',format: [830, 1080]});
                        let pdfjs = document.querySelector('#root');

                        doc.html(pdfjs, {
                            callback: function(doc) {
                                doc.save("Invoice_${billData.date}.pdf");
                        },
                        x: 12,
                        y: 12
                    });
                    }
                </script>
            <div id="root" style="background-color: white; width: 794px; height: 1010px; font-family: Arial, Helvetica, sans-serif; text-align: left;">
            <div style="display:flex; margin-top:1rem;">
                <div>
                    <h2 style="font-size: 25px;margin-left: 32px; margin-top: 16px; font-weight: bolder;">BUSINESS NAME</h2>
                    <p style="font-size: 14px;margin-left: 32px;margin-top:1rem; line-height:1.5">Address Line 1 <br>
                        Address Line 2 <br>
                        PHONE: YOUR-BUSINESS-PHONE <br>
                        EMAIL: YOUR-BUSINESS-EMAIL <br>
                        GSTIN: YOUR-BUSINESS-GSTIN</p>
                </div>
                <div>
                    <img style="margin-left: 230px;" src="data:image/png;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAGYAV0DASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigApKWoJZEhjeR2CqoLFvQCgCeivMpv2k/hhbTSQy+ONFiljYo6PdKCrDqCO1R/8NNfCtevj3Q8f9fi1HPFdTsWCxUldUpP5P8AyPUaK8t/4ad+FP8A0Puh/wDgWtIf2ovhSvXx5ov/AIFCnzR7l/UMX/z5l/4C/wDI9Toryn/hqb4Tj/mfdF/8CQaT/hqn4Tf9D7o3/f8A/wDrUc8e4f2fjH/y5l/4C/8AI9Xoryf/AIaq+E3/AEPuj/8Af/8A+tR/w1V8Jv8AofdH/wC/9Lnj3H/Z+M/58y/8Bf8AkesUV5N/w1V8Jf8AofdH/wC/9H/DVfwm/wCh90f/AL//AP1qOePcP7Pxn/PmX/gL/wAj1mivJv8Ahqz4S/8AQ+aP/wB//wD61H/DVnwl/wCh80f/AL//AP1qPaR7i/s/Gf8APmX/AIC/8j1mivJT+1b8JP8AofNH/wC/3/1qP+GrfhL/AND7o/8A3+/+tS9pDuh/2fjP+fMv/AX/AJHrVFeTf8NWfCXt480f/v8Af/Wo/wCGrPhN/wBD5o//AH//APrUe0h3Qv7Pxn/PmX/gL/yPWaK8m/4as+E3/Q+aP/3/AP8A61H/AA1Z8Jf+h90f/v8A/wD1qPaQ7oP7Pxn/AD5l/wCAv/I9ZoryY/tWfCXv490f/v8Af/Wpv/DV3wj/AOh90f8A7/H/AAo9pDug/s/Gf8+Zf+Av/I9boryaL9qr4SzNhfHui5/2p8fzFbVj8ePh3qhAtvGuhSlugF/GD+WafPF7MmWBxUdXSl9z/wAjv6KztP1/TNWXdZ6ha3a+sMyv/I1c3jvVXvsckoyjpJWJaKZuHrxShqZI6im8UtAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFMZd1PooA+evj5+yH4a+LwuNT08DQPExGReQp+7mPpInf6jmvz0+Jnwp8T/AAl1xtM8R6fJaMSfJuFyYZh/eRu/06j0r9kK5rxx4F0P4iaHPpGv6bDqVhKOY5V6e4PUEeorhr4SNZabn3uQ8XYrKGqVb36XbqvQ/GRie5oycdeK+ofj/wDsP634B+0az4N87X9CGXez+9dW49uP3ij259jXy2ylGKsCrqcFSMEHuCOxrwKlKpRdpH9CZZm2EzakquFnfy6r1QvmHscUBj6mmgUlZans+o/c3rS7j6n86iooKsiTcfWjcfWo6MCgOUk3EU3zDTaKA5R3mN7/AJ0odv7x/OmUUBykokYfxGk3tUdFAcpJvb1Io3N3Ymo8CjFIOVEm8+ppd7f3jUVGBQFiXzG9aQsjZyoI9wD/ADqPaKOlA+VMu2Gq3elyrJZXdxZSKcq9tK0ZH/fJFemeD/2pPid4JZRY+LLy6gXn7PqWLlDjt8/IH0IrygGlqo1Jwd4s87EZdg8UuWvSjL1R9vfD3/gou37uDxn4bUD7rX2kvnHuY3/oTX1J8N/jd4L+K1uH8N67b30oXc9qx8uZPqjAGvx+HFWtN1S60m+hvLG4ls7uI7kuIJDHIp9iK9Glj6kdJ6n57mXAOAxSc8HenL74n7aL8wp4r88fgr+3hrvheSDTfHCPr2lcL/aEYAuoh6sOkn6GvunwT480L4h6HBq+gajDqNlKOHiblfYjsfY17NKtCsrxZ+LZtkOOyafLiYe70ktmdNRTBin1ufPBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABUK3ETyOiyKzIcMqsCV+vpU1eXfEr4Jw+ML5td0DWr7wd4xRNsWsaa+RJjos8R+SVfYjPoaAPUKacV8sTftNeNvgHfJpvxt8MNNpBbZD428NxtLZyD1mh+9EfXqK+hfA/xE8N/EjRYtV8M61Z61YSAETWkocD2YdVPsarla1A6BlDcEZFfPHx7/Y68MfFrztT0xV8PeJME/a4F/dzn0kTv/vDmvonikYelYyjGouWSO3B47EZfVVbDTcZI/HH4nfCPxR8IdaOm+JNOktCxIhuR80M49Ufp+B59q43Ar9o/GHgnRPHujT6Tr2nQanYyjDRTqD+IPUH3FfCPx6/YT1fwm0+seBDJrWkLl301yDcwj/ZJ/1gH/fX1rxK+BdPWnqj94yHjihjXGhmHuT7/Zf+R8k0lTTwy2s0kM8bQzRtseOQFWUjsQeQfrUNeZs7M/VoyUkmtgooopFBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAB0pQaSigTH0Ui0tJiDJHQkV3Xwq+MPiX4P68mp+H74xAn9/aSEmC4XuGX19+CK4WlDEVUJyhLmjucuIw1HF0nRrxUovufrL8Bv2hNC+OWi+dYyCz1iBR9r02RvnjP94f3l9xXrW7NfjB4J8a6t4B8Q2et6LdyWd/bNlXQnDDPKt6qfSv1F/Z7+PGmfG7wil5CVttYtgI76xLfMj/3h6qexr6LC4pV1yv4j+ceKOFp5NN4jDq9F/Pl8meuUtNHSlr0D88FooooAKKKKACiiigAooooAKKKKACkpaKAKepaXaaxYzWd7aw3lpMpSSCdA6OD1BBBBr4++JX7C194R16fxl8CPEdx4G8QhjK+krMRZXB67R1Cg+jAr9K+zabiqjJw2E1c+DvA/wDwUE8R/DXxAvhP47+ELrQ9RjOxtWsoDtPON7Rjhl/2oyfpX2b4H+Inhr4kaLHqvhjXLLW7GQZE1nKH2+zDqp9jisz4o/Bzwj8ZNBk0jxbokGq2zA7JHGJoT6o4+ZT9DX58fFL9i34pfsz61N4u+EGv6nqWlxEyPHZNtvIUHOHjHyzKPXGfaumMaVZ2vyv8DG8oavVH6e9qay57Zr88fgf/AMFPjC0Oi/FXR3jmjPlvremxkYPTM0HUH1K/lX3Z4F+JHhr4maHFq/hfWrTWtPkHE1rIG2n0YdVPscVjUozp/Ei4yUloeX/HT9k/wp8Zo5bwQroviHHyalaoBvPpKo4cfr71+efxe+BPiz4L6s1rr1izWbMVg1KAbreYduccH/ZPNfsASfpWT4g8N6Z4q0m407VrGHULGddskFwgdWH0rz62Fp1tban3mR8W43J2qc3z0uz6eh+KR689aK+zvjx+wXd6a9zrPw8JurM5eTRZn+eP/rk3cf7Jr451DT7nSr2a0vLaa1u4WKSQToUdCOoIPNfP1aM6L95aH9CZTnmCzinz4ad326or0UuDRWGh7/N1EopaKB8yEo604LShcetAcwyinlS1Jt20hcyG0UUuD6Uw5kJRTtvFNpD5kFFFFMYUq0lLSEOopuTTqA9BV6iu4+EPxU1b4Q+NrLX9LckRsEuLcn5Z4j95T/Q1w1Kp25ojKUGpLc5sTh6eLoyoVVeMlZn7N+APHOmfEbwnp2v6RMJbO8iDr6qe6n3B4rpu1fnh+wn8bT4V8USeCdUnI0zVG32bM3Ec/cewb+dfoYnSvq6FVVocyP5Oz7KZ5Njp4aXw7xfdElFN9KdXQfOhRRRQAUUUUAFFFFABRRRQAUUUUAFJmlppoAPxoI3DFJS/nSA8J+L37Fvws+NGrtqutaJJY6s5zJfaRN9mllP+3gEMfcjNc38PP2B/BPwr8QR6x4V8S+MNHvUIJ8jVAElAP3XXZhh7Gvpr86PzrT2k+XlvoTyq97DYYzHEqs5kIGCzdT706jP1pd1ZlDW+6a82+JP7PfgP4sSifxJoUN1eAYF3CTDNj0Lrgn8a9Kz9aSk4qSs0b0a9bDTVSjJxkuqdj52P7Bvwkb/mGah/4MZf8aUfsG/CUdNLvz9dRl/xr6H2ilwKz9jT/lPV/t3Nf+gmf/gTPnn/AIYP+E3/AECr4/8AcRl/xo/4YP8AhL/0Cb7/AMGMv+NfQ1GPrR7Gn/KH9u5p/wBBM/8AwJnzx/wwf8Jf+gTff+DGb/4qk/4YR+En/QHvv/BjL/8AFV9EfhS8Uexp/wAof25mn/QTP/wJnzuP2EfhJ20i+/8ABjN/8VS/8MI/Cb/oE33/AIMZv/iq+hsCl496PY0/5Q/tzNP+gmf3s+eP+GEfhJ/0CL4/9xGb/wCKpf8AhhP4R/8AQGvT9dRm/wDiq+hvzpMD0P5Uexp/yi/tzNP+gmf/AIEz54m/YT+EkkZUaPexnsy6jLn+ZH6VxHiz/gnT4SvoWbw/4g1TSrj+BbvbcxfQ8BvyNfX/ABRx6VMsPSkrcp0UeIs2oyUo4mXzd/zPym+K/wCyL8QfhXHNeTWC67pCc/b9LBfavq8eNy/XmvFSpHB6+lft/NGki4ddynjBr5R/aX/Yx03x1b3fiHwbbw6X4iUGWWzjG2G8OPTor+4x715tbAW1pH6ZkfHspzjQzPS/2l+qPztoqxqGn3Ok309neQSW13A5ilhkBDIw6g+9V68fbRn7XCcakVOOzClFJRSLHBs0tNp1Ji5blrTdQn0vULa8tHaK5t5FljdeCGU5Ffrv8DfiLD8UvhjomvxsDLNCEnXusq8MPz/nX4/r1r7X/wCCd/xAaO813wjPIdjgXtsCe/Rx/WvTwFTlnydGfl3HuWLFYBYuK96m/wAGfdK06mLk9TT6+hP50CiiigAooooAKKKKACiiigAooooAguvP+zS/ZjH5+07PNzt3ds45xXx/8bv2k/2gvgnJcXN58LNB1rQoySNW0u6uZYwvq6gbk/EY96+x6ikjWRWV1DKeCpGQauMlF3auS1fZn5if8PZ/G23I8B+HyOn/AB+T/wCFH/D2nxr38A6B+F7P/hX1V8cP2C/hp8ZPtF9DYf8ACK+IJMt/aOkIsYdj3ki+631wDX54/HX9hv4lfA9p7xtPPibw+uSNU0lDIEHrJF95PryPevVpfVKujVmcc/bQ6ns3/D2rxn/0IOg/+Bs/+FH/AA9q8Z/9CDoP/gbP/wDE18J8g8HP86Oa7vqlD+U5fbVO591n/grV407eAdB/G9n/APiab/w9o8bdvAnh/wDG8n/wr4W5pKPqdHsHt59z7q/4ezeOP+hD8Pf+Bdx/hQf+Cs3jj/oQ/D3/AIF3H+FfCtFT9To/yj9vPufdX/D2Txz/ANCJ4e/8C7ij/h7J45/6EXw9/wCBdxXwrRR9Uo/yj9vPufdP/D2XxwOvgTw9/wCBdx/hS/8AD2Xxx/0Ivh3/AMCrivhWlwaPqlD+UPbVO590/wDD2bxz/wBCJ4d/8C7inf8AD2bxt/0Ifh//AMDJ/wDCvhTBo2mq+p0P5Re2qdz7sH/BWbxr38B6B+F5P/hSn/grN41/6EPQT/2+z/4V8JbTRtNH1Oh/KP20+592/wDD2bxn38A6D/4Gz/8AxNKP+Cs3jL/oQtB/8Dp//ia+EKKX1Oh/KP20+5986b/wVo8Srdxm++HulS2u751tdQlWQj23KRn619T/AAH/AG5Ph18dLiLTYLmXw74gccaZqu1DIfSNwdr/AKH2r8X6lt5pLWaOaGR4po2DJJG21lI6EHsfcVnPA05L3dBxxEk9T+iMHcOKbt6jNfGv/BPn9q25+LWhTeCvFV2Z/E+lRB7e6lPzXcA459WXue9fZvWvCnB0pOEj0YyUlzI+I/28vgJB9jX4g6LbeXOhEepxxrw6/wAMuB3HQ18L9K/anxd4dtvFvhzUtHu4w9veQPC4YZ6jGa/HHxp4bm8H+LNW0SfIlsLp4DxjIB4P5Yr53H0lBqS6n9DcAZxLFYaeBrO7p7ej/wAjEoooryj9aCnL92k+tH8Qx0pMaHr1r1j9l3xc/g343+GbvdshmuPssvOMq/HPtXk69a0NDv30vWbC8jOHt545VOemGBrSlLkmmeXmWHWKwdahL7UX+R+1sbbu2BUgrL8M6h/avh/Tbz/nvbRy/moP9a1a+w3P43lHkk4voFFFFBIUUUUAFFFFABRRRQAUUUmaAFooooASo3jDqQwDA9Qw61LRSA+bvjt+wn8NvjWlxeR2H/CL+IpORqelIEDt6yR/df8AQ+9fnd8dP2G/iT8ETNetYHxN4ejyf7U0hC+xfWWP7yfXkV+0VMdQ6kNyOhFdlLFVaWid0YTowmfzssAc+1Jtr9lfjj+wd8NPjL9pvYbD/hFvEEmWGpaUgQOx7yRfdb+fvX55/G/9hf4m/Bdp7v8As3/hJ9AjyRqmkAuVX/ppF95T+Y969mjjKdTR6M8+eHnA+d9tG2lZSuQRtYHBUjBFFdu5zPTcZgjrSinUmOaADbS0UU7DCiiimLUKKKKQCYFG2lopgJtpM7eKdSY5zS06jR6p+y/40n8B/HjwbqsExixfxwS4J+aNztK+45r90lYMoYdDyK/BT4FaDc+JvjF4O021RpJptTg+VRzhWBP6Cv3qjXbGq/3QBXg5hFc67npYW/IL2r8q/wBszS49J/aA8QrGNq3HlzkD1K81+qxxivy3/beuUuv2gtYCncY4IYz7HBr5nMNaXzP1jw/clmzS2cX+h4FRRSivnj+kgxxRQaSgexIvWn5KqT6c0xetPHKn6UjGWzP2I+C96dQ+FXhWduS+nQk/98gV2w6VwHwHjMfwe8JK3BGnxZH/AAGvQK+xh8KP4yxmmJqf4n+YUUUVZyBRRRQAUUUUAFJS0UAcB4o8TeP9NvJV0XwXZa1bA/JI2srA7D12smP1rjrv4pfGS0chfgqlwo6GHxNbf1UV7hSUAfPs3xz+MNupL/AHUpFH/PHX7Nj+WRVKT9pX4oW5/e/s6eKiO5h1K0f9A1fR+36flSbQew/KqUl2FZnzjH+1N47VsTfs7+PV942tn/8AZxWppv7THiS7kVbj4G/EK0BOCxtbdse/Ete9bB9KNuP/ANVF12AqaXfNqWnW909tPZtMgc29woWSPP8ACw9RVwUtFSMTFRsgYEMAR0walrnPGmtazoekyTaHoEniHUMHy7VblIFJ7bnboPoDRZsDxj47fsPfDb43LPeSacPDviFxkappKiNnbt5ifdf8cH3r8zP2kP2V/EH7OOrRx6lqumarp1w5W3uLa4UTH/ehJ3L9eRX2T8WI/wBs74lPNa6bo2l+DNKfIEOkanF5xX/amY7vyAr5p1T/AIJ8/tAavfy3t/oMGoXkxzJc3GsxSSN9WY5r2MLKVPWU1Y4a0VLRRPmGivpX/h3Z8dV5/wCEWsz/ANxWH/Gj/h3f8df+hTtf/BrB/jXpfWKX8yOL2U+x81UV9K/8O7vjt/0Klr/4NIP8aD/wTw+On/QqW3/gzh/xp/WKX8weyn2PmqivpT/h3j8df+hUtj/3E4f8aQ/8E8fjr/0Kdv8A+DOH/Gj6xS/mD2U+x82UV9Jf8O8/jr/0KUH/AIMof8aT/h3p8df+hSgP/cSg/wAaPrFL+YPZT7HzdRX0j/w71+Op/wCZRgH/AHEoP8acP+Cefx0P/Mp24HvqcP8A8VR9YpfzB7KfY+bKOntX05Zf8E5fjneXKRN4e0+2VjgyzanFtX3OMn8hX038Af8AgmLpHhW+t9Z+JGoxeIryMh00izBFmrDn52PzSfTgfWs54ulBXTuVGhOT2OS/4Jq/s03S6gfilr9q8ECI0OjwyKQXJ+9NzzjsK/RvtVexsbfTbSG1tYY7e2hUJHFEu1UUdAAOlTvjaTXz1aq6s3NnqwgoRsQ3l0lnayzyuEijQuzHsAMk1+PXxs8YDx58VfEuuJ/qbm7cR/7i/KD+OK+//wBtD4zQ/Dn4bzaNZ3IXW9aUwQop+dI/43/LivzLb/Of518/j6iuqZ+7+HeWSpxqZjNb+7H9WNpRzRSgYrxj9qENJSt1pO9AD+lT2sZuJo4l5Z3VQMZPJAqAc12nwd8NnxZ8TvDOkhC4uL+PcOvyg5J/SrgrySOLG1lQoVKr2Sb/AAP1r+Hen/2X4F0G0Ix5NjChHvsFdJVe1jEMSRqMKihQB7CrFfXrRWP4zqT9pOU+7CiiimZhRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUhFFIW2+1ACbaXbWfL4g0yFismo2kbDqHnQH+dR/wDCUaMP+YtY/wDgTH/jRZ9haGptorL/AOEq0b/oLWP/AIEx/wCNL/wlWjf9Bax/8CY/8aXL5DNP/PWj/PWsz/hKdG/6C1j/AOBMf+NL/wAJRo//AEFbL/wJj/xp8vkBpf560f561mjxLpLdNVs//AhP8aX/AISTSf8AoKWf/gQn+NHL5AaP+etH4Vnf8JJpP/QUs/8AwIT/ABpv/CTaR/0FLL/wJT/GjlfYRp/560fhWZ/wlGj/APQVsf8AwJT/ABpP+Em0jtqll/4EJ/jRyvsF/M1OPSis5fEGmNyNSsz/ANt0/wAa53xh8YPBvgO0NzrniTTrFMZCtcKzt/uoOT+VS2o6s1p06laSjTi2/I7TcK8z+Nvx28O/BPw3Jf6tcrJfSKRaafGcyzt2wOw9Sa+cfi1/wUJtIYZ7DwFpj3E7ZUarqClI190j6n8cCvi/xZ4w1nxxrk+ra7qM2qahMfmmuGyfoB0A9hxXm1sbGKtT1Z+m5HwPi8ZJVsevZ0+32n8uhp/E/wCJWr/FXxde+INZmMlxOcRxjOyGMdEUegrkmP5UrUij1rwpSlNuUj+g8PQp4anGjSVorRIVelLRRUnUNbrQoobrTqCWKtfUf7Avgc698UrrXJIt1tpFuSrEDHmPwP0r5eRfmGBk+nev0/8A2NPhj/wr34RWc91F5eqasftk/qFP3F/AfzrvwVP2lVPsfnnG2ZRwWVyp396povTqe+r09KkqMU+vpD+ZRaKKKBhRRRQAUUUUAFFFFABRRRQAUUUlAC0UwtXL+PPib4W+GGjyan4p12x0SyUH57uYIz+yr1Y+wzRqwOrqlqWqWmj2U13fXMNnaRDdJPcOERR6liQBXwX8YP8AgqlpOn+fZfDjw/Jq0wyq6tqwMUH1WIfM34la+G/it+0F8QPjZfvceLvEd3fwliY7GNvKtYv92Jfl/E5PvXfSwVSpq9Ec08RGO2p+lvxo/wCCkHw1+G8dxZ+HZJPHGtJlRHp52WqN/tznj/vkGvhL4yft2fFb4v8An2ja03hnRZcj+ztDJhyvo8v+sb8wPavnvb+HGMe1G0elevSwdKnurs4J15z2YSSNIzO7NIzHJdmLEmmMqt1UU/aKQj2rr0WyMOZtjPLT+6KUKF6KtLzRU2NLgFz/AAr+VLt9hQtOosFxMD0FGPwpaKdkFxMe9Lx3Gfwo4H/6q2tL8J32qbXCfZ4Tz5kvH5L1P8qxq1qVGPNUkkjvweBxWYVFSwtNyl5IxGC/3V/IVp6V4avtWIaGDZCessg2r/ifwrt9L8Hadpm2R0+1zYzvlxgH2XpW7u6e3GK+WxWeR1jh183/AJH7Fk/hvVqWqZnO391fq/8AI5/R/BFjp2JLj/TJup3AhB+A/rW+NqgBUUbemABijNFfKV8TVxEuapK7P23L8nwWVw9nhaSivx+/cRmJ6802nYFG0VzHteggGadSDHaloGFFIxPaloE9BB8opy0gHtV/R9Iu9e1O206wga5vLqQRRRR8szE9KFq7IyqVI04uU3ZI9U/Zf+D83xf+J1jbSRMdHsCt1fSgcBVPCc+pr9WLOGO1t44YUEccahVUDoBwBXkv7NfwTg+CvgCCxkCy6xdgT30wHVyPu/Regr2CP7tfUYaj7GFnufyzxTnTznHOUH+7hpH9X8wzSilorrPjQooooAKKKKACiiigAooooAKKKQ0AJvHrXiXxg/bG+FvwVElvrXiKK+1ZBxpelYuLgn0IBwv/AAIis344fs4+M/jQ8lv/AMLg1jwxoj5B0zSLGONWB7O4cM/549q8BT/gknoK5ZviPqhdupGmRc/+PVvTjSf8RmU3PaKPLPjL/wAFPPG3i/z7HwLp0Xg7TW+Vb2bFxeuPUfwJ+GTXyB4l8Va1401STUtf1a81rUJDk3F9O0rjPYFjwPYV+iv/AA6T8P8A/RRdU/8ABdF/8VSf8Ok/D/8A0UbVP/BbD/8AFV61PEYWl8KOKVOtLc/NXbRtr9Kv+HSegf8ARRtU/wDBbD/8VSr/AMEk/Dw6/EXVD9NOhH/s1bfXqL3M/q0z80zxRX6Wn/gkn4cx/wAlE1b6/wBnxf8AxVcv8Sv+CaPg74Y+Bda8T6n8SdSS0023adt2nxLuIHA+91JwKFjqLdkJ4epufn1RQxXcdvKZ43DBI7E0V3b6mCE3Un3qWl+lAxAMUtOiieaQRxo0khOAqjJP4Cul0vwJd3WHvGFrH/cGC/5dvxrkr4qjhlerKx7OXZPjs1nyYOk5efT7zmFUswUAkt0UAnP0roNL8FX2oYeYC0hPeTliP92u20zQrLR1zbwgOOsjcsfx7fhV/JJyetfKYrPZO8cOreZ+1ZN4aU4pVM0nd/yx0Xzf+Rk6T4Z0/SVVo4RJP/z2k+Y/h2Fa3X6+tFFfK1q1SvLmqO7P2bB5fhcvpqlhaahHyQm6gGlorE9Oy6CYpaKKAsgpM9qWk461SEAGKM84pd2aQj0oEAGKcOaRQTV7SdJvdd1K3sNOtZb29uHEcUEC7ncnsAOaai27LczqVI005ydku+xXghkuJkiiRpJGIVVUEkknAAxX6Efsgfsu/wDCB2kXjDxPbr/b9wn+i2bqD9kQ9z/tn9Kd+zB+x1B8P2tvE/i+KO88Q4DwWfDR2me5/vP79u1fVvk+gFe9hMJ7P357n4DxZxd9dvgcDL3Or7+S8h69KcoxRS16h+SBRRRQAUUUUAFFFFABRRRQAUUUUAFJ0paKAE460UtFACZFGRS0UAJkUZpaZ70AL+NfnN/wU++PpeSx+GGlXHyrtvNVaM/9+4j/ADNfdHxa+I+nfCb4e634p1SRUttPt2kC55d8fKo9ycV+FHjzxtqHxE8Y6v4j1SRpL7Urh7hznO3J4X6AYFejgqLnPntscmIqcsbI5/8Ai96dU1npt3qc3l2tvJM3faOB9T2rr9L+H6gK+ozbj18mE4A+pr0MTjqGFX7yWvY9LKuHsyzmSjhaTa77L7zj7W0nvZhFbwvM5/hQZNdVpXw/eUCS/m8pf+eUfJ+hY8Cuys7S30+ERW0CQRjsoqVjXyeKz2rUbVBcq/E/ccm8OcHhWqmYy9pLstI/5sq6fpVrpUe20hSHPVgPmb8etWsmkpcV81KU5vmk7s/W8Ph6OGgqdGCjFdFp+QlFLtNG2oOm9uo00m40HPpRzRYfMg3UbqKKA5g3UbqKAfY0g5kKDS0hOOvb+9xWz4e8Ha74smEOi6Nf6tITjFnbPIPxIGPzNUk3okYVK9OiuapJJebMfbtpPxA9c/419J/D39g74h+LTFPrf2TwpYtyTdt5txj2jU4B+pFfVXwv/Yn+H/w8eG8u7eTxNqiYIuNSAKKw7rGPlH45rup4KrPdWR8LmXGuV4G8YS9pLtHb79j4h+Dv7MPjb4wTQy2WntpmiMfm1W+UpHj/AGAeXP0496/QX4I/s2eFPgnYBrCBb/WnX9/qtyoMreoX+4vsK9ZtoUt4VjjRY0UYVVGABU1exRwsKPmz8UzrirHZ1eEnyU/5V+vcYuKkoorsPjgooooAKKKKACiiigAooooAKKKKACiiigAoopKAFopKimuEgjd5HVI1GWZjgAepPpQBNUU0yQxvJI6xxqMszHAHuTXzd8Tv23PDWg61J4W8A6dd/EzxqfkTT9EXfBE3T97MBtUeuKwdE/Z5+Jnx3uYtV+OXieSx0ZiHi8EeHJmgtwPS4lUhnPqM1fLbcVz6G8J/FLwp451bUtN8P65a6zdaaQt39iYyRxMf4S4G3PsDmuq7VkeE/BuieBdEttI8P6Xa6Ppluu2O2tIgiKPwHX3Nc/8AGT4i2vwt+HeseILqQIbeEiFe7yHhQB9azk0ldm1KnOtUjSgrtux8K/8ABSz4yXPizXtP+GegsbiCxYXWqNGRsEn8CE9OBzg18baR4AghxLqE32hv+eMeQv59TXd69rV14i1i91O+laa7vJmnldjncxOf/rVnbq8qpmtXl9nS0R+/5TwFgcLy1savaT7P4V8hsccVrEI7eJIox0VFAFOU7u+aMZ5oz6V4kpOTvJn6hSowpQUIKyQtFMz3p4qTcUc07b7E/TrSKtexfst/CV/ix8VNPtJY2bSrFhd3jBcjap4XJ9TVwh7SSijgx+Mp4DDTxNXRRVz2r4R/sE2PjLwJput+Itc1LTb++j84Wlqke2ND93JYHJIrsh/wTh8J9/Fmt/8AfEP/AMTX13b2qW0KRRgJGihVUDgADgVLsFfS/VaVrcp/Mdbi3OZ1JShiHFN7aafgfII/4Jw+Ev8Aoa9c/wC+Yf8A4mj/AIdw+Ev+hs1z/vmH/wCJr6/2CgIKPqtH+Uy/1qzv/oJl+H+R8fN/wTh8Jnp4s1sf8AhP/stMH/BN/wAK5z/wl+tkenlw/wDxNfYm0elGwUfVaP8AKH+tWdf9BMvw/wAj5AT/AIJx+EVYF/FOuMvcAQj9dtdBo/8AwT9+GdjIrXkmtaqB1juL3Yp/74VT+tfUG36flSFTnrVrD0VtEyqcTZzUVpYmX32PKvDX7Lvwt8KNHJY+DNNaZOkt0huH/OQmvSbHSbLTIVis7SG1jXokKBB+Qq5tp1bKKj8KseFWxVfEO9abl6tsZt9qNtPoqjmG06iigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKSlrhfid4O8ReObGHStI8USeFdOlJF9c2MIa9dP7kTscR5/vYJ9KAOJ+N37WHg34NXC6QHn8T+MLj5bXw3oq+fdOx6bwMhB7mvI0+EPxs/am2XPxP1lvhv4HmO9fCWiSf6XcJ2W4kzx7jP4V9C/C/4BeBvg/DIfDehxQ38xzcapdEz3tw3dnmbLE/jivRl6VpGSivdWpNr7nC/Cv4MeDvgvoKaT4R0O20q2A/eSIoM0x/vO55Y/U13PGORgU6mtjFQ229ShPMX3/I1+eX7fXxe/4SLxhbeC7CfNjpP7652nh5yOF/Adq+zfjd8TLX4S/DrV9fnkAlijKW6Hq8pGEA9ea/IrWtYvNf1a81G+lae8u5WmmkY8lmOTXk46tyx9nHdn6vwHk/1nEvMKq92Gi9f+AU93PFI2O1J3zRXgn9B7BRRRQMVacAaRRT1oAcoJ6KW9gM/wCTX6c/sa/B9vhr8M4b6+gEesaxi5mzyUQ/cX8q+K/2VvhK3xW+KlhBNEz6VpxF3eMVyuFPyrn3NfqpDGkESRxjaiAKoHYdhXtYCjvUZ+H+IGcXcctpPzl+iJB09aWlor2T8UCiiigAooooAKTNLRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUxvunvSscd8V5z8ePilbfCX4bavrszg3CxmK1jzzJM3CgUpNRV2b0KM8RVjRpq7k7I+K/wBvL4yHxd42h8IadKDpujHNwVORJcEdP+AivlXFW9U1O51rUbm+u5DLdXEjSyuSTuZjknNVP518lVqOpNyZ/XGT5bDKsFTwsOi1831FakoorI9wKXBpKctADl61LGpZguNxPQYyTUactXtv7Jvwjb4qfFOyW5h8zSNLIu7vI4OD8qn6mtIQdSSiup52Y4ynl+Fniaj0irn2v+x38JR8Mvhda3F1Ds1jVwLu5JGCoI+RPwH8699qGGNYY1RFCqowFHAAqavrIRUIqK6H8hY3F1MdiJ4iq9ZO4UUUVZxBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFMZgvWgAkyFyK/OL9u74wL4x8fQ+F7CfzNO0X/W7T8rznr9dor7T/aB+KNv8KPhhq2tM6i72GG0Q9XlbhcD2r8j9Q1CfVL6e8uZTLcXEjSySE5yxOSa8rHVuWPs1uz9b4Byf6xiZZhVXuw0Xr/wCvSUUteCf0CttRKKdxTaBir1p1NUEU8c0Eu1rj4YzJIoUEsxwABnPtX6kfsh/CEfC74W2sl1EE1nVcXd22ORkfKn4Cvir9kP4Pv8AFL4oW811HnR9IK3dyxHDkH5E/E1+pEEYjjCgbVAwBjpXt4Cjb94/kfhPH2b8045bTe2sv0QqinUUtewfjQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVDIw9RU1eTftKfFiL4Q/DDU9VR0/tKZTb2UbHlpW4H5damUlBOTOjD4eeLrRoU1dydj4s/bm+MB8dfEQeGrG4ZtI0Q7HCH5XuD94/h0r5l/HNT3d1cX91NcXEjTTzOZJJHJyzE5Jz9ah59K+Uq1HVm5M/rnKcBSyzBU8LT2S/HqxKWg89qKyPaugPNJ9Kd+dIFJoDmQq1JDG80ioi7mYhQoBOSegHvTQuOtfQP7Gfwj/4WX8UYr68i36NouLmYEZV5P4F/PmtKdN1JqKPKzTH08twlTE1HpFfe+h9p/so/CNPhL8LbGK5iVNX1EC7vG6ncw4XPsK9sXpSJhVAHAHSn19XGPLFRXQ/kPFYmpjK88RVd3J3CiiirOUKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8K/aK/ZpPx+vNMe48TXOkWtiG22sNukisx/iJJ64r3WkIzUyiprllsdeFxVbB1VXoStJbM+Lk/wCCbOkY+bxxqBPqLOL/ABp3/DtnRv8AoeNSz/15xV9m7fmzml2+9c/1Wj/KfRf62Z3/ANBD/D/I+Mf+HbOjf9DvqX/gHFSf8O19G/6HjUv/AADir7P20bT60vqtH+UP9bM7/wCgl/h/kfF5/wCCbOkdvHGo/wDgFFSH/gmzpPbxxqA/7co/8a+0dvvRto+q0f5Q/wBbM7/6CH+H+R8W/wDDtrShz/wnN+cf9OMf+NfRXwR+C2kfBHwl/YulyyXbvIZp7yZQJJXPc46D0FekbaTbxjNaU6NOm7wVmefjc8zHMafssVVco9hB2p9FLW54QUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUU1vrQA6ivy7+KP/BSH4seEfiN4l0Sws/DgstPv5baHzrKR22q2AWbzBk/hXL/APD0T4xDrbeGP/ACT/45XasHVaukczxEE7H62UV+Sf8Aw9C+Mne28M/+C+T/AOO1e0v/AIKofFWzmDXmjeGb+LvH9mmiJ+hEhx+VV9Srdg+sUz9XqK+HfhD/AMFRfCPiy9t9O8b6LN4SuJTs+3wS/aLPcf7xwGQe5BFfamlapZ61p9ve2FzFe2c6CSK4gcOjqehBHBrlqUp03aaNozjLZl6ikr5s/bf/AGh/E37OvgXRdY8M2+n3F1e332aT+0YnkULtzwFYc/jUQi5yUVuxykoq7PpSivyd/wCHpXxcx/yCvCwxz/x5zc/+RTX6Y/CPxdd+PPhp4a8Q3yRxXmpWMdzKkIIQMwydue1a1aE6NudEQqRqfCdjRSUN0rA1For8wfix/wAFHPir4N+JfibQtPtfDq2OnX8ttD51lI0hVTgbj5gyfwr0/wDYx/bW8ffHv4sS+GfE1to62IspLgPYWzxOGXHHzOeK63haqh7RrQwVaDlyn3fRTQeKxfGesT+H/Ces6nbor3FnaSzxq4JUsqkjPtxXIbm5RX5Mt/wVD+MCyOBZeGANxAH2CU8Z/wCutfYf7DX7Svin9ozw74iu/FFtpsNxp1ykUbadE0asGXPIZjXVUw1SlHmktDCFaM3ZH1HRSClrlNwoopvegB1Fc1498faD8M/C994h8SajDpek2abpJpT+QA6lj2Ar89fix/wVU1y6vZ7T4eeHLSxsVJCalrQM0sg/vCJSAv0JNbUqM6z9xGcqkYbs/S7IoyK/GHUP+CgXx31CVpP+E2W1H9220y2RR7coavaH/wAFFPjno0gMviWz1WMHPl3+lwsD7bkCH9a7PqFXujD6zA/ZGivzj+Gv/BV27+0RW/jvwhCYTw97ocrbl9zE+f0avvnwD440v4k+ENM8S6LJJLpeoxCaBpYzG20+oPSuOpRnS+NG8akZ/Czo6KTP8q/PP9qz9uz4k/Bv42az4V8PxaGdLs0iaM3lm8kpLLk5IdRSp05VpcsRzmoK7P0Nor8lP+Hn3xj/AOeXhn/wXSf/AB2j/h598Y/+eXhn/wAF0n/xyuv6jW7GP1iB+tdFfkp/w9B+MXaHwz/4LpP/AI7Tl/4Kf/GLvB4Z/wDBdJ/8dpfUa3YPrFM/Wmivj/8AYV/aq8Z/tF6j4ptfFcOmINNjikhbT7dovvHBByzZr6/rjnB05cstzeMlJXQtFFFQUFFFFABRRRQAU1ulOprUgPwW+PRB+NPjf/sL3H/oVS/BH4G+JPj/AOLJfDvhhrJb+O3NyxvpTGm0HHUA81B8dMH4zeN8f9Be4/8AQjX0Z/wS5/5L/qP/AGCJP/QhX1NSTp0OZb2PGUeapZme3/BMH4yrnD+G2/7iLD/2nXNeM/8Agnr8afBemS6g+gWmtW8Q3Ouj3gmlA9dhAY/hmv2UFIw+avHWPrdbHoPDwZ/PBcQS2s0kM8bQzRsUeN1KujA4IIPQ/Wvtj/gnD+0le+FPG8Pw31m9eXQNVJGniViVtbjGdi8/KrenrXP/APBTD4f6f4R+ONpqmnwpbrrln9ouI4wADKpwWwPWvmX4dapPonj7w3f27lJrfUYHVlP+2K9aVsRQ5muhwq9KrZH9AQbPGK+IP+CrQ/4tH4U5/wCYx/7TNfa+nzG5s4Jj1kjVz+IBr4p/4KsDPwh8LH01j/2Q14WG/jRXmejW/hs/LhvusPY1+7n7Nv8AyQnwKP8AqEwf+g1+EzcK2R2Nfu1+zf8A8kJ8Df8AYJg/9Br08wXuxOPC9T0nNI33TTqa33TXhnpH4O/tC/8AJc/HX/YXuP8A0KveP+CYf/Jxkn/YLm/pXg/7QuD8cvHeP+gvP/6FXvH/AATF/wCTjJP+wVN/Svpav+7fI8iD/ffM/WsVzHxNG74d+Jv+wbcf+i2rp1rl/ihn/hXPiY9P+Jbcf+i2r5uO563Q/AWb/Wv9T/Ov0p/4JOrjwj44/wCv2L/0CvzXmz5j8fxH+dfpP/wSd/5FLxyP+nyH/wBAr6HGfwLeh5VD+J9599ClpO1LXzp6wUmaWkoA/K7/AIKdfFa/8QfFa08FxXDJpOjQLM8CscPO/wDEeeSBXyP4K8G6t8QvFOmeHNCtvtmrahKIYIc4G49yewHc19B/8FFvDd1of7S2r3UysINStobiFiOCANpwfrXivwa+Jl38HfiZoXi+yt1u5dNn8xrdiB5qHhlz646V9JQuqC5NzyKjvVtI+zfC/wDwSY1G60uKXxB8Q4bDUWGWt9P0zz0T23vIpP5VQ8Vf8Em/Eljbs/hzx7pupyDkQ6jYvbFvbcjuPzFfU/wt/by+D/xKtYFfxND4a1WQANpuuf6O6sewkPyN+Br33S9YsdatVudPvLe/t26TW0qyIfxUkV5UsViYP3juVGlJbH47af8AsHfFez+JWi+Hdc8Mzx6ddXKrNqtowmtViB+Yl16ceuK/YLwz4fs/Cfh/TtH0+NYrKxgS3hRR0VQAK08jnvThWFavKs1zGlOnGnsI3r7V+Nf/AAUH/wCTpPEv/XGD/wBBr9lG7n2r8a/+ChH/ACdF4m/65Qf+g10YH+KzHE/AePfCj4X6z8ZPHOn+FNBe1j1O93eW145SPgZOSASPyr6R/wCHXfxd/wCf/wAM/wDgbJ/8brzj9h3WrHQf2mPCV5qN3BYWimVXuLmVY4xlO7MQK/X0/F/wLHgHxnoC/wDcSh/+KrtxWIq052jsY0acJx94/Mn/AIdc/F7/AKCHhj/wNl/+N0n/AA67+L69L7ww3/b7KP8A2nX6af8AC5vAQ/5nXw9/4M4f/iqb/wALo8Ad/G3h3/wZw/8AxVcf1zEG/sKR86/sL/sqeMf2c9Q8U3fiu50uQalFFHCunzNJjacknKivr4VU0/ULXVbWK7sriK6tZhujnhcOjj1BHBq3XDOcqknKW5vGKirIWiiioLCiiigAooooAKa1OpjfnQB+Cnxxz/wuXxvnk/2xcf8AoZr6C/4Jl6tZaP8AHm/lvrqCyibSZFElxIsa53DuSK+fPjl/yWXxv2/4nFx/6Ga4dlDdVBHoRmvq3T9pRUe6PE5uWpc/oG/4T7w138Q6V/4HRf8AxVYHi347fD7wRps1/rPjPRLK3jBY7r6N3b/dVWLE+wFfgt5EX/PNB9UH+FOW3VOUhUf7QXH5YFecst6uR1fWvI91/bE+P9v+0J8WZdY0yKSHQ7GIWlj5oIaRAcmQjtuPauK+Avge7+Inxi8J6FZpvkuNQiZioztRWDMT9AK5bwz4W1jxlq8OmaHpt1q+oTMFS3s4mlck+uOn44Ffqb+wz+xzcfA+1k8WeLUjbxfexeXHaqQwsYj1Ge7nviumrUp4elyxZlCMqtS7Pry2hFvDHEv3Y1Cj8Bivij/gqt/yR/wv/wBhcf8AoBr7dr41/wCComkSX3wH069RWZbLVYmbb2DArzXiYb+NH1PQrfw2flNJ9xv92v3a/Zv/AOSE+Bf+wTB/6DX4SyfdIHUgj61+4n7JevW/iL9nfwNdW0iyKunJCxXsy8EV6mY/Cjjwu7R7BTW+6aX+VQ3EyW8MkshCxopZmPQAck14R6R+EP7Qf/JcvHZ/6i9x/wChV7z/AMExP+TipP8AsFz/ANK+d/jJq8PiD4teMNRt2Etvc6rcSIw6Fd5AP44r6Z/4Jb6W9z8dNVvQmY7XSnDN6FmAFfS1tMN8jyYfxvmfq0tcx8Tv+Sd+Jf8AsHXH/otq6euY+J3/ACTvxN/2Dbj/ANFtXzkd0eq9EfgPL/rH/wB4/wA6/Sb/AIJPc+EfHB/6fYv/AECvzZkH75/94/zr9KP+CUH/ACJ/jf8A6/Yv/QK+hxv8A8qh/FPvf+Glpv0pcGvnT1haQ0n5UtAHg37Vv7K+j/tK+E44JJl0zxJYbm07UtuQpPVHHdD+Yr8ofi9+zf8AED4H30sXijw9cwWSthNUt0Mto49RIBgZ9GxX7rbqgu7WG/t3guIY54JBh45UDKw9CD1rsoYqdDRbGFSjGp6n88Qwy9Qy/mP8K6Dwj8QvE/gC8S78Na/qWhzqchrG5aNT9VBwfxFfsZ4//Yh+DfxCklmvfBtrpt7Icm70dmtJM+vyYX9K+Q/2gf8AgmXdeD9Dv9f+HmszaxBao00ukakB9o2AZPlyLwxA7MBn1r1KeNpVNJLXzOJ4ecfhY79nj/gpprekXlro3xQhTV9NdljGu20YS4h7bpUHyuvqVwfrX6R6Hrdj4k0m01PTLqO90+6jWWC4hbKyKRkEV/PWytGxVhtZSQQwwQRxiv1A/wCCWfxGvvEHw61/wtdztPFotwr2u45KRyDJX6A1z4zCxhH2kDWhVlKXJI+427V+Nv8AwUI/5Oi8S/8AXK3/APQa/ZAnqa/G/wD4KD/8nReJf+uMH/oNYYD+L8jTE/wz5sKhuCAQfbP86QQqP+Waf9+1/wAK9o/Y+8F6J8QP2hvC2h+IdOh1bSbl5POs7gEpJhcgEA9BX6pH9iz4Htjd8NND/CJ//iq9Ovio0J8skclOi6iumfiOIU7xKf8AgA/wp/kptb90mMH+Af4V+2n/AAxR8Df+ia6GP+2b/wDxVI37FHwO/wCia6L/AN8P/wDFVz/2hDrE0+qy7lz9kJs/s3+A/wDsHJ/M17JWT4b8N6b4R0W00fR7OLT9Ns4xFBawjCRqOgFateJJ8zbR6KVlYWiiikMKKKKACiiigAprU6o24oA/Bb46Lt+M3jcemsXH/oZr1T9hP4QeFvjV8YrnQvF+nNqemR6fJOsK3EkPzg8HKEH9a8u+OsiL8afHCl0B/te46sAfvHtX0L/wS/Zf+GhLzayv/wASmX7hz/EOuK+mqS5cPeL1sePCN6tmj7SH/BPH4D/9CbJ/4NLr/wCOVo6X+wX8CtKlWVPh/aXLg5H2y5nmX/vlpCD+VfQK9KWvnvbVH9pnq8kexznhP4e+GfAdmtr4c8P6bocAGNthapDn6lRk/jXQ8U6isnruWFeU/tPfDY/Fb4HeK/DsKb7ua1aS3Xr+9T5l/lXq1MK5GP50KTi00Jq6sfzxXdrLZXk1vcIY7iJykkbcFWBwR+Yr6o/Y3/bck/Z7hm8OeI7K41TwjPL5qNa4aezc/eKqT8yn04r6B/bG/wCCfdx471i88afDiOBNWmPm32iORGtw/eSJugc+h6+tfnV4u8C+IvAOpyad4k0S+0O8jYq0d7A0f5Mflb6gkV9JGpSxVO0tzy3GdGV0fr3Z/wDBQj4EXlqkzeN1tiRkwzWFwHHsQEPNeBftN/8ABSTw9rHhDUPDfwzjvLy7v42gl1m6gMMUUZGD5athixHcgAV+cnmDqHXHY7sj9KsabYXWsXiWtjby391IcLBbIZZGP+6ATWccFRg+aTHLEVGrJEZYseTlj1LHOa/UT/gl/wDCO68L/DvVvGV/CYZdelCWqOOTAn8Xtk/yr59/Zl/4J7+LviFrFnq/jyxuPDHhWMiVra5G26vB12BM5RT3J5x2r9U9D0ez8O6RaaZp1ulpY2sawwQxjCoqjAArmxmIUl7OBth6TXvSL9cx8T/+SdeJv+wdcf8Aotq6iuY+JgLfDzxLgZP9nXAA/wC2bV5Ud0dktmfgNIf3jc/xH+dfZ/7An7T3gL4C6D4ns/GOpz2El9cxyweTaSTbgFwc7QcV8WzSRrPIDIuQxBG4ep96b50f/PWP/vsf419TUpwrU1GTPFhKVOXMkfsL/wAPHvgZ/wBDHff+Cq4/+JpD/wAFIPgb/wBDFfn6aVP/APE1+PXnRj/lohH++Kd9pi/56p/32v8AjXH9Rod/xOn6zU7H7HaP/wAFCvgrruq2em2niC+N1dzLBEH0udV3scAEleOT1r6TRtyg9jyK/AP4ZuknxH8LKjqxbVLb7rg/8tBX74Xdj/aGkzWrSyQ+dCYzJCcOmVxkHsa83F0YUZJRZ1Uakqiu1Y/Ob9rL9vTxh4N+ObaX8P8AVYYdJ0L/AEe7hmhWWG8m/iDdwF6ZUg13fwr/AOCqPhPWIILbx7oN74cvMAPe6cpurZj67R86j8DXjvxy/wCCaHjvQdSvNV8E6hH4ysJpGmNvcOIb5SxJOcnbJ9QQT6V8leL/AIbeK/AF09v4k8O6nociHB+2Wjxr+DY2n8676dHD1YJX1OeU6sJN20P2Z0X9sz4Ka9As0HxH0OIEfcvJzbsP+AyAGuJ+NH7efwl8FeE9RTSvEtr4r1maB0t7HRz54LFSAWcfKqgnnn8K/HfzAw4dTj/azTlZWYRhhvPRVOSfw6045fST5nITxM7WsWb+7fUb65unUCSaRpWCDgbiT/Wv0f8A+CUXha6tfDfjPX5EK211cRW0TEfe2jJ+vWvkz4Dfsd/EL456tam30i50Xw8zA3Gs6hEYogmefLVgC7Y9B+NfsD8Kfhfovwd8C6X4W0KEx2FjGF3N96Vv4nb3J5qcZXhyeygVh6b5ueR1xHBr8bf+ChH/ACdF4l/642//AKDX7JNmvxs/4KEyKv7UXiPcwQmGDAYgE/L9a5MBb2uptiPgOK/ZW+ImifCr46eGfE/iG4kttJs3fz5o42kKgrgfKvJ59q/Sz/h478DP+hkvv/BVcf8AxNfjt5iDkSR49d4o8+P/AJ7J/wB9ivWrYelXlzSZw06sqaskfsO3/BSD4Gjp4h1A/TSp/wD4mmr/AMFIvgc3/Me1H8dJn/8Aia/H7zU/56Kf+BD/ABpPOj5DSIP+BisPqFDv+Jt9Zn2P3Q+C/wC0l4E+PsmpJ4N1Oe+k08KbhZ7SSAqG6ffAzXqlfm9/wSZYNrXj/aSV8i35zkZyfSv0hrx60FTm4x2O6nJyjdi0UUVgaBRRRQAUUUUAFJ1paZ06UAYF18PvDF9cPPc+G9JuJ3O5pJbGJ2Y+pJXNWNJ8IaFoEzTaZo2n6dMw2mS0tY4mI9CVArWLDucUuQe4ov0uKy3sO/hopP1o9aBjqKZuA9qN3vQA+kpvvR3oEKelUdU0TT9ctzBqNjbahAeDFdQrKp/Bgau7gvU4o3BulL0Gefzfs9/DCefzpfh14VeUnO86Nb5z/wB8V0ug+BfDnhZdujaBpekL6WFnHD/6Corc9OKKrmb0uKyDaOvelFN3UvFIY6opI1mRkdQ6twVYZBp/HWj+dAGA3w+8MSNubw5pLMeSzWMX/wATR/wr7wx/0Luk/wDgBF/8TW7kA9fwp2c9KLvuI5//AIV74XPXw3pP/gBD/wDE0f8ACu/C/wD0Lekf+AEX/wATXQUlF33DQw4fAvhu1mSWLw9pcUiHcrpZRAqfUHbwa3f4elN3r6ijdRvuPYdz7VBdWNvfwtDcwx3ETcFJUDqfwIxUw5penehaC9ThNU+BPw51qYy3/gLw1dyt1km0i3Zj+O3NXNC+D/gXwzMsukeDNA0yVeklppkMbD8QoNddn3pearml3FyrsNWMKoVRgDoAKfScYpGNT5lD6x9S8J6JrFwZ77R9PvJsf6ye1jkb82BrVpO9HmBhf8K/8M4x/wAI9pI9vsMX/wATR/wr/wAM/wDQu6T/AOAMX/xNb2aXIHU09e4rGD/wgHhn/oXdK/8AAGL/AOJo/wCEB8Nf9C7pP/gDF/8AE1u7h60vNF33CyM7S/D+l6GZDp2nWlgZPv8A2WBI9312gZrTpmAacOlIYtFFFABRRRQAUUUUAFRSL74qWopBQI+PvGfhez+In7VniDR9c8SaxpGl2ulwzxrYao9qobkHocc1S8caInwX8beCx8PvHmtazqOo6gtvc6Ld6ib5ZYf4mK87cDvVnXvA/g/x1+2D4ps/GNlZ31hHpMEkcd5JsQPzzncOcVl/HzwD8OvhHbaHrXw1mg0Txi2owxW9tpV40puFLDcrR7m4xXEtpPzP0elOPPQotys6a05Vy6rq/wBT7YjYtGu4YOOabLg5I6gVDo8k02l2clwNtw8KNIuMYYqMj86nmXg/TtXZfY/OpRs2mfGHwf8AhLF8YvFHxBvtc8UeJoTY63LbxQ6fq8sMYXOfug4rbsYNV+BP7RnhHwxpHinVte8P+II3W40zVrr7S9sVHEgY8gVzXwN+Do+JfiT4lXL+K/Enh/yNbmjSHRL828bEk/MygHJra/Zs8MWHgH47eJvDvjFZ7/xzGvm6ZrWoXDytdWZ7JuPDDviuRJ2Wh+iYmUIzr3nzKMV7nL3S1v5bvqfYZ5rl/iL4xg+H/gjWvENyqtDp9u05XP3sDgfniuo6V518ffB9348+EPijRbFd15dWjCIZ+8w5A/HGK65XtofBYaMJV4Kp8Lav6XPFfhr8EdS+PWgweNviV4g1i6Op5mtNEsbx7W2tYT90YQgk47movGGg67+yXq+k+INC1/UdW8B3V0lrqGj6pOZzbbzgPG7c49q739l34v6F4q+HWm6K13HY+ItHhFne6XcsEmjdPlJ2nGR71yf7WHjax8dW+j/DTw7cR6t4i1S+ieWG2bzPs0SNku5H3a55Rjy3W59ZCpiZ5g8NVX7q7TVvdUe+2ne59M2V0l5bwXEZDRSoHU47EZFWqz9DsW0zSLGzY5NvAkRPqQoFWZ7hbWN5pX2RopZmOAAB1zXStj42SXO1E8C/ak8TalqraD8N/Dt7Ja654kn2zTQOVkhtl5ZsryPrVv8AZV8Z3l94Z1Pwfrk0kuv+GLtrKZpm3SSRZ/duc8nivJ/COqfEL4h/GTxN8SfCHhzSdbsIXbSrCbVr5rdURDhimFJOT3qVda8b/C/9ojRfFXjHQ9N0HT/EwXTLs6ZdmeEyfwM5IBDfzrkUrS5j7b6lGWEeCTjzJc265ubdq2+x9mCo7j/UyY4bacUQsHXIbdmln/1En+6f5V1nxC31Pi74D/Ce2+Ml1421LXfEniZZ7PW57aJbPV5YkVQxxxmt7xna+Lv2V9a0fW7HxPqfifwLeXSWt9p+tS+fLa7jgOknWtP9jfUrSytfiGtzdQwufEVw22SRVOMnnk1D+1d430/x7a6J8N/Dd3FrOvarfxNLDZyCT7PEjZLOVzt/Gub3VTv1Pupyr1MyeHmr0uqa0StvtofUWn3CX1pDcRHMcqB1x6EZFVteJXR71lO0rC5DA4I+U9DTtDsjp2kWVqesEKRH8FA/pTPEI/4kt9/1wk/9BNdHqfEK3tLLa58Wfs+fCnw58TvCN/rPijxbr0F9/aVxF5aa7JCoVXOPl3V3PwJur/wv8f8AxD4Q0TxFqHijwXb2SzNLeXBuRaTH+ASnqT6Zrif2Z/gn8L/HvgPUNT8YaXZXmp/2ncRmS4u3iYIHOBgOK3PDFloPwu/ae0Dw58NNQeTRr+1kfV9Jt7pri3hI+6+SWw341xQ5koyP0XGONWriaCbdouycVyq1no+/Y+xV5AqOZR1IGB3NSL0Fec/Hv4hr8M/hpq+rI2b1o/s9pH3eZ/lUD8TXa5cqbPzujSlXqRpR3bsfNXxa8ZeLPGnjvxJ4w8L6ncxaH4Clii+y27ny7tw2ZtwBwcLX194L8SWvjDwvpet2TrJb31uk6svTkZr5e+FfgX4zeDfh6dFtvCvhe8s9TDz3Ut9qUq3Epl5YuAmM89K3/wBkPXtX8J6h4h+F3iWJLTVNFm+020UUhkQwSHOEY8kA+1c8HZpvqfW5jQhWwzjScX7HRWau49W7effufUHevnr9tS+v7P4Swf2bf3OmXM2p28P2i1laNhufHVSOK+hfxr53/ba+X4U2Xq2sWff/AKaCtanwM8PKf9/o6X1J/wBnH4s6pdy3Xw98bOYvGOjqCkspx9vt8fLKv97jrVX4ZarfXn7V3xGtZbyeW0hsYNlu0rGNOf4VzgVq/Gr4R3ni7w/ovirww4s/G+gxLPYzgY85QoLQvjqrCvM/2U/G0nj74/8AjnWZrZ7O7m06BLm2kUq0UyNtdee2aycuVxR9AqNKvRxWMoxVuW0l/LK628n0+4+wMV4n+2FqV3pPwJ164srqayuB5YE0EhRwCwzgggivbK8J/bRX/jH/AMQY9Y+n++K2npFnzeWJPG0U9uZfmc/4Z/ZXsdW8K6TqEfjrxrZ39xaRzedHrLkKzKDwpGMc1a+DvjXxb4H+K198LvGmptr/APo/2zSdYlAEs0Q6o+OrD1r1LwV4o0fTfAGgvdanZ26R6fBuaW4RcYjGc814p4R1iH41ftVHxNoObnw54ZsWs21BR+6mmY8hG/ixWSjGNuXc9pTrYn6xHFawim02tn0s/wBD6ljxUlRRgZOBipK6LHySFooooGFFFFABRRRQAVG0ZbviiigDzrxh+z18PvHuuSaz4g8L2WqanIoR7ibdkgdM4Ipvhf8AZ0+HHgrVk1PRfCGmWV+n3bhYizL9CScfhRRWajG97HV9bxCjyKo7bbvbsekL29KGAPWiitTlOd8L/D/QfBMupS6Lp0OnSalcG5uzED+9kPVjk9aj1f4c+Hdf8SaZr+oaXBc61ppJtL0giSLPUAg9PY0UVPkae1qJ8/M7s6bGKQqO/SiimZHmfjr9m74c/EjUDf674ZtbjUO93CWglP1ZCCfxrU+HfwT8E/CmOUeGNAtdLklH7yZQXlf6uxJP50UUuVXOp4vESgqTqPl7XdjuMeh/Sq2p6bb6xYXFldR+ZbTxmORM43KRgjIoopnKt9DM8I+C9G8B6HDo+hWEen6dDkx28ecAk5JySaj8W+A9D8eaYun6/p8OpWqSrOkcwPyupyGHuDRRS8i/aT5+e+vfqb1vAttGkUY2oqhVHoBSuu5SpGQRiiimT1PHNU/ZD+E+s6jc3t34Rt5Li5kaWVlmlXcxOScBq7DwL8GfBnwxVx4Y8P2WkNJ9+WCPMjfVzkn86KKXKrnXLGYirHknUbXqztIxtXGc0y4gS5heJ13RyAqwPcEciiimcaZ4/J+yD8I5pJJH8F2bNIxdiZJepOT/ABV2HgP4OeDfhiJR4X8PWWjNKMSSW8fzsPQsST+tFFZ8qjayOypi8RUi4zqNp+bO0Bxiue8WeA9C8bfYRrunRaitjOtzAs2dqSDo2M8496KK08jlUpQfNF2ZurCFUKOMeg4rD/4QTQ/+EuXxQdNg/t9YDbC+VSHMZ/hPPIoopPYabWz3OgFYXi/wRovjzTE0/XtPj1GzSZJ1ilzgOpyrcHsaKKYoycZXi7NGxFbiGNUXCoqhVXHQCsDR/h14c8PeJNS1/TtJtrPWNRULdXUKbWmA6bqKKPMpTlFOz33Ok28daw/GHgvR/Hmg3Oi67ZpqGmXAAlt3JAbHToQaKKW+4oScXzRdmjzFP2N/g/HIrjwZasV6K80rL+I3c16p4f8AC+l+FdNi0/R7C302xi4SC2jCIPwHWiiiMVvY2q4qvXSjVm5LzZrKu3vmnUUUznFooooAKKKKAP/Z" width="150px" alt="">
                </div>
            </div>
            <br>
            <br>
            <div style="position: relative; display: flex; justify-content: center; align-items: center;">
                <h3 style="font-size: 25px; color: #3094bf;margin-top:0;margin-bottom:.5rem;font-weight:bolder;line-height:1.2">Tax Invoice</h3>
            </div>
            <hr>
            <div style="display: flex;justify-content: center; line-height:1.5">
                <div>
                <p style="font-size: 14px;">
                <b>Payment ID:</b> ${billData.invoice_no} <br>
                <b>Invoice Date:</b> ${billData.date} <br>
                <b>Transaction ID:</b> ${billData.id}</p>
                </div>
                <div style="padding-right:3rem; padding-left:3rem">
                    <p style="font-size: 14px;">
                    <b>Customer Name:</b> ${billData.name} <br>
                    <b>Customer Phone:</b> +91-${billData.phone} <br>
                    <b>Payment Mode:</b> ${billData.mode}</p>
                </div>
            </div>
            <hr style="margin-bottom: 5rem;">
            <div style="font-size: 14px;width:100%;margin-left: 3rem; margin-right: 3rem; font-weight: bolder;">
                <div style="display: flex;">
                    <div style="min-width: 350px;">
                    Description
                  </div>
                  <div style="min-width: 130px;">
                    Cost (INR)
                  </div>
                  <div style="min-width: 110px;">
                    Quantity
                  </div>
                  <div style="min-width: 110px;">
                    Amount (INR)
                  </div>
                </div>
            </div>
            <hr>
            <div style="margin-top: 20px; margin-bottom: 20px; font-size: 14px; width: 100%; display: block; margin-left: 3rem; margin-right: 3rem;">
                <div style="display: flex;">
                    <div style="min-width: 350px;">
                    Internet Service Charges
                  </div>
                  <div style="min-width: 160px;">
                  ${billData.taxes.subtotal}
                  </div>
                  <div style="min-width: 80px;">
                    1
                  </div>
                  <div style="min-width: 110px;">
                  ${billData.taxes.subtotal}
                  </div>
                </div>
            </div>
            <hr>
            <div style="width: 100%; font-size: 14px; padding-left: 400px; display: flex; line-height:1.5; margin-top: 30px;">
                <div style="padding-right: 82px;">
                    <div>
                        Subtotal <br>
                        SGST [9.0%] <br>
                        CGST [9.0%] <br><br>
                        <strong>Total</strong>
                    </div>
                </div>
                <div style="padding-left: 75px;">
                ${billData.taxes.subtotal}<br>
                ${billData.taxes.cgst} <br>
                ${billData.taxes.sgst} <br><br>
                <strong>${billData.taxes.total} INR</strong>
                </div>
            </div>
            <div style="font-size: 14px; padding-left: 60px; padding-top: 100px; display: flex;">
                <div style="min-width: 480px;">
                    <div>
                        <strong>INVOICE AMOUNT IN WORDS</strong><br>
                        <p style="max-width: 300px; text-transform: uppercase">${billData.words} Rupees Only</p>
                    </div>
                </div>
                <div>
                    <strong>For, YOUR-BUSINESS-NAME</strong> <br>
                </div>
            </div>
            <div style="text-align: center; font-size: 10px; padding-top: 50px;">
                <p>THIS INVOICE IS AUTO GENERATED AT THE TIME OF TRANSACTION. <br>
                    THANK YOU FOR CHOOSING US AS YOUR PREFERRED INTERNET SERVICE PROVIDER.
                </p>
            </div>
        </div>
        <center>
            <div style="width: 794px; background-color: white;">
            <button id="download" style="margin-top: 10px; margin-bottom: 10px; border-radius: 10px; background-color: black; color: white; font-weight: bolder; font-size: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 10px;" onclick="makePDF()">Download PDF</button>
            </div>
        </center>
            </body>
        </html>`;
	  // Return the HTML response with the JSON data
      return new Response(htmlContent, {
		status: 200,
        headers: corsHeaders,
      });
	},
};
