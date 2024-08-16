const COOKIE_EXPIRE=50;
 //create token and save in cookie

 const sendToken=(agent,statusCode,res)=>{ 
    const token =agent.getJWTToken();
 
    /// option for coockie
    const options ={
        expires:new Date(
            Date.now() + COOKIE_EXPIRE * 24 * 60* 60 * 1000
        ),
        httpOnly:true,
    };

   //console.log(options)
    res.status(statusCode).cookie('token',token,options).json({ 
        success:true,
        message:"Login Successfully",     
         agent,
         
         token,  
    });
};

module.exports= sendToken;   