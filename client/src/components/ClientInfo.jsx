import axios from "axios";
import { useState, useEffect } from "react";
import { MdOutlineScreenSearchDesktop } from "react-icons/md";

export default function ClientInfo(){
    const API = 'https://YOUR-WORKER-DOMAIN/api/clientinfo';
    const [data, setData] = useState(false);

    useEffect(()=>{
        axios({
            method:"post",
            url:API
        }).then(res=>{
            res = res.data;
            setData(res);
        }).catch(error=>{})
    },[]);
    return ( <>
    
    {data === false ? <></> : 
    <div className="d-flex justify-content-center mt-2">
        <div className="border text-white border-dark mx-1 rounded justify-content-center text-center"
        style={{minWidth:"290px", minHeight:"140px", paddingTop:"15px", backgroundColor:"#784cfc"}}>
            <MdOutlineScreenSearchDesktop style={{fontSize:"50px"}} />
            <p style={{fontWeight:"bolder"}}>Client Info</p>
            <ul className="list-unstyled text-left px-4" style={{fontSize:"14px"}}>
                <li><strong>IP:</strong> {data.ip}</li>
                <li><strong>CITY:</strong> {data.city}</li>
                <li><strong>ISP:</strong> {data.isp}</li>
            </ul>
        </div>
    </div>
    }
    
    </>)
}