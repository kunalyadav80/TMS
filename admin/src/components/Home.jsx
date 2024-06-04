import { CgProfile } from "react-icons/cg";
import { FaRupeeSign } from "react-icons/fa";
import axios from "axios";
import { useRef } from "react";
import { useEffect } from "react";
import ClientInfo from "./ClientInfo";
import { useState } from "react";

export default function Home(props){
    const email = props.email;
    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;
    const list = useRef();
    const [stats, setStats] = useState({user:0,transaction:0,total:0});
    const [fetchDone, setFetchDone] = useState(false);

    useEffect(()=>{
        axios({
            method:'post',
            url:`${API_DOMAIN}/api/admin/stats`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            data: {email:email}
        }).then((res)=>{
                res = res.data;
                let data = res.data.at(0);
                setStats({
                    user:data.count_user,
                    transaction:data.count_transaction,
                    amount:data.total_received
                });
                setFetchDone(true);
                })
            .catch((error)=> {
                props.setActive("ServerError");
            })
        },[]);

    return (
    <>
    <div className="d-flex justify-content-center">
        <div onClick={()=>{props.setActive("Profile")}} className="border text-white bg-primary border-primary mx-1 rounded justify-content-center text-center"
        style={{minWidth:"140px", minHeight:"100px", paddingTop:"15px"}}>
            <h1 style={{fontSize:"50px"}}><CgProfile></CgProfile></h1>
            <p>Your Profile</p>
        </div>
        <div onClick={()=>{props.setActive("Payment")}} className="border text-white bg-success border-success mx-1 rounded justify-content-center text-center"
        style={{minWidth:"140px", minHeight:"100px", paddingTop:"25px"}}>
            <h1 style={{fontSize:"50px",color:"white"}}><FaRupeeSign /></h1>
            <p>Pay Now</p>
        </div>
    </div>
    {/* Client and Transaction Loading */}
    <div className="d-flex justify-content-center mt-2">
        <div className="border text-white border-dark mx-1 rounded justify-content-center text-center"
        style={{minWidth:"140px", minHeight:"100px", paddingTop:"25px"}}>
            {fetchDone ? <h1 style={{fontSize:"40px"}}>{stats.user}</h1> : <center><span className="spinner-border" role="status"></span></center>} 
            <p>Clients</p>
        </div>
        <div className="border text-white border-dark mx-1 rounded justify-content-center text-center"
        style={{minWidth:"140px", minHeight:"100px", paddingTop:"25px"}}>
            {fetchDone ? <h1 style={{fontSize:"40px",color:"white"}}>{stats.transaction}</h1> : <center><span className="spinner-border" role="status"></span></center>} 
            <p>Transactions</p>
        </div>
    </div>
    <div className="d-flex justify-content-center mt-2">
        <div className="border text-dark bg-warning border-warning mx-1 rounded justify-content-center text-center"
        style={{minWidth:"290px", minHeight:"140px", paddingTop:"30px"}}>
            {fetchDone ? <h1 style={{fontSize:"40px",color:"black"}}>₹ {stats.amount}</h1> : <center><span className="spinner-border" role="status"></span></center>}
            <p style={{fontWeight:"bolder",color:"black",marginTop:"20px"}}>Total Amount Received</p>
        </div>
    </div>
    <ClientInfo />
    </>)
}