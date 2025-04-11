const mongoose=require('mongoose');
const dotenv=require('dotenv');
  


dotenv.config({path:"./config/config.env"});
const connectDatabase =()=>{
console.log("--",process.env)   
 mongoose.connect(process.env.DB_URI,{
    //  useNewUrlParser:true,   
    //  useUnifiedTopology:true,   
     serverSelectionTimeoutMS: 30000,
   }).then((data)=>{
       console.log(`Mongoosedb connected with server :${data.connection.host}`);
     }).catch((err)=>{  
       console.log('not connect',err);
     })
 }      

 module.exports= connectDatabase; 