const Lead = require("../models/leadModel");
const agent = require("../models/agentModel");
const FollowupLead = require("../models/followupModel");

const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const { param } = require("../app");
const SaveNotification = require("../models/websavenotification");
const LeadApproval = require("../models/LeadApproval");
const send = require("../notification_service/notificationService");
// insert approved details

exports.approved = async (req, res) => {
  const { lead_id, assign_to_agent, role, user_id, status } = req.body;

  try {
    const existingLead = await LeadApproval.findOne({
      lead_id: lead_id,
      assign_to_agent: assign_to_agent,
      role: role,
      user_id: user_id,
    });
    if (existingLead) {
      existingLead.status = status || "not-approved";
      const updatedLead = await existingLead.save();

      return res.status(200).json({
        success: true,
        message: "Status updated successfully",
        data: updatedLead,
      });
    } else {
      // If it doesn't exist, create a new record
      const newLeadApproval = new LeadApproval({
        lead_id: lead_id,
        assign_to_agent: assign_to_agent,
        role: role,
        user_id: user_id,
        status: status || "not-approved",
      });

      const savedLead = await newLeadApproval.save();

      return res.status(201).json({
        success: true,
        message: "Data inserted successfully",
        data: savedLead,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while inserting or updating data",
      error: error.message,
    });
  }
};

exports.getApproval = async (req, res) => {
  const data = await LeadApproval.find();
  console.log("data", data);
  res.send(data);
};

/// creat followup Lead
exports.Add_Followup_Lead = async (req, res, next) => {
  try {
    const followuplead1 = await FollowupLead.create(req.body);
    console.log("req.body", req.body);
    const lastInsertedId = followuplead1._id;
    console.log("followup leads", followuplead1);
    const followuplead = await FollowupLead.aggregate([
      {
        $match: {
          // $expr: {
          //   $eq: ["$_id", lastInsertedId],
          // },
          _id: lastInsertedId,
        },
      },

      {
        $lookup: {
          from: "crm_agents",
          // let: { commented_byString: "$commented_by" },

          localField: "commented_by",
          foreignField: "_id",
          pipeline: [
            // {
            //   $match: {
            //     // $expr: {
            //     //   $eq: ["$_id", { $toObjectId: "$$commented_byString" }],
            //     // },

            //   },
            // },
            {
              $project: {
                agent_name: 1,
              },
            },
          ],
          as: "comment_by",
        },
      },

      {
        $lookup: {
          from: "crm_statuses",
          // let: { followup_status_idString: "$followup_status_id" },
          localField: "followup_status_id",
          foreignField: "_id",
          pipeline: [
            // {
            //   $match: {
            //     $expr: {
            //       $eq: ["$_id", { $toObjectId: "$$followup_status_idString" }],
            //     },
            //   },
            // },
            {
              $project: {
                status_name: 1,
              },
            },
          ],
          as: "status_details",
        },
      },
    ]);

    const lead_id = followuplead1.lead_id;
    const assign_to_agent = followuplead1.assign_to_agent;
    const status_id = followuplead1.followup_status_id;
    const followup_date = followuplead1.followup_date;
    const followup_won_amount = followuplead1.followup_won_amount;
    const followup_lost_reason_id = followuplead1.followup_lost_reason_id;
    const add_to_calender = req.body.add_to_calender;
    const massage_of_calander = followuplead1.followup_desc;

    const condition = { _id: lead_id };
    const update_data = {
      assign_to_agent: assign_to_agent,
      status: status_id,
      followup_date: followup_date,
      followup_won_amount: followup_won_amount,
      followup_lost_reason_id: followup_lost_reason_id,
      add_to_calender: add_to_calender,
      description: massage_of_calander,
      massage_of_calander: massage_of_calander,
      type: "followup",
    };
    const update_lead = await Lead.updateOne(condition, update_data);
    const adddata = {
      user_id: assign_to_agent,
      title: "Notification Of Your Lead",
      body: massage_of_calander,
      datetime: followup_date,
    };
    //const SaveNotificationdata = await SaveNotification.create(adddata);
    send(assign_to_agent, {
      title: "lead status update",
      description: "lead status is updated",
    });
    return res.status(201).json({
      success: true,
      message: "Followup lead  Has Been Added Successfully",
      followuplead,
    });
  } catch (error) {
    console.log("error addfollowupLead", error);
    return res.status(500).json({ msg: "server error" });
  }
};

/// get follow up lead by lead id

exports.getFollowupById = catchAsyncErrors(async (req, res, next) => {
  const followuplead1 = await FollowupLead.find({ lead_id: req.params.id });
  if (!followuplead1) {
    return next(new ErrorHander("followuplead not found!...", 404));
  } else {
    const followuplead = await FollowupLead.aggregate([
      {
        $match: {
          $expr: {
            $eq: ["$lead_id", req.params.id],
          },
        },
      },

      {
        $lookup: {
          from: "crm_agents",
          let: { commented_byString: "$commented_by" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$commented_byString" }],
                },
              },
            },
            {
              $project: {
                agent_name: 1,
              },
            },
          ],
          as: "comment_by",
        },
      },

      {
        $lookup: {
          from: "crm_statuses",
          let: { followup_status_idString: "$followup_status_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", { $toObjectId: "$$followup_status_idString" }],
                },
              },
            },
            {
              $project: {
                status_name: 1,
              },
            },
          ],
          as: "status_details",
        },
      },

      {
        $sort: {
          created: -1, // 1 for ascending order, -1 for descending
        },
      },
    ]);
    if (followuplead) {
      const lead = await Lead.findById(req.params.id);
      const updatedData = { assign_to_agent: lead.assign_to_agent };

      const leads = await Lead.findByIdAndUpdate(req.params.id, updatedData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      });
    }

    res.status(201).json({
      success: true,
      followuplead,
    });
  }
});

///

exports.getAllfollowbyidstatus = catchAsyncErrors(async (req, res, next) => {});

////
