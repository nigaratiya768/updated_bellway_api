
 const Product_Service=require('../models/productserviceModel');

 const catchAsyncErrors=require('../middleware/catchAsyncErrors');
 const ErrorHander = require("../utils/errorhander");
 const sendToken = require("../utils/jwtToken");


 /// creat Prroduct & Service
    //  exports.Add_Product_Service = catchAsyncErrors(async (req, res, next) => {
      
    
    //   const product_service = await Product_Service.create(req.body);
    
    //   res.status(201).json({
    //     success: true,
    //     message:"Product & Service  Has Been Added Successfully",
    //     product_service,
    //   });   
    
     
    // });
    exports.Add_Product_Service = catchAsyncErrors(async (req, res, next) => {
      
      const file=req.file;
    
     
      const product_service_data = {
        payment: req.body.payment,
        product_service_name: req.body.product_service_name,
        set_up_fee: req.body.set_up_fee,
        file_path: file.path,
      };
    
      // Insert the product/service into the database
      const product_service = await Product_Service.create(product_service_data);
    
      // Return a success response
      res.status(201).json({
        success: true,
        message: "Product & Service has been added successfully",
        product_service,
      });
    });
    
    //// Delete Product & Service

    exports.Delete_Product_service=catchAsyncErrors(async (req,res,next)=>{
              const product_service=await  Product_Service.findById(req.params.id);

              if(!product_service){
               return next(new ErrorHander('Product Service Not Found',404));
              }
              await product_service.deleteOne();
              res.status(200).json({
               success:true,
               message:"Product & Service  Has Been Delete Successfully",
               product_service,
              })
  }); 

   //// Get All Product & Service

   exports.getAllProductService=catchAsyncErrors(async(req,res,next)=>{
           const product_service=await Product_Service.find();
           res.status(201).json({
            success: true,
            product_service, 
           });      
   });

   /// edit product & service

   exports.updateProductService=catchAsyncErrors(async(req,res,next)=>{
      let product_service=await Product_Service.findById(req.params.id);
          if(!product_service){
            return next(new ErrorHander(" product_service is not Found ",404));
          }
          product_service=await Product_Service.findByIdAndUpdate(req.params.id,req.body,{
                 new:true,
                 runValidators:true,
                 useFindAndModify:false,
          });

          res.status(200).json({    
            success: true,
            message:'Product Update Successfully',
            product_service,  
          });


   })
      