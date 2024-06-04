import { useAuth0 } from "@auth0/auth0-react";
import { CiWarning } from "react-icons/ci";

export default function Logout(){
    const { logout } = useAuth0();
    return (<>
    <center>
    <div className="container justify-content-center text-center" style={{maxWidth:"300px"}}>
        <CiWarning style={{fontSize:"100px", color:"white"}} />
        <h3 style={{color:"white"}}>Are Your Sure?</h3>
        <center>
        <div className="d-flex justify-content-center">
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} className="btn btn-danger mt-3 px-3">Logout</button>
        </div>
        </center>
    </div>
    </center>
    </>)
}