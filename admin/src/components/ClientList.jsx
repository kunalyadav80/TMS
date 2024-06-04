import axios from "axios"
import { useEffect } from "react";
import { useState, useRef } from "react";
import { TbFaceIdError } from "react-icons/tb";

export default function ClientList(props){
    const setClientData = props.setClientData;
    const setActive = props.setActive;
    const email = props.email;
    const token = props.token;
    const API_DOMAIN = props.API_DOMAIN;
    const [userArray, setUserArray] = useState("");
    const [title, setTitle] = useState("Total Client:");
    const button = useRef();
    const phone = useRef();
    let count = 0;

    // Handles Search Form
    function handleForm(e){
        e.preventDefault();
        button.current.disabled = true;
        const backup_innerHTML = button.current.innerHTML;
        button.current.innerHTML = '<span class="spinner-border spinner-border-sm" style="color:black;" role="status"></span>';
        axios({
            method:'post',
            url:`${API_DOMAIN}/api/admin/searchuser`,
            headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
            data: {email:email,
                   user:{phone:phone.current.value}}
        }).then(res=>{
            const userList = res.data.data;
            setUserArray(userList);
            button.current.innerHTML = backup_innerHTML;
            button.current.disabled = false;
            setTitle("Search Results:")
        }).catch((error)=>{
            setUserArray([]);
            button.current.innerHTML = backup_innerHTML;
            button.current.disabled = false;
        });
    }

    function handleClientDetails(client_data){
        setClientData(client_data);
        setActive("ClientTransaction");
    }

    // API For Getting All Users
    useEffect(()=>{
        axios({
            method:'post',
            url:`${API_DOMAIN}/api/admin/users`,
            headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
            data: {email:email}
        }).then(res=>{
            const userList = res.data.data;
            setUserArray(userList);
        }).catch((error)=>{
            console.log(error);
        });
    },[]);


    return(
    <>
    <div className="container justify-content-center text-center" style={{maxWidth:"340px"}}>
        <center>
        <form onSubmit={handleForm} className="d-flex mb-5">
            <input className="form-control" type="tel" placeholder="Mobile Number" ref={phone} pattern="[0-9]{10}" required />
            <button className="btn btn-warning mx-2" style={{minWidth:"80px"}} ref={button} type="submit">Search</button>
        </form>
        </center>
    </div>
    { userArray.length > 0 ?
      <div className="container" style={{maxWidth:"340px"}}>
        <center>
            <p>{title} {userArray.length}</p>
        </center>
        <div className="d-flex" style={{maxWidth:"340px"}}>
            <table className="table table-striped table-dark">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" style={{minWidth:"140px"}}>Full Name</th>
                  <th scope="col">Contact</th>
                </tr>
              </thead>
              {Array.isArray(userArray) && userArray.map((item)=>{
                count+=1;
                return(
                    <tbody key={item.email}>
                    <tr>
                        <th scope="row">{count}</th>
                        <td onClick={()=>handleClientDetails(
                            {
                            name:item.name,
                            phone:item.phone,
                            email:item.email
                            })} style={{minWidth:"140px"}}> <span className="text-warning">{item.name.toUpperCase()}</span></td>
                        <td>{item.phone}</td>
                    </tr>
                    </tbody>
                )
              })}
            </table>
            </div>
      </div> : <></> }

      {Array.isArray(userArray) && userArray.length === 0 ? <center> <TbFaceIdError style={{fontSize:"100px"}} /> <p style={{maxWidth:"200px", marginTop:"20px"}}>No Client Found.</p></center> : <></>}
    
      {! Array.isArray(userArray) && userArray === "" ? <center>
        <div style={{marginTop:"5vh"}} className="spinner-border text-warning" role="status">
            <span className="sr-only"></span>
        </div>
        </center> : <></>}
    </>)
}