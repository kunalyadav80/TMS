import { CgProfile } from "react-icons/cg";
import { FaRupeeSign } from "react-icons/fa";
import axios from "axios";
import { useRef } from "react";
import { useEffect } from "react";
import ClientInfo from "./ClientInfo";

export default function Home(props){
    const email = props.email;
    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;
    const list = useRef();

    useEffect(()=>{
        axios({
            method:'post',
            url:`${API_DOMAIN}/api/get/last/transaction`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
            data: {email:email}
        }).then((res)=>{
                res = res.data;
                let data = res.data.at(0);
                list.current.innerHTML = `
                <li><strong>ID :</strong> ${data.id}</li>
                <li><strong>DATE :</strong> ${data.date}</li>
                <li><strong>AMOUNT :</strong> ${data.amount}</li>
                <li><strong>MODE :</strong> ${data.mode}</li>
                <br>
                <li><center><a class="btn btn-primary bg-dark fw-bolder" href="${data.url}" target="_blank">Open Invoice</a></center></li>`;
                })
            .catch((error)=> {
                list.current.innerHTML = `
                <center>
                <p>Do Your First Transaction</p>
                </center>`})
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
        style={{minWidth:"140px", minHeight:"100px", paddingTop:"15px"}}>
            <h1 style={{fontSize:"50px",color:"white"}}><FaRupeeSign /></h1>
            <p>Pay Now</p>
        </div>
    </div>
    <div className="d-flex justify-content-center mt-2">
        <div className="border text-dark bg-warning border-warning mx-1 rounded justify-content-center text-center"
        style={{minWidth:"290px", minHeight:"140px", paddingTop:"15px"}}>
            <p style={{fontWeight:"bolder"}}>Last Transaction Details</p>
            <ul className="list-unstyled text-left px-4" style={{fontSize:"14px"}} ref={list}>
                <center><li><span className="spinner-border" role="status"></span></li></center>
            </ul>
        </div>
    </div>
    <ClientInfo />
    </>)
}