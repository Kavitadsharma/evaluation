
const jwt=require("jsonwebtoken")
const {blacklist}=require("../model/blacklistmodel")
const fetch=(...args)=>import("node-fetch").then(({default:fetch})=>fetch(...args))
const auth=async(req,res,next)=>{
    //verify access token
    //check if it is not blacklisted
    //then call next
    const {pscaccesstoken}=req.cookies
    const istokenblacklisted=await blacklist.findOne({token:pscaccesstoken})
    if(istokenblacklisted){
        return res.status(400).send({message:"please login...."})
    }
    jwt.verify(
        pscaccesstoken,
        "jwtsecretkeyfromenvfile",
        async(err,decoded)=>{
            if(err){
                if(err.message==="jwt expired"){
                    const newaccesstoken=await fetch("http://localhost:8080/auth/refresh-token",{
                        headers:{
                            "content-type":'application/json',
                            Authorization:req.cookies.pscrefreshtoken,
                        }
                    }).then((res)=>res.json())
                    res.cookie("pscaccesstoken",newaccesstoken,{maxAge:2000*60})
                    next()
                }
            }else{
                console.log(decoded)
                next()
            }
        }
    )
}

module.exports={auth}