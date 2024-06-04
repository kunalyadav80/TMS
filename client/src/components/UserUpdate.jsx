import { useRef } from "react";
import axios from "axios";

export default function UserUpdate(props){
    let buttonRef = useRef();

    const clientData = props.clientData;
    const setClientData = props.setClientData;

    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;

    return <>
    <center>
    <div className="d-flex justify-content-center pt-3" style={{backgroundColor:"black", color:"white", fontWeight:"bolder"}}><h2>PULSE <span style={{color:"orange"}}>BROADBAND</span></h2></div>
    <div className="d-flex justify-content-center text-center"><pre className="text-gray">BILLING PORTAL</pre></div>
    <center><hr className="border border-white" style={{margin:"0px",width:"300px"}} /></center>
    <div className="container justify-content-center text-center" style={{maxWidth:"300px",marginTop:"5vh"}}>
        <h3 style={{color:"white"}}>Update Profile</h3>
        <center><hr style={{margin:"0px", marginBottom:"20px", maxWidth:"250px"}} /></center>
        <center className="text-left">
        <form onSubmit={(e)=>{
            e.preventDefault();
            const data = {name:String(clientData.name), email:String(props.email), phone:String(clientData.phone)};
            
            buttonRef.current.disabled = true;
            
            axios({
                method: 'post',
                url: `${API_DOMAIN}/api/updateuser`,
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                data: data,
              })
            .then((res) => {
                    res = res.data;
                    console.log(res);
                    
                    if (res.hasOwnProperty("success")) {
                      if (res.success == true) {
                        props.setActive("Profile");
                      }
                      else {
                        props.setActive("ServerError");
                      }
                    }
                  }).catch((error)=>{setActive("ServerError")});
            }} style={{maxWidth:"250px"}}>
            <label className="mb-2" htmlFor="name">Name</label>
            <input className="form-control bg-dark border-dark text-white mb-4 required" onChange={(e)=>setClientData({...clientData,name:e.target.value.toUpperCase()})} value={clientData.name} type="text" name="name" placeholder=" Full Name" required />
            
            <label className="mb-2" htmlFor="phone">Phone</label>
            <input className="form-control bg-dark border-dark text-white mb-4 required" onChange={(e)=>setClientData({...clientData,phone:e.target.value})} value={clientData.phone} type="tel" name="phone" placeholder=" Registered Mobile Number" pattern="[0-9]{10}" required />
            
            <div className="d-flex justify-content-center">
            <button type="submit" className="btn btn-warning" ref={buttonRef}>Update</button>
            <button className="btn btn-danger" style={{marginLeft:"10px"}} onClick={(e)=>props.setActive("Profile")}>Cancel</button>
            </div>
        </form>
        </center>
    </div>
    </center>
    </>
}