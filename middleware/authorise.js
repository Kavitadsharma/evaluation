const express=require("express")

const authorise=(req,res,next)=>{
    if(req.url==="/blog/update/:userId"&& req.method==="put"&&req.role==="user"){
        next()
    }
    else if(req.url==="/blog/delete/:userId"&& req.method==="delete"&&(req.role==="user"&&req.role==="moderator")){
        next()
}
}




module.exports={
    authorise
}