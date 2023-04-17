const {Router}=require("express")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcrypt")
const {User}=require("../model/usermodel")
const {blacklist}=require("../model/blacklistmodel")

const UserRouter=Router()


//signup
UserRouter.post("/signup",async(req,res)=>{
    try{
        const{name,email,password,role}=req.body
        const isUserPresent=await User.findOne({email})
        if(isUserPresent){
            return res.status(400).send({"message":"already signup"})
        }
        const hashedpassword=bcrypt.hashSync(password,8)
        const newUser=new User({...req.body,password:hashedpassword})
        await newUser.save()
        res.send({"message":"signup successful"})

    }catch(error){
        res.status(500).send({"message":error.message})
    }
})

//login
UserRouter.post("/login",async(req,res)=>{
    try{
        const{email,password}=req.body
        const isUserPresent=await User.findOne({email}) 
        if(!isUserPresent){
            return res.status(400).send({message:"not a user,please signup"})
        }
        const isPasswordCorrect=bcrypt.compareSync(password,isUserPresent.password)
        if(!isPasswordCorrect){
            return res.status(400).send({message:"wrong credential"})

        }
        //generate token
        //accesstoken and refresh token
        const accesstoken=jwt.sign({email,role:isUserPresent.role},"jwtsecretkeyfromenvfile",{expireIn:"1m"})
        const refreshtoken=jwt.sign({email,role:isUserPresent.role},"jwtsecretkeyfromenvfile",{expireIn:"3m"})

        //store these tokens
        //cookies set a cookie
        res.cookie("pscAccessToken",accesstoken,{maxAge:2000*60})
        res.cookie("pscrefreshtoken",refreshtoken,{maxAge:1000*60*5})
        res.send({message:"loginsuceessful"})
    }catch(error){
        res.status(500).send({message:"error.message"})
    }
})

//logout
UserRouter.get("/logout",async(res,req)=>{
    try{
        //store that user token in the blacklisted database
        //token cookies
        const{pscaccessstoken,pscrefreshtoken}=req.cookie
        const blacklistaccesstoken=new blacklist(pscaccessstoken)
        const blacklistrefreshtoken=new blacklist(pscrefreshtoken)
        await blacklistaccesstoken.save()
        await blacklistrefreshtoken.save()
        res.send({message:"logout successfull"})
    }catch(error){
        res.status(500).send({message:error.message})
    }
})

//refresh token
UserRouter.get("/refresh-token",async(req,res)=>{
    try{
        //get refresh token from cookies
        //check if its is valid
        //generate a new access token
        //check if this is blcklisted or not
        const pscrefreshtoken=req.cookies.pscrefreshtoken||req?.headers?.authorization
        const istokenblacklisted=await blacklist.find({token:pscrefreshtoken})
        if(istokenblacklisted){
            return res.status(400).send({message:"please login"})
        }
        const istokenvalid=jwt.verify(
            pscrefreshtoken,
            "jwtsecretkeyfromenvfileforrefresh"
        )
        if(!istokenvalid)
        return res.status(400).send({message:"please login again!"})
        const newaccesstoken=jwt.sign({
            email:istokenvalid.email,role:istokenvalid.role},"jwtsecretkeyfromenvfile",{expiresIn:"1m"})

            //store on cookies again
            res.cookie("pscaccesstoken",newaccesstoken,{maxAge:1000*60})
            res.send({"message":"Token generated"})
      
    }catch(error){
        res.status(500).send({msg:error.msg})
    }
})


module.exports={
    UserRouter
}