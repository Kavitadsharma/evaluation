const mongoose=require("mongoose")
const blacklistSchema=mongoose.Schema({
    token:{type:String,required:true}
})

const blacklist=mongoose.model("blacklist",blacklistSchema)



module.exports={
    blacklist
}