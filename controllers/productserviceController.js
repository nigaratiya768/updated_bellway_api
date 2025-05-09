const Product_Service = require("../models/productserviceModel");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
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

//REACT_APP_API_URL=https://testbellwayapi.paassionis.in/api/v1

// });
exports.Add_Product_Service = async (req, res, next) => {
  try {
    console.log("addproductservice", req.file);
    //const file = req.file;
    let file_path = "";
    if (req.file) {
      file_path = req.file.filename;
    }
    const product_service_data = {
      payment: req.body.payment,
      product_service_name: req.body.product_service_name,
      set_up_fee: req.body.set_up_fee,
      file_path: file_path,
    };

    // Insert the product/service into the database
    const product_service = await Product_Service.create(product_service_data);

    // Return a success response
    res.status(201).json({
      success: true,
      message: "Product & Service has been added successfully",
      product_service,
    });
  } catch (error) {
    console.log("error in Add_Product_Service", error);
  }
};

//// Delete Product & Service

exports.Delete_Product_service = catchAsyncErrors(async (req, res, next) => {
  const product_service = await Product_Service.findById(req.params.id);

  if (!product_service) {
    return next(new ErrorHander("Product Service Not Found", 404));
  }
  await product_service.deleteOne();
  res.status(200).json({
    success: true,
    message: "Product & Service  Has Been Delete Successfully",
    product_service,
  });
});

//// Get All Product & Service

exports.getAllProductService = catchAsyncErrors(async (req, res, next) => {
  const product_service = await Product_Service.find();
  res.status(201).json({
    success: true,
    product_service,
  });
});

/// edit product & service

exports.updateProductService = async (req, res, next) => {
  try {
    console.log("req.body", req.body, "req.file", req.file);
    let product_service = await Product_Service.findById(req.params.id);
    if (!product_service) {
      return next(new ErrorHander(" product_service is not Found ", 404));
    }
    // product_service = await Product_Service.findByIdAndUpdate(
    //   req.params.id,
    //   req.body,
    //   {
    //     new: true,
    //     runValidators: true,
    //     useFindAndModify: false,
    //   }
    // );

    if (req.file) {
      product_service.file_path = req.file.filename;
    }
    if (req.body.product_service_name) {
      product_service.product_service_name = req.body.product_service_name;
    }
    if (req.body.set_up_fee) {
      product_service.set_up_fee = req.body.set_up_fee;
    }
    if (req.body.payment) {
      product_service.payment = req.body.payment;
    }
    await product_service.save();
    res.status(200).json({
      success: true,
      message: "Product Update Successfully",
      product_service,
    });
  } catch (error) {
    console.log("error in updateProductService", error);
    return res.status(500).json({ msg: "server error" });
  }
};
