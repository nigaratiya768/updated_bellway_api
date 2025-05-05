const Followup = require("../models/followupModel");
const send = require("../notification_service/notificationService");
const Agent = require("../models/agentModel");
const moment = require("moment");
const getAllOverDueFollowups = async () => {
  try {
    const overDueLeads = await Followup.aggregate([
      {
        $match: {
          followup_date: { $lt: new Date() }, // filter due followups
        },
      },
      {
        $addFields: {
          objectLeadId: { $toObjectId: "$lead_id" },
          objectAssignToAgent: {
            $toObjectId: "$assign_to_agent",
          },
        },
      },
      {
        $lookup: {
          from: "crm_leads", // collection name where leads are stored
          localField: "objectLeadId",
          foreignField: "_id",
          as: "lead",
          pipeline: [
            {
              $project: {
                full_name: 1,
                contact_no: 1,
                followup_date: 1,
                status: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$lead",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "crm_agents", // collection name where agents are stored
          localField: "objectAssignToAgent",
          foreignField: "_id",
          as: "agent",
          pipeline: [
            {
              $project: {
                agent_name: 1,
                agent_email: 1,
                agent_mobile: 1,
                device_token: 1,
                assigntl: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$agent",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return overDueLeads;
  } catch (error) {
    console.log("error in getAllOverDueFollowups", error);
    return null;
  }
};

exports.tasks = async () => {
  const overDuefollowups = await getAllOverDueFollowups();

  if (overDuefollowups) {
    overDuefollowups.forEach((v) => {
      console.log("forEach");
      // if (v.agent && v.lead) {
      console.log("if condition");
      let followup_date = v.followup_date;
      let token = v.agent?.device_token;
      let name = v.agent?.agent_name;
      let email = v.agent?.agent_email;

      let assigntl = v.agent?.assigntl;
      let phone_number = v.agent?.agent_mobile;
      let lead = v.lead?.full_name;
      let lead_contact_no = v.lead?.contact_no;
      const notification = {
        title: `Reminder: Follow-up with ${lead}`,
        description: `You have a pending follow-up with ${lead} scheduled for ${moment(
          new Date(followup_date)
        ).format("DD-MM_YYYY")}. Please review and update.`,
      };
      console.log("agent", v.agent);
      if (token) {
        console.log("if condition token");
        send(v.assign_to_agent, notification);
        send(assigntl, notification);
      }
      // };
    });
  }

  console.log("overdue followups", overDuefollowups.length);
};
