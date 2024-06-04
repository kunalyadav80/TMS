import { useRef } from "react";
import axios from "axios";

export default function UserSetup(props){
    let phoneRef = useRef();
    let nameRef = useRef();
    let buttonRef = useRef();
    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;

    return <>
    <center>
    <div className="d-flex justify-content-center pt-3" style={{backgroundColor:"black", color:"white", fontWeight:"bolder"}}><h2>PULSE <span style={{color:"orange"}}>BROADBAND</span></h2></div>
    <div className="d-flex justify-content-center text-center"><pre className="text-gray">BILLING PORTAL</pre></div>
    <center><hr className="border border-white" style={{margin:"0px",width:"300px"}} /></center>
    <div className="container justify-content-center text-center" style={{maxWidth:"300px",marginTop:"10vh"}}>
        <h3 style={{color:"white"}}>Account Setup</h3>
        <p>Please Fill Your Details</p>
        <center><hr style={{margin:"0px", marginBottom:"20px", maxWidth:"250px"}} /></center>
        <center>
        <form onSubmit={(e)=>{
            e.preventDefault();
            const data = {name:String(nameRef.current.value), email:String(props.email), phone:String(phoneRef.current.value)};
            
            buttonRef.current.disabled = true;
            
            axios({
                method: 'post',
                url: `${API_DOMAIN}/api/admin/setupuser`,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                data: data,
              })
            .then((res) => {window.location.reload();})
            .catch((error)=>{setActive("ServerError")});
            }} style={{maxWidth:"250px"}}>
            <input className="form-control bg-dark border-dark text-white mb-4 required" onInput={(e)=>e.target.value=String(e.target.value).toUpperCase()} ref={nameRef} type="text" name="name" placeholder=" Full Name" required />
            <input className="form-control bg-dark border-dark text-white mb-4 required" ref={phoneRef} type="tel" name="phone" placeholder=" Registered Mobile Number" pattern="[0-9]{10}" required />
            <button type="submit" className="btn btn-warning" ref={buttonRef}>Continue</button>
        </form>
        </center>
    </div>
    </center>
    </>
}