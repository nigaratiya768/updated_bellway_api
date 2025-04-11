const express=require('express');
const multer = require('multer');
const  excel=express();
const path = require('path');
const fs = require('fs');
const { Add_Product_Service, Delete_Product_service, getAllProductService, updateProductService } = require('../controllers/productserviceController');
const destinationPath = path.join(__dirname, '../public', 'uploads');
if (!fs.existsSync(destinationPath)) {
  fs.mkdirSync(destinationPath, { recursive: true });
}
excel.use('../public',express.static(path.resolve(__dirname,'../public')));
var storage= multer.diskStorage({
    destination:(req,file,cb)=>{
       cb(null, destinationPath);  
    },
    filename:(req,file,cb)=>{
         cb(null, Date.now() + '-' + file.originalname);
    }
});
var upload = multer({ storage: storage });

const router=express.Router();


  // router.route("/add_product_service").post(Add_Product_Service);
  router.route("/add_product_service").post(upload.single('file_path'), Add_Product_Service);
  router.route("/delete_product_service/:id").delete(Delete_Product_service);
  router.route("/all_product_service").get(getAllProductService);  
  router.route("/update_product_service/:id").put(updateProductService);    


     
      


  module.exports=router; 