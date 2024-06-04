import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Payment from "./components/Payment";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import Loading from "./components/Loading";
import UserSetup from "./components/UserSetup";
import UserUpdate from "./components/UserUpdate";
import ServerError from "./components/ServerError";
import ClientList from "./components/ClientList";
import ClientTransaction from "./components/ClientTransaction";
import Transactions from "./components/Transactions";
import "popper.js/dist/umd/popper";
import "bootstrap/dist/js/bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import axios from "axios";

function loaded(home_links,active,setActive,user,JWToken,API_DOMAIN,PAY_API,clientData, setClientData) {
  return (<>
    <Navbar links={home_links} active={active} setActive={setActive}></Navbar>
    {active == "Home" ? <Home setActive={setActive} email={user.email} token={JWToken} API_DOMAIN={API_DOMAIN} />: <></>}
    {active == "Logout" ? <Logout />: <></>}
    {active == "Profile" ? <Profile email={user.email} pic={user.picture} token={JWToken} API_DOMAIN={API_DOMAIN} setActive={setActive}/>: <></>}
    {active == "Payment" ? <Payment email={user.email} token={JWToken} API_DOMAIN={API_DOMAIN} PAY_API={PAY_API} />: <></>}
    {active == "Clients" ? <ClientList clientData={clientData} setClientData={setClientData} setActive={setActive} email={user.email} token={JWToken} API_DOMAIN={API_DOMAIN} /> : <></>}
    {active === "ClientTransaction" ? <ClientTransaction setActive={setActive} client={clientData} email={user.email} token={JWToken} API_DOMAIN={API_DOMAIN} /> : <></>}
    {active == "Transactions" ? <Transactions setActive={setActive} email={user.email} token={JWToken} API_DOMAIN={API_DOMAIN} /> : <></>}
  </>)
}

function App(props) {
  const home_links = ["Home","Clients", "Transactions","Logout"];
  const [active, setActive] = useState("Loading");
  const { isAuthenticated, loginWithRedirect, isLoading, user, getIdTokenClaims } = useAuth0();
  const [JWToken, setJWToken] = useState();
  const [clientData, setClientData] = useState();

  const DEVELOPMENT_MODE = props.DEV_MODE;
    let API_DOMAIN;
    let PAY_API;
    if (DEVELOPMENT_MODE==true){
      API_DOMAIN = "http://127.0.0.1:3000";
      PAY_API = "http://127.0.0.1:8787"
    }
    else {
      API_DOMAIN = "https://YOUR-NODE-EXPRESS-API-DOMAIN.com";
      PAY_API = "https://YOUR-CLOUDFLARE-WORKER-DOMAIN.com"
    }

  useEffect(() => {
      if (! isLoading && isAuthenticated ){
            const data = {email: user.email}; 
            try {
              // Getting Authorization Token
              const token = getIdTokenClaims().then(token=>{
                token = token.__raw;
                
                setJWToken(token);
                
                axios({
                  method: 'post',
                  url: `${API_DOMAIN}/api/admin/check/userstatus`,
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  },
                  data: data,
                }).then((res) => {
                  res = res.data;
                  
                  if (res.hasOwnProperty("data")) {
                    if (res.data == false) {
                      setActive("UserSetup");
                    }
                    else if (res.hasOwnProperty("error")) {
                      setActive("ServerError");
                    }
                    else if (res.data == true){
                      setActive("Home");
                    }
                  }
                }).catch((error) => {setActive("ServerError")});
              });

              
            
            } catch (error) {
              setActive("ServerError");
          }
        }
      else if (! isLoading && ! isAuthenticated) {
          loginWithRedirect();
        }}, [isLoading, isAuthenticated]);

  return (
    <>
    {active == "Loading" ? <Loading/> : <></>}
    {active == "UserSetup" ? <UserSetup setActive={setActive} API_DOMAIN={API_DOMAIN} email={user.email} token={JWToken} /> : <></>}
    {active == "UserUpdate" ? <UserUpdate setActive={setActive} API_DOMAIN={API_DOMAIN} email={user.email} token={JWToken} /> : <></>}
    {active == "ServerError" ? <ServerError /> : <></>}
    {active != "Loading" && active != "UserSetup" && active != "ServerError" && active != "UserUpdate" ? loaded(home_links,active,setActive,user,JWToken,API_DOMAIN,PAY_API,clientData,setClientData) : <></>}
    
    </>
  )
}

export default App
