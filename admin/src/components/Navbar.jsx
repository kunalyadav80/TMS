export default function Navbar(props){

    return (<>
    <div className="d-flex justify-content-center pt-3" style={{backgroundColor:"black", color:"white", fontWeight:"bolder"}}><h2>BILLING <span style={{color:"orange"}}>PORTAL</span></h2></div>
    <div className="d-flex justify-content-center text-center"><pre className="text-gray">ADMIN DASHBOARD</pre></div>
    <center><hr className="border border-white" style={{margin:"0px",width:"300px"}} /></center>
    <nav className="d-flex justify-content-center" style={{backgroundColor:"black", margin:"0px",height:"29px"}}>
    <ul className="nav d-flex pb-3">
        {/* Looping Through Array of Nav Items */}
        {props.links.map((item)=>{
            if (item===props.active){
              return (<p key={item} className="btn text-warning" onClick={()=>{props.setActive(item)}} style={{borderRadius:"20px", fontWeight:"bold"}}>{item}</p>)}
            else {
              return (<p key={item} className="btn text-white" onClick={()=>{props.setActive(item)}}>{item}</p>)
            }
        })}
    </ul>
  </nav>
  <center><hr className="border border-white" style={{marginBottom:"30px",width:"300px"}} /></center>
    </>)
}