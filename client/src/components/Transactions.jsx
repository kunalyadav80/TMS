import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { TbFaceIdError } from "react-icons/tb";

export default function Transactions(props) {
  const email = props.email;
  const token = props.token;
  const API_DOMAIN = props.API_DOMAIN;
  const [transactionData, setTransactionData] = useState("");

  useEffect(()=>{
    axios({
      method:"post",
      url:`${API_DOMAIN}/api/get/transactions`,
      headers:{
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data:{email:email}
    }).then(res=>{
      res = res.data.data;
      setTransactionData(res);
    }).catch(error=>setTransactionData([]));
  },[])


  return (
    <>
    { transactionData.length > 0 ?
      <div className="container mb-4" style={{width:"350px"}}>
      <table className="table table-striped table-dark text-center">
          <thead>
              <tr>
                <th scope="col" style={{minWidth:"105px"}}>YY-MM-DD</th>
                <th scope="col" style={{maxWidth:"100px"}}>Paid</th>
                <th scope="col" style={{maxWidth:"70px"}}>Invoice</th>
              </tr>
          </thead> 
          {Array.isArray(transactionData) && transactionData.map((item)=>{
                              return(
                                  <tbody style={{width:"350px"}} key={item.id}>
                                  <tr>
                                      <td scope="row" style={{minWidth:"105px"}}>{item.date}</td>
                                      <td style={{maxWidth:"100px"}}>₹{item.amount}</td>
                                      <td style={{maxWidth:"70px"}}><a className="text-warning" style={{textDecoration:"none"}} href={item.url} target="_blank">Open</a></td>
                                  </tr>
                                  </tbody>
                              )
                          })}
                      </table>
                </div>: <></> }

      {Array.isArray(transactionData) && transactionData.length === 0 ? <center> <TbFaceIdError style={{fontSize:"100px"}} /> <p style={{maxWidth:"200px", marginTop:"20px"}}>No Transactions Found.</p></center> : <></>}
    
      {! Array.isArray(transactionData) && transactionData === "" ? <center>
        <div style={{marginTop:"5vh"}} className="spinner-border text-warning" role="status">
            <span className="sr-only"></span>
        </div>
        </center> : <></>}
    </>
  );
}
