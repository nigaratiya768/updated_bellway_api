const express=require('express');

const { LeadSourceReport,GetProductReportDateWise,
    EmployeesReportDetail,EmployeesReportDetailByFilter,EmployeesReportDetailByFilter1,EmployeesReportGroupDetail } = require('../controllers/allReportController');

const router=express.Router();
  
router.route("/LeadSourceReport").post(LeadSourceReport); 
router.route("/GetProductReportDateWise").post(GetProductReportDateWise); 
router.route("/EmployeesReportDetail").post(EmployeesReportDetail); 
router.route("/EmployeesReportGroupDetail").post(EmployeesReportGroupDetail); 
router.route("/EmployeesReportDetailByFilter").post(EmployeesReportDetailByFilter); 
router.route("/EmployeesReportDetailByFilter1").post(EmployeesReportDetailByFilter1); 
 
module.exports=router;     