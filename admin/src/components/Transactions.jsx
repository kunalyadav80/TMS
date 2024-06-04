import { useEffect } from "react";
import axios from "axios";
import { useState } from "react";
import { TbFaceIdError } from "react-icons/tb";
import { Modal, Button } from 'react-bootstrap';

export default function Transactions(props) {
  const email = props.email;
  const token = props.token;
  const API_DOMAIN = props.API_DOMAIN;
  const [transactionData, setTransactionData] = useState("");
  const [showModal, setShowModal] = useState("hidden");
  const [modalData, setModalData] = useState({id:"",
                                              date:"",
                                              name:"",
                                              phone:"",
                                              email:"",
                                              amount:"",
                                              mode:"",
                                              url:""
                                              });

  useEffect(()=>{
    axios({
      method:"post",
      url:`${API_DOMAIN}/api/admin/transactions`,
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
      <div className="container mb-4" style={{width:"360px"}}>
      <table className="table table-striped table-dark text-center">
          <thead>
              <tr>
                <th scope="col" style={{minWidth:"105px"}}>YY-MM-DD</th>
                <th scope="col" style={{maxWidth:"100px"}}>Received</th>
                <th scope="col" style={{maxWidth:"80px"}}>From</th>
              </tr>
          </thead> 
          {Array.isArray(transactionData) && transactionData.map((item)=>{
                              return(
                                  <tbody style={{width:"375px"}} key={item.id}>
                                  <tr>
                                      <td scope="row" style={{minWidth:"105px"}}>{item.date}</td>
                                      <td style={{maxWidth:"100px"}}>₹{item.amount}</td>
                                      <td onClick={()=>{
                                        setModalData({
                                        id:item.id,
                                        date:item.date,
                                        mode:item.mode,
                                        amount:item.amount,
                                        name:item.name,
                                        phone:item.phone,
                                        email:item.email,
                                        url:item.url
                                      });
                                      setShowModal("visible");
                                      }} style={{maxWidth:"95px"}}><span className="text-warning">{item.name.split(" ")[0]}</span></td>
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

      {Array.isArray(transactionData) && transactionData.length != 0 && showModal === "visible" ? <>
                  <Modal className="d-flex justify-content-center align-items-center" centered show={showModal === "visible" ? true: false} onHide={()=>setShowModal("hidden")}>
                      <Modal.Header className="bg-dark text-white">
                        <Modal.Title>Received ₹{modalData.amount}</Modal.Title>
                      </Modal.Header>
                        <Modal.Body className="text-dark">
                          <ul className="list-unstyled">
                            <li><strong>ID:</strong> {modalData.id}</li>
                            <li><strong>DATE:</strong> {modalData.date}</li>
                            <li><strong>MODE:</strong> {modalData.mode}</li>
                            <li><strong>AMOUNT:</strong> ₹{modalData.amount}</li>
                            <li><strong>FROM:</strong> {modalData.name}</li>
                            <li><strong>PHONE:</strong> {modalData.phone}</li>
                            <li><strong>EMAIL:</strong> {modalData.email}</li>
                            <li><strong>INVOICE:</strong> <a style={{textDecoration:"none"}} href={modalData.url} target="_blank">Open Invoice</a> </li>
                          </ul>
                        </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={()=>{setShowModal("hidden")}}>
                          Close
                        </Button>
                      </Modal.Footer>
                </Modal>
      </> : <></> }
    </>
  );
}
