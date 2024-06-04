import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import { useRef } from "react";


function callPayAPI(button,PAY_API,data,email,amount){
    button.current.disabled = true;
    button.current.innerHTML = `<span class="spinner-border" style="color:black;" role="status"></span>`;
    if (data.name != "Loading..." && data.phone != "Loading..."){
       axios({
            url:`${PAY_API}/api/pay`,
            method:"post",
            headers:{'Authorization':'YOUR-CLOUDFLARE-WORKER-API-TOKEN',
                    'Content-Type':'application/json'
                    },
            data:{...data, email,amount}
        }).then(res=>{
            let resdata = res.data;

            const callback_url = resdata.notes.callback_url;
            const razor_key = resdata.notes.key;
            const order_id = resdata.id;

            const options = {
                "key": razor_key,
                "amount": amount,
                "currency": "INR",
                "name": "YOUR BUSINESS NAME",
                "description": "Internet Service Provider",
                "image": "YOUR-LOGO-URL",
                "order_id": order_id,
                "callback_url": callback_url,
                "prefill": {
                    "name": data.name,
                    "email": email,
                    "contact": data.phone
                },
                "theme": {
                    "color": "#3399cc"
                }
            }

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
        }).catch(error=>{
            button.current.disabled = false;
            button.current.innerHTML = `Pay Now`;
        });
    }
}

export default function Payment(props){

    const [userData, setUserData] = useState({name:"Loading...",phone:"Loading..."});
    const email = props.email;
    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;
    const PAY_API = props.PAY_API;
    const amount = useRef();
    const button = useRef();

    useEffect(()=>{
        // Adding Razorpay Script
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        document.body.appendChild(script);
        
        axios({
            method: 'post',
                  url: `${API_DOMAIN}/api/admin/get/userdata`,
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  data: {email:email}
        }).then((res=>{
            let data = res.data.data.at(0);
                setUserData({name: data.name,phone: data.phone})
        })).catch((error)=>{console.log(error)});
    },[])

    return (<>
    <center>
    <div className="container justify-content-center text-center" style={{maxWidth:"300px", marginTop:"10px"}}>
        <h3 style={{color:"white"}}>Pay Now</h3>
        <center>
        <ul className="list-unstyled text-left" style={{maxWidth:"250px",marginTop:"50px"}}>
            <li>Name : {userData.name}</li>
            <li>Phone : {userData.phone}</li>
        </ul>
        <form onSubmit={(event)=>{event.preventDefault(); callPayAPI(button,PAY_API,userData,email,amount.current.value)}} style={{maxWidth:"250px"}}>
            <input className="form-control bg-dark border-dark text-white mb-4 required" ref={amount} type="number" name="amount" placeholder=" Amount ₹" required min="1" />
            <button type="submit" ref={button} style={{minWidth:"150px"}} className="btn btn-warning mt-4">Continue</button>
        </form>
        </center>
    </div>
    </center>
    </>)
}