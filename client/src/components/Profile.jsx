import { FaEdit } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";


export default function Profile(props){
    const clientData = props.clientData;
    const setClientData = props.setClientData;
    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;
    const email = props.email;

    useEffect(()=>{
        axios({
            method: 'post',
                  url: `${API_DOMAIN}/api/get/userdata`,
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  data: {email:email}
        }).then((res=>{
            let data = res.data.data.at(0);
            
            setClientData(
                {name:data.name,
                phone:data.phone})

        })).catch((error)=>{props.setActive("ServerError")});

    },[]);

    return (<>
    <center>
    <div className="container justify-content-center text-center" style={{maxWidth:"300px"}}>
        <h3 style={{color:"white"}}>Your Profile</h3>
        <center>
        <ul className="list-unstyled text-left mt-5" style={{maxWidth:"300px"}}>
            <center><img className="rounded rounded-circle" src={props.pic} /></center>
            <li className="mt-4">Name : {clientData.name}</li>
            <li>Phone : {clientData.phone}</li>
            <li>Email : {props.email}</li>
        </ul>
        <button className="btn btn-warning mt-3 px-3" onClick={()=>{props.setActive("UserUpdate")}}><FaEdit/> Edit</button>
        </center>
    </div>
    </center>
    </>)
}