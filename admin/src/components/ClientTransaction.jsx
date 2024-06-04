import { useEffect } from "react";
import axios from "axios";
import { useState, useRef } from "react";
import { TbFaceIdError } from "react-icons/tb";
import { FaRegUserCircle } from "react-icons/fa";
import { MdAddToPhotos } from "react-icons/md";
import { FaBackspace } from "react-icons/fa";
import { Modal, Button } from 'react-bootstrap';


export default function ClientTransaction(props) {
  const client_name = props.client.name;
  const client_email = props.client.email;
  const client_phone = props.client.phone;

  const email = props.email;
  const token = props.token;
  const API_DOMAIN = props.API_DOMAIN;

  const [transactionData, setTransactionData] = useState("");
  const [specificTransaction, setSpecificTransaction] = useState();

  const [showForm, setShowForm] = useState("hidden");  // hidden & visible For Transaction Form
  const button = useRef();
  const date = useRef();
  const payment_mode = useRef();
  const amount = useRef();

  function handleUpdateTransaction(e){
    const button = e.target;
    button.disabled = true;
    const data = {
                  name:client_name,
                  email:client_email,
                  phone:client_phone,
                  id: specificTransaction.id,
                  date: date.current.value,
                  mode: payment_mode.current.value,
                  amount: amount.current.value
                };
      axios({
        method:'post',
        url:`${API_DOMAIN}/api/admin/updatetransaction`,
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            email:email,
            transaction:data
            }
    }).then(res=>{
        if (res.data.success === true){
            setShowForm("hidden");
         }
    }).catch((error)=>{
    });

  }

  function handleDeleteTransaction(e){
      const button = e.target;
      button.disabled = true;
      axios({
        method:'post',
        url:`${API_DOMAIN}/api/admin/deletetransaction`,
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            email:email,
            transaction:{id:specificTransaction.id}
            }
    }).then(res=>{
        if (res.data.success === true){
            setShowForm("hidden");
         }
    }).catch((error)=>{
    });

  }

  function handleAddTransaction(){
    const data = {
                date:date.current.value,
                mode:payment_mode.current.value,
                amount:amount.current.value
            }
    button.current.disabled = true;
    axios({
        method:'post',
        url:`${API_DOMAIN}/api/admin/create/transaction`,
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        data: {
            email:email,
            transaction:{
                        name:client_name,
                        phone:client_phone,
                        email:client_email,
                        date:String(data.date),
                        mode:String(data.mode),
                        amount:Number(data.amount)
                        }
            }
    }).then(res=>{
        if (res.data.success === true){
            
            setShowForm("hidden");
         }
    }).catch((error)=>{
        button.current.disabled = false;
        button.current.innerHTML = "Failed";
    });
  }


  useEffect(()=>{
    if (showForm === "hidden"){
        console.log("Called");
        axios({
          method:"post",
          url:`${API_DOMAIN}/api/admin/searchtransaction`,
          headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data:{email:email,user:{email:client_email}}
        }).then(res=>{
          res = res.data.data;
          setTransactionData(res);
        }).catch(error=>setTransactionData([]));
    }
  },[showForm])


  return (
    <>
    {/* Customer Details */}
    <div className="container text-left mb-4" style={{maxWidth:"300px"}}>
        <center>
        <h3 className="mb-4" style={{color:"orange"}}>Client Details</h3>
        </center>
        <center>
        <FaRegUserCircle className="mb-4" style={{fontSize:"100px"}} />
        <div className="block justify-content-center" style={{maxWidth:"300px"}}>
            <ul className="list-unstyled">
            <li>{client_name}</li>
            <li>{client_phone}</li>
            <li>{client_email}</li>  
            </ul>
            <div className="d-flex justify-content-center">
            {showForm === "hidden" ? <button onClick={()=>{setShowForm("visible")}} className="btn btn-warning mx-1"><MdAddToPhotos style={{fontSize:"20px"}} /> Transaction</button> : <></>}
            {showForm === "hidden" ? <button onClick={()=>{props.setActive("Clients")}} className="btn btn-danger mx-1"><FaBackspace style={{fontSize:"20px"}} /> Go Back</button> : <></>}
            </div>
        </div>
        </center>
    </div>
    <center><hr style={{maxWidth:"300px"}} /></center>






    {/* Transaction List */}
    { showForm === "hidden" ? <>
              <center>
                  <h3 className="mb-4" style={{color:"orange"}}>Transactions {Array.isArray(transactionData) ? <span>({transactionData.length})</span>:<></>}</h3>
              </center>
              { transactionData.length > 0 ?
                <div className="container mb-4" style={{width:"350px"}}>
                  <table className="table table-striped table-dark text-center">
                      <thead>
                          <tr>
                            <th scope="col" style={{minWidth:"105px"}}>YY-MM-DD</th>
                            <th scope="col" style={{maxWidth:"100px"}}>Received</th>
                            <th scope="col" style={{maxWidth:"70px"}}>Invoice</th>
                          </tr>
                      </thead>
                      {Array.isArray(transactionData) && transactionData.map((item)=>{
                              return(
                                  <tbody style={{width:"350px"}} key={item.id}>
                                  <tr>
                                      <td className="text-warning" onClick={()=>{
                                        setSpecificTransaction({id:item.id, date:item.date, mode:item.mode, amount:item.amount});
                                        setShowForm("transaction-update");
                                      }} scope="row" style={{minWidth:"105px"}}>{item.date}</td>
                                      <td style={{maxWidth:"100px"}}>₹{item.amount}</td>
                                      <td style={{maxWidth:"70px"}}><a className="text-warning" style={{textDecoration:"none"}} href={item.url} target="_blank">Open</a></td>
                                  </tr>
                                  </tbody>
                              )
                          })}
                      </table>
                </div> : <></> }

                { Array.isArray(transactionData) && transactionData.length === 0 ? 
                    <center> 
                      <TbFaceIdError style={{fontSize:"100px"}} /> <p style={{maxWidth:"200px", marginTop:"20px"}}>No Transactions Found.</p>
                    </center> : <></>
                }
                
                { ! Array.isArray(transactionData) && transactionData === "" ? 
                    <center>
                    <div style={{marginTop:"5vh"}} className="spinner-border text-warning" role="status">
                        <span className="sr-only"></span>
                    </div>
                    </center> : <></>
                } 
        
        </> : <></>
      }




      {/* Add Transaction Form */}
    {showForm === "visible" ? <>
        <div className="container mb-4" style={{maxWidth:"300px"}}>
            <center><h3 className="mb-4">Add Transaction</h3></center>
            <form onSubmit={(e)=>{e.preventDefault();handleAddTransaction()}} style={{maxWidth:"250px"}}>
                <input className="form-control bg-dark border-dark text-white mb-4" ref={date} type="date" placeholder="Date" required />
                <input className="form-control bg-dark border-dark text-white mb-4" ref={payment_mode} onInput={(e)=>e.target.value=String(e.target.value).toUpperCase()} type="text" placeholder="Payment Mode" required />
                <input className="form-control bg-dark border-dark text-white mb-4" ref={amount} type="number" placeholder="Amount ₹" required min="1" />
                <div className="d-flex justify-content-center">
                    <button type="submit" ref={button} className="btn btn-warning"><MdAddToPhotos style={{fontSize:"20px"}} /> Create</button>
                    <button className="btn btn-danger" style={{marginLeft:"10px"}} onClick={(e)=>setShowForm("hidden")}><FaBackspace style={{fontSize:"20px"}} /> Cancel</button>
                </div>
            </form>
        </div></>:<></>
    }


    {/* Update Transaction Form */}
    { showForm === "delete-modal" || showForm === "update-modal" || showForm === "transaction-update" ? 
        <>
        <div className="container mb-4" style={{maxWidth:"300px"}}>
            <center><h3 className="mb-4" style={{color:"orange"}}>Update Transaction</h3></center>
            <form onSubmit={(e)=>{e.preventDefault()}} style={{maxWidth:"250px"}}>
                <label className="mb-1">Date</label>
                <input className="form-control bg-dark border-dark text-white mb-4" ref={date} type="date" onChange={(e)=>{setSpecificTransaction({...specificTransaction,date:e.target.value})}} value={specificTransaction.date} placeholder="Date" required />
                <label className="mb-1">Payment Mode</label>
                <input className="form-control bg-dark border-dark text-white mb-4" ref={payment_mode} onChange={(e)=>{setSpecificTransaction({...specificTransaction,mode:e.target.value.toUpperCase()})}} value={specificTransaction.mode} type="text" placeholder="Payment Mode" required />
                <label className="mb-1">Amount (₹)</label>
                <input className="form-control bg-dark border-dark text-white mb-4" ref={amount} onChange={(e)=>{setSpecificTransaction({...specificTransaction,amount:Number(e.target.value)})}} value={specificTransaction.amount} type="number" placeholder="Amount ₹" required min="1" />
                <div className="d-flex justify-content-center">
                    <button type="submit" onClick={(e)=>setShowForm("update-modal")} ref={button} className="btn btn-warning">Update</button>
                    <button className="btn btn-danger" style={{marginLeft:"10px"}} onClick={(e)=>setShowForm("delete-modal")}>Delete</button>
                    <button className="btn btn-dark" style={{marginLeft:"10px"}} onClick={(e)=>setShowForm("hidden")}>Cancel</button>
                </div>
            </form>
        </div>
        {/* Modal For Update Confirmation */}
        { showForm === "update-modal" ? <>
                <Modal className="d-flex justify-content-center align-items-center" centered show={showForm === "update-modal" ? true: false} onHide={()=>setShowForm("transaction-update")}>
                      <Modal.Header className="bg-dark text-white">
                        <Modal.Title>Confirm Update</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="text-dark">Are you sure you want to update this transaction?</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={()=>{setShowForm("transaction-update")}}>
                          Cancel
                        </Button>
                        <Button variant="danger" onClick={(e)=>{handleUpdateTransaction(e)}}>
                          Confirm
                        </Button>
                      </Modal.Footer>
                </Modal>
        
        </> : <></> 
        }
        {/* Modal For Delete Confirmation */}
        { showForm === "delete-modal" ? <>
                <Modal className="d-flex justify-content-center align-items-center" centered show={showForm === "delete-modal" ? true: false} onHide={()=>setShowForm("transaction-update")}>
                      <Modal.Header className="bg-dark text-white">
                        <Modal.Title>Confirm Deletion</Modal.Title>
                      </Modal.Header>
                      <Modal.Body className="text-dark">Are you sure you want to delete this transaction?</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={()=>{setShowForm("transaction-update")}}>
                          Cancel
                        </Button>
                        <Button variant="danger" onClick={(e)=>{handleDeleteTransaction(e)}}>
                          Confirm
                        </Button>
                      </Modal.Footer>
                </Modal>
        
        </> : <></> 
        }


        </>:<></>
    }



    </>
  );
}
