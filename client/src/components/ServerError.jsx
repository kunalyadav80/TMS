import { RiSignalWifiErrorFill } from "react-icons/ri";

export default function ServerError(){
    return <>
    <center>
    <div style={{maxWidth:"300px",marginTop:"40vh"}}>
    <RiSignalWifiErrorFill style={{fontSize:"100px"}} />
    <h1>Error 404</h1>
    <p>Server Offline</p>
    </div>
    </center>
    </>
}