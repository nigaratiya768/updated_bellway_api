const Lead_Source = require('../models/leadsourceModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHander = require("../utils/errorhander");
const Lead = require('../models/leadModel');
const Product = require('../models/productserviceModel');
const Agent = require('../models/agentModel');
const { ObjectId } = require('mongoose').Types;


/////// leadsource report 
exports.LeadSourceReport = catchAsyncErrors(async (req, res, next) => {
  const { leadsource_id, start_date, end_date } = req.body;
  if (!leadsource_id) {
    return next(new ErrorHander("Lead source is required", 400));
  }


  // Parse start_date and end_date into Date objects if provided
  const startDateObj = start_date ? new Date(start_date) : null;
  const endDateObj = end_date ? new Date(end_date) : null;

  const query = {
    lead_source: leadsource_id,
  };

  if (startDateObj && !isNaN(startDateObj)) {
    query.created = {
      $gte: startDateObj,
    };
  }

  if (endDateObj && !isNaN(endDateObj)) {
    // If query.created already exists, add $lte to it, otherwise, create a new object
    query.created = query.created || {};
    query.created.$lte = endDateObj;
  }

  const leadSource = await Lead.find(query).select("full_name lead_cost").maxTimeMS(30000);
  if (!leadSource || leadSource.length === 0) {
    return next(new ErrorHander("No Data Found Now", 404));
  }
  let total = 0;
  leadSource.map((hhhhh) => {
    if (hhhhh?.lead_cost) {
      total += parseInt(hhhhh.lead_cost);
    }

  })

  let addd = {
    full_name: "Total",
    lead_cost: total
  }
  await leadSource.push(addd)



  res.status(201).json({
    success: true,
    message: 'Lead Source Get Successfully',
    leadSource,
  });


})


//////// Product And Service Report By Default Graph

exports.LeadProductServiceOverviewApi = catchAsyncErrors(async (req, res, next) => {
  try {
    const product = await Product.find();

    const product1_id = product.map((product1) => product1._id);
    const product_name = product.map((product2) => product2.product_service_name);

    const product_countPromises = product1_id.map(async (product1_id1) => {
      const lead = await Lead.find({ service: product1_id1 });
      const lead_length = lead.length;

      return lead_length;
    });

    const product_count = await Promise.all(product_countPromises);

    res.status(201).json({
      success: true,
      message: "Successfully Leads Source Overview",
      product_count,
      product_name,
      product1_id,
    });
  } catch (error) {
    // Handle errors appropriately
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


//////// Product And Service Report Date Wise Filter in Table

exports.GetProductReportDateWise = catchAsyncErrors(async (req, res, next) => {
  const { product_service_id, start_date, end_date } = req.body;
  if (!product_service_id) {
    return next(new ErrorHander("Product Service is required", 400));
  }
  const startDateObj = start_date ? new Date(start_date) : null;
  const endDateObj = end_date ? new Date(end_date) : null;

  const query = {
    service: product_service_id,
  };

  if (startDateObj && !isNaN(startDateObj)) {
    query.created = {
      $gte: startDateObj,
    };
  }

  if (endDateObj && !isNaN(endDateObj)) {
    // If query.created already exists, add $lte to it, otherwise, create a new object
    query.created = query.created || {};
    query.created.$lte = endDateObj;
  }

  const leadSource = await Lead.find(query).select("full_name followup_won_amount").maxTimeMS(30000);
  if (!leadSource || leadSource.length === 0) {
    return next(new ErrorHander("No Data Found Now", 404));
  }
  let total = 0;
  leadSource.map((hhhhh) => {
    if (hhhhh?.followup_won_amount) {
      total += parseInt(hhhhh.followup_won_amount);
    }

  })

  let addd = {
    full_name: "Total",
    followup_won_amount: total
  }
  await leadSource.push(addd)



  res.status(201).json({
    success: true,
    message: 'Lead Source Get Successfully',
    leadSource,
  });


});

///////  Employees Report 
exports.EmployeesReportDetail = catchAsyncErrors(async (req, res, next) => {
  try {
    let name = [];
    let value = [];
    let agents;
    if (req.body.assign_to_agent) {
      agents = await Agent.find({ role: 'user', assigntl: req.body.assign_to_agent });
    } else {
      agents = await Agent.find({ role: 'user' });
    }

    for (const agent of agents) {
      let totalAmount = 0;
      const leads = await Lead.find({ assign_to_agent: agent._id });

      leads.forEach((lead) => {
        totalAmount += lead.followup_won_amount || 0;
      });

      name.push(agent.agent_name);
      value.push(totalAmount);
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved employees report details",
      name,
      value,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}); 

exports.EmployeesReportGroupDetail = catchAsyncErrors(async (req, res, next) => {
  try {
    let name = [];
    let value = [];
    let agents;

    // Step 1: Retrieve 'user' agents based on assign_to_agent or fetch all users
    if (req.body.assign_to_agent) {
      agents = await Agent.find({ role: 'user', assigntl: req.body.assign_to_agent });
    } else {
      agents = await Agent.find({ role: 'user' });
    }

    // Process each 'user' agent
    for (const agent of agents) {
      let totalAmount = 0;
      const leads = await Lead.find({ assign_to_agent: agent._id });

      leads.forEach((lead) => {
        totalAmount += lead.followup_won_amount || 0;
      });

      name.push(agent.agent_name);
      value.push(totalAmount);
    }

    // Step 2: Find TeamLeaders and their associated 'user' agents
    const teamLeaders = await Agent.find({ role: 'TeamLeader', assigntl: req.body.assign_to_agent });

    for (const teamLeader of teamLeaders) {
      let teamLeaderAmount = 0;

      // Find leads assigned to this team leader
      const teamLeaderLeads = await Lead.find({ assign_to_agent: teamLeader._id });
      teamLeaderLeads.forEach((lead) => {
        teamLeaderAmount += lead.followup_won_amount || 0;
      });

      // Push TeamLeader's name and total lead amount
      name.push(teamLeader.agent_name);
      value.push(teamLeaderAmount);

      // Step 3: Find user agents assigned under this TeamLeader
      const assignedUsers = await Agent.find({ role: 'user', assigntl: teamLeader._id });

      for (const user of assignedUsers) {
        let userAmount = 0;

        // Find leads assigned to this user agent
        const userLeads = await Lead.find({ assign_to_agent: user._id });
        userLeads.forEach((lead) => {
          userAmount += lead.followup_won_amount || 0;
        });

        // Push user's name and total lead amount under the TeamLeader
        name.push(user.agent_name);
        value.push(userAmount);
      }
    }

    // Step 4: Return the aggregated result
    res.status(200).json({
      success: true,
      message: "Successfully retrieved employees report details",
      name,
      value,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});




/////////  Employees report By Filter
exports.EmployeesReportDetailByFilter1 = catchAsyncErrors(async (req, res, next) => {
  const { agent, service, status, lead_source, startDate, endDate ,role,user_id } = req.body;

  let total = 0;
  let data = [];
  
  const matchConditions = {};
  if (agent) matchConditions.assign_to_agent = new ObjectId(agent);
  if (service) matchConditions.service = new ObjectId(service);
  if (status) matchConditions.status = new ObjectId(status);
  if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
  if (startDate && endDate) {
    matchConditions.followup_date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const lead = await Lead.aggregate([
    { $match: matchConditions },
    { $sort: { followup_date: 1 } }
  ]);
   const lead_length=await lead.length;
  const wonLeadCount = await Lead.aggregate([
    { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
    { $count: "count" } 
  ]);

  const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0; // Handle division by zero

  lead.forEach((lead1) => {
    total += parseInt(lead1.followup_won_amount) || 0;
  });
 data.push({ Total: lead_length, Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0, Ratio: ratio.toFixed(2) + '%', Amount: total });

  res.status(200).json({
    success: true,
    message: "Successfully fetched data",
    lead: lead,
    data: data,
  });
});

/////////  Employees report By Filter
exports.EmployeesReportDetailByFilter = catchAsyncErrors(async (req, res, next) => {
  const { agent, service, status, lead_source, startDate, endDate ,role,user_id } = req.body;
    if(role==='admin'){
      let total = 0;
      let data = [];
      
      const matchConditions = {};
      if (agent) matchConditions.assign_to_agent = new ObjectId(agent);
      if (service) matchConditions.service = new ObjectId(service);
      if (status) matchConditions.status = new ObjectId(status);
      if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
      if (startDate && endDate) {
        matchConditions.followup_date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
    
      const lead = await Lead.aggregate([
        { $match: matchConditions },
        { $sort: { followup_date: 1 } }
      ]);
       const lead_length=await lead.length;
      const wonLeadCount = await Lead.aggregate([
        { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
        { $count: "count" } 
      ]);
    
      const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0; // Handle division by zero
    
      lead.forEach((lead1) => {
        total += parseInt(lead1.followup_won_amount) || 0;
      });
     data.push({ Total: lead_length, Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0, Ratio: ratio.toFixed(2) + '%', Amount: total });
    
      res.status(200).json({
        success: true,
        message: "Successfully fetched data",
        lead: lead,
        data: data,
      });
    }
    if(role==='TeamLeader'){
      if(agent){
        let total = 0;
        let data = [];
        
        const matchConditions = {};
        if (agent) matchConditions.assign_to_agent = new ObjectId(agent);
        if (service) matchConditions.service = new ObjectId(service);
        if (status) matchConditions.status = new ObjectId(status);
        if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
        if (startDate && endDate) {
          matchConditions.followup_date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }
      
        const lead = await Lead.aggregate([
          { $match: matchConditions },
          { $sort: { followup_date: 1 } }
        ]);
         const lead_length=await lead.length;
        const wonLeadCount = await Lead.aggregate([
          { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
          { $count: "count" } 
        ]);
      
        const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0; // Handle division by zero
      
        lead.forEach((lead1) => {
          total += parseInt(lead1.followup_won_amount) || 0;
        });
       data.push({ Total: lead_length, Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0, Ratio: ratio.toFixed(2) + '%', Amount: total });
      
        res.status(200).json({
          success: true,
          message: "Successfully fetched data",
          lead: lead,
          data: data,
        });
      }else{
        let total = 0;
        let data = [];
        const [agentsByAssigntl, agentsById] = await Promise.all([
          Agent.find({ assigntl: user_id }),
          Agent.find({ _id: user_id })
      ]);
       const allAgents = [...agentsByAssigntl, ...agentsById];
        const matchConditions = {}; 
        if (!agent) matchConditions.assign_to_agent = { $in: allAgents.map(agent => new ObjectId(agent._id)) }
        if (service) matchConditions.service = new ObjectId(service);
        if (status) matchConditions.status = new ObjectId(status);
        if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
        if (startDate && endDate) {
          matchConditions.followup_date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
        }
      
        const lead = await Lead.aggregate([
          { $match: matchConditions },
          { $sort: { followup_date: 1 } }
        ]);
         const lead_length=await lead.length;
        const wonLeadCount = await Lead.aggregate([
          { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
          { $count: "count" } 
        ]);
      
        const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0; // Handle division by zero
      
        lead.forEach((lead1) => {
          total += parseInt(lead1.followup_won_amount) || 0;
        });
       data.push({ Total: lead_length, Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0, Ratio: ratio.toFixed(2) + '%', Amount: total });
      
        res.status(200).json({
          success: true,
          message: "Successfully fetched data",
          lead: lead,
          data: data,
        });
      }
   
    }
 
});



// Function to find all agents under a given agent recursively
const findAllAgents = async (leaderId) => {
  const agents = await Agent.find({ assigntl: leaderId });

  let allAgents = [...agents];  // Store current level agents

  // Recursively find agents under each found agent
  for (let agent of agents) {
      const subAgents = await findAllAgents(agent._id);  // Recursively find agents
      allAgents = [...allAgents, ...subAgents];  // Append sub-agents to the list
  }

  return allAgents;
};

exports.EmployeesReportDetailByFilter1 = catchAsyncErrors(async (req, res, next) => {
  const { agent, service, status, lead_source, startDate, endDate, role, user_id } = req.body;

  if (role === 'admin') {
      let total = 0;
      let data = [];

      const matchConditions = {};
      let agentRole = await Agent.findOne({ _id: agent }).select('role');

      if (agentRole && agentRole.role === 'GroupLeader') {
        
          const allAgents = await findAllAgents(agent);
          const agentIds = allAgents.map(a => a._id);
          agentIds.push(new ObjectId(agent));
          matchConditions.assign_to_agent = { $in: agentIds };
      } else if (agent) {
          matchConditions.assign_to_agent = new ObjectId(agent);
      }
      if (service) matchConditions.service = new ObjectId(service);
      if (status) matchConditions.status = new ObjectId(status);
      if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
      if (startDate && endDate) {
          matchConditions.followup_date = {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
          };
      }
      const lead = await Lead.aggregate([
          { $match: matchConditions },
          { $sort: { followup_date: 1 } }
      ]);
      const lead_length = await lead.length;
      const wonLeadCount = await Lead.aggregate([
          { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
          { $count: "count" }
      ]);

      const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0;

      lead.forEach((lead1) => {
          total += parseInt(lead1.followup_won_amount) || 0;
      });
      data.push({
          Total: lead_length,
          Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0,
          Ratio: ratio.toFixed(2) + '%',
          Amount: total
      });

      res.status(200).json({
          success: true,
          message: "Successfully fetched data",
          lead: lead,
          data: data,
      });
  }
  if (role === 'admin') {
    let total = 0;
    let data = [];

    const matchConditions = {};
    let agentRole = await Agent.findOne({ _id: agent }).select('role');

    if (agentRole && agentRole.role === 'TeamLeader') {
      
        const allAgents = await findAllAgents(agent);
        const agentIds = allAgents.map(a => a._id);
        agentIds.push(new ObjectId(agent));
        matchConditions.assign_to_agent = { $in: agentIds };
    } else if (agent) {
        matchConditions.assign_to_agent = new ObjectId(agent);
    }
    if (service) matchConditions.service = new ObjectId(service);
    if (status) matchConditions.status = new ObjectId(status);
    if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
    if (startDate && endDate) {
        matchConditions.followup_date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }
    const lead = await Lead.aggregate([
        { $match: matchConditions },
        { $sort: { followup_date: 1 } }
    ]);
    const lead_length = await lead.length;
    const wonLeadCount = await Lead.aggregate([
        { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
        { $count: "count" }
    ]);

    const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0;

    lead.forEach((lead1) => {
        total += parseInt(lead1.followup_won_amount) || 0;
    });
    data.push({
        Total: lead_length,
        Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0,
        Ratio: ratio.toFixed(2) + '%',
        Amount: total
    });

    res.status(200).json({
        success: true,
        message: "Successfully fetched data",
        lead: lead,
        data: data,
    });
}
  if (role === 'GroupLeader') {
    let total = 0;
    let data = [];

    const matchConditions = {};
    let agentRole = await Agent.findOne({ _id: agent }).select('role');

    if (agentRole && agentRole.role === 'TeamLeader') {
      
        const allAgents = await findAllAgents(agent);
        const agentIds = allAgents.map(a => a._id);
        agentIds.push(new ObjectId(agent));
        matchConditions.assign_to_agent = { $in: agentIds };
    } else if (agent) {
        matchConditions.assign_to_agent = new ObjectId(agent);
    }
    if (service) matchConditions.service = new ObjectId(service);
    if (status) matchConditions.status = new ObjectId(status);
    if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
    if (startDate && endDate) {
        matchConditions.followup_date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    }
    const lead = await Lead.aggregate([
        { $match: matchConditions },
        { $sort: { followup_date: 1 } }
    ]);
    const lead_length = await lead.length;
    const wonLeadCount = await Lead.aggregate([
        { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
        { $count: "count" }
    ]);

    const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0;

    lead.forEach((lead1) => {
        total += parseInt(lead1.followup_won_amount) || 0;
    });
    data.push({
        Total: lead_length,
        Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0,
        Ratio: ratio.toFixed(2) + '%',
        Amount: total
    });

    res.status(200).json({
        success: true,
        message: "Successfully fetched data",
        lead: lead,
        data: data,
    });
}
  if (role === 'TeamLeader') {
      if (agent) {
          let total = 0;
          let data = [];

          const matchConditions = {};
          if (agent) matchConditions.assign_to_agent = new ObjectId(agent);
          if (service) matchConditions.service = new ObjectId(service);
          if (status) matchConditions.status = new ObjectId(status);
          if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
          if (startDate && endDate) {
              matchConditions.followup_date = {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
              };
          }

          const lead = await Lead.aggregate([
              { $match: matchConditions },
              { $sort: { followup_date: 1 } }
          ]);

          const lead_length = await lead.length;
          const wonLeadCount = await Lead.aggregate([
              { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
              { $count: "count" }
          ]);

          const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0;

          lead.forEach((lead1) => {
              total += parseInt(lead1.followup_won_amount) || 0;
          });

          data.push({
              Total: lead_length,
              Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0,
              Ratio: ratio.toFixed(2) + '%',
              Amount: total
          });

          res.status(200).json({
              success: true,
              message: "Successfully fetched data",
              lead: lead,
              data: data,
          });
      } else {
          let total = 0;
          let data = [];

          const [agentsByAssigntl, agentsById] = await Promise.all([
              Agent.find({ assigntl: user_id }),
              Agent.find({ _id: user_id })
          ]);

          const allAgents = [...agentsByAssigntl, ...agentsById];

          const matchConditions = {};
          if (!agent) matchConditions.assign_to_agent = { $in: allAgents.map(agent => new ObjectId(agent._id)) };
          if (service) matchConditions.service = new ObjectId(service);
          if (status) matchConditions.status = new ObjectId(status);
          if (lead_source) matchConditions.lead_source = new ObjectId(lead_source);
          if (startDate && endDate) {
              matchConditions.followup_date = {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
              };
          }

          const lead = await Lead.aggregate([
              { $match: matchConditions },
              { $sort: { followup_date: 1 } }
          ]);

          const lead_length = await lead.length;
          const wonLeadCount = await Lead.aggregate([
              { $match: { status: new ObjectId('65a904e04473619190494482'), ...matchConditions } },
              { $count: "count" }
          ]);

          const ratio = (wonLeadCount.length > 0 ? wonLeadCount[0].count : 0) / lead.length * 100 || 0;

          lead.forEach((lead1) => {
              total += parseInt(lead1.followup_won_amount) || 0;
          });

          data.push({
              Total: lead_length,
              Won: wonLeadCount.length > 0 ? wonLeadCount[0].count : 0,
              Ratio: ratio.toFixed(2) + '%',
              Amount: total
          });

          res.status(200).json({
              success: true,
              message: "Successfully fetched data",
              lead: lead,
              data: data,
          });
      }
  }
});



