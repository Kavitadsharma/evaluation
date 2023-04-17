const express=require("express")
const cookieParser=require("cookie-parser")
const { connection } = require("./config/db");
const {UserRouter}=require("./route/userroute")
const {auth}=require("./middleware/auth");
const {blog} = require("./model/blogmodel");
const { authorise } = require("./middleware/authorise");
require("dotenv").config()

const app=express()

app.use(express.json())

app.use("/auth",UserRouter)

app.get("/",(req,res)=>{
res.send("evaluation")
})

app.get("/blog",async(res,req)=>{
    const token=req.headersSent.authorization
    const decoded=jwt.verify(token,"masai")
    try{
        if(decoded){
            const blogs=await blog.find({"userid":decoded.userId})
            res.status(200).send(blogs)
        }
    }catch(err){
        res.status(400).send({message:err.message})
    }
})
app.post("/blog/create",async(req,res)=>{
    try{
        const nblog=new blog(req.body)
        await nblog.save()
        res.status(400).send({message:"blog created"})
    }catch(error){
        res.status(400).send({msg:error.msg})
    }
})

app.delete("/blog/delete/:userId",auth,authorise,async(req,res)=>{
    const role=req.role
const userId=req.params.userId
try{
    const query=await blog.findByIdAndDelete({_id:userId})
    res.status(200).send({message:"blog deleted"})
}catch(error){
    res.status(400).send({message:error.message})
}
})
app.put("/blog/update/:userId",auth,authorise,async(req,res)=>{
    const role=req.role
const userId=req.params.userId
const payload=req.body
try{
    const query=await blog.findByIdAndUpdate({_id:userId},payload)
    res.status(200).send({message:"updated"})
}catch(error){
    res.status(400).send({message:error.message})
}
})






app.listen(8080,async()=>{
    try{
        await connection
        console.log("connected to mongo")
    }catch(err){
        console.log(err.message)
    }
    console.log("listening to server 8080")
})