const Lead_Source = require("../models/leadsourceModel");
const CallLog = require("../models/callLogModel");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHander = require("../utils/errorhander");
const moment = require("moment");
const SecondToHoure = require("../utils/secondtohoure");
const Agent = require("../models/agentModel");
///  add call log
exports.Add_CallLog = catchAsyncErrors(async (req, res, next) => {
  const { datetime, user_id } = req.body;
  const datetimeDate = new Date(datetime);
  const formattedDate = moment(datetimeDate).format("YYYY-MM-DD");

  const call_log = await CallLog.find({ datetime, user_id });

  if (call_log.length === 0) {
    const calllog = await CallLog.create({
      ...req.body,
      calldate: formattedDate,
    });

    res.status(201).json({
      success: true,
      message: "CallLog Has Been Added Successfully",
      calllog,
    });
  } else {
    res.status(201).json({
      success: true,
      message: "CallLog Already Added",
    });
  }
});

//// get call log by user id
exports.getCallLogById = catchAsyncErrors(async (req, res, next) => {
  const call_log = await CallLog.find({ user_id: req.params.id })
    .sort({ datetime: -1 })
    .exec();
  if (!call_log) {
    return next(new ErrorHander("This id is Not Found", 404));
  }
  res.status(201).json({
    success: true,
    call_log,
  });
});
///// get call log by user_id and date wise
exports.getCallLogByIdAndDate = catchAsyncErrors(async (req, res, next) => {
  const { user_id, start_date, end_date } = req.body;
  const details = [];

  const call_log = await CallLog.find({
    user_id: user_id,
    calldate: {
      $gte: start_date,
      $lte: end_date,
    },
  }).maxTimeMS(30000);

  const call_log1 = await CallLog.find({
    user_id: user_id,
    calldate: {
      $gte: start_date,
      $lte: end_date,
    },
    duration: 0,
  }).maxTimeMS(30000);

  const NotConnectedCall = await call_log1.length;

  if (!call_log) {
    return next(new ErrorHander("This id is Not Found", 404));
  }
  let totalDuration = 0;
  let totalIncommingDuration = 0;
  let totalOutgoingDuration = 0;
  let totalCall = 0;
  let totalMissCall = 0;
  let totalIncommingCall = 0;
  let totalOutgoingCall = 0;
  let totalRejectedCall = 0;

  call_log.map((call_logs) => {
    totalDuration += call_logs.duration;
    totalCall += 1;
    if (call_logs.rawtype == 1) {
      totalIncommingDuration += call_logs.duration;
      totalIncommingCall += 1;
    }
    if (call_logs.rawtype == 2) {
      totalOutgoingDuration += call_logs.duration;
      totalOutgoingCall += 1;
    }
    if (call_logs.rawtype == 3) {
      totalMissCall += 1;
    }
    if (call_logs.rawtype == 10) {
      totalRejectedCall += 1;
    }
  });
  /// Longest Duration T
  const maxObject = call_log.reduce(
    (max, current) => (current.duration > max.duration ? current : max),
    call_log[0]
  );
  /// for total duration
  const thours = Math.floor(totalDuration / 3600);
  const tminutes = Math.floor((totalDuration % 3600) / 60);
  const tremainingSeconds = totalDuration % 60;
  const total_duration =
    thours + "h " + tminutes + "m " + tremainingSeconds + "s";
  /// for incomming duration
  const tihours = Math.floor(totalIncommingDuration / 3600);
  const timinutes = Math.floor((totalIncommingDuration % 3600) / 60);
  const tiremainingSeconds = totalIncommingDuration % 60;
  const tiotal_duration =
    tihours + "h " + timinutes + "m " + tiremainingSeconds + "s";
  //// for outgoing duration
  const tohours = Math.floor(totalOutgoingDuration / 3600);
  const tominutes = Math.floor((totalOutgoingDuration % 3600) / 60);
  const toremainingSeconds = totalOutgoingDuration % 60;
  const tootal_duration =
    tohours + "h " + tominutes + "m " + toremainingSeconds + "s";
  ////  Total Day And Average Duration
  const timeDifference = new Date(end_date) - new Date(start_date);
  const TotalDays = timeDifference / (1000 * 60 * 60 * 24) + 1;
  const avragedurationinsecond = totalDuration / TotalDays;
  const avragedurationinhoure = Math.floor(avragedurationinsecond / 3600);
  const avragedurationinminutes = Math.floor(
    (avragedurationinsecond % 3600) / 60
  );
  const avragedurationinSeconds = parseInt(avragedurationinsecond % 60);
  const avrage_duration_per_day =
    avragedurationinhoure +
    "h " +
    avragedurationinminutes +
    "m " +
    avragedurationinSeconds +
    "s";
  //////Average Duration per Call
  const avrage_duration_per_call_in_second = totalDuration / totalCall;
  const avrage_duration_per_call = await SecondToHoure(
    avrage_duration_per_call_in_second
  );

  /////////total Working  houre Calculate
  const dailworkingtime = parseInt(totalCall * 30) + parseInt(totalDuration);
  const totalworkinghoure = await SecondToHoure(dailworkingtime);
  /////Top Dialer

  const countMap = new Map();

  // Count occurrences of each value and store the corresponding objects
  call_log.forEach((obj) => {
    const value = obj.phone_number;
    if (!countMap.has(value)) {
      countMap.set(value, []);
    }
    countMap.get(value).push(obj);
  });

  // Find the most frequent value and its corresponding objects
  let mostFrequentDialer;
  let mostFrequentDialerName;
  let maxCountDial = 0;

  countMap.forEach((objects, value) => {
    const count = objects.length;
    if (count > maxCountDial) {
      mostFrequentDialer = value;
      mostFrequentDialerName = objects[0].name;
      maxCountDial = count;
    }
  });
  details.push({
    totalDuration: total_duration,
    NotConnectedCall: NotConnectedCall,
    totalworkinghoure: totalworkinghoure,
    totalIncommingDuration: tiotal_duration,
    totalOutgoingDuration: tootal_duration,
    totalCall: totalCall,
    totalIncommingCall: totalIncommingCall,
    totalOutgoingCall: totalOutgoingCall,
    totalMissCall: totalMissCall,
    totalRejectedCall: totalRejectedCall,
    TotalDays: TotalDays,
    avrage_duration_per_day: avrage_duration_per_day,
    avrage_duration_per_call: avrage_duration_per_call,
    mostFrequentDialer: mostFrequentDialer,
    mostFrequentDialerName: mostFrequentDialerName,
    maxCountDial: maxCountDial,
    Longest_talk: maxObject,
  });

  res.status(201).json({
    success: true,
    details,
  });
});

/////// Get Call Details BY
exports.GetAllUserCallLogById = catchAsyncErrors(async (req, res, next) => {
  try {
    const agents = await Agent.find({ role: "user" });

    let array = [];
    let username = [];
    let value = [];

    await Promise.all(
      agents.map(async (agent) => {
        const user_id = agent._id; // Assuming _id is the correct property for user_id
        let TotalTime = 0; // Reset TotalTime for each user

        const callDetail = await CallLog.find({ user_id: user_id });
        const HigstNoOfCall = await callDetail?.length;

        callDetail.map((callDetails) => {
          TotalTime += parseInt(callDetails?.duration) || 0; // Add the duration for each call
        });

        const AvrageTime = await parseInt(TotalTime / HigstNoOfCall);

        array.push({
          ["user_id"]: agent._id,
          ["username"]: agent.agent_name,
          ["HigstNoOfCall"]: HigstNoOfCall,
          ["TotalTime"]: TotalTime,
          ["AvrageTime"]: AvrageTime,
        });
        username.push(agent.agent_name);
        value.push(HigstNoOfCall);
      })
    );

    res.status(200).json({
      success: true,
      array,
      username,
      value,
    });
  } catch (error) {
    next(error); // Pass the error to the error handler
  }
});

exports.GetAllUserCallLogByAdminId = catchAsyncErrors(
  async (req, res, next) => {
    try {
      // Fetching users, team leaders, and group leaders
      const users = await Agent.find({ role: "user" });
      const teamleaders = await Agent.find({ role: "TeamLeader" });
      const groupleaders = await Agent.find({ role: "GroupLeader" });

      let array = [];
      let username = [];
      let value = [];

      // Helper function to process call logs for each agent
      const processCallLogs = async (agent) => {
        const user_id = agent._id;
        let TotalTime = 0;

        // Fetch call details for the agent
        const callDetail = await CallLog.find({ user_id: user_id });
        const HigstNoOfCall = callDetail?.length || 0;

        // Calculate total duration
        callDetail.forEach((callDetails) => {
          TotalTime += parseInt(callDetails?.duration) || 0;
        });

        const AvrageTime =
          HigstNoOfCall > 0 ? parseInt(TotalTime / HigstNoOfCall) : 0;

        array.push({
          ["user_id"]: agent._id,
          ["role"]: agent.role,
          ["username"]: agent.agent_name,
          ["HigstNoOfCall"]: HigstNoOfCall,
          ["TotalTime"]: TotalTime,
          ["AvrageTime"]: AvrageTime,
        });
        username.push(agent.agent_name);
        value.push(HigstNoOfCall);
      };

      // Process call logs for users, team leaders, and group leaders only
      await Promise.all(users.map(processCallLogs));
      await Promise.all(teamleaders.map(processCallLogs));
      await Promise.all(groupleaders.map(processCallLogs));

      // Respond with the collected call log data
      res.status(200).json({
        success: true,
        array,
        username,
        value,
      });
    } catch (error) {
      next(error); // Pass the error to the error handler
    }
  }
);

exports.GetAllUserCallLogByIdTeam = catchAsyncErrors(async (req, res, next) => {
  try {
    let agents;
    if (req.body.assign_to_agent) {
      agents = await Agent.find({
        role: "user",
        assigntl: req.body.assign_to_agent,
      });
    } else {
      agents = await Agent.find({ role: "user" });
    }
    let array = [];
    let username = [];
    let value = [];

    await Promise.all(
      agents.map(async (agent) => {
        const user_id = agent?._id; // Assuming _id is the correct property for user_id
        let TotalTime = 0; // Reset TotalTime for each user

        const callDetail = await CallLog.find({ user_id: user_id });
        const HigstNoOfCall = await callDetail?.length;

        callDetail.map((callDetails) => {
          TotalTime += parseInt(callDetails?.duration) || 0; // Add the duration for each call
        });

        const AvrageTime = await parseInt(TotalTime / HigstNoOfCall);

        array.push({
          ["user_id"]: agent._id,
          ["username"]: agent.agent_name,
          ["HigstNoOfCall"]: HigstNoOfCall,
          ["TotalTime"]: TotalTime,
          ["AvrageTime"]: AvrageTime,
        });
        username.push(agent.agent_name);
        value.push(HigstNoOfCall);
      })
    );

    res.status(200).json({
      success: true,
      array,
      username,
      value,
    });
  } catch (error) {
    next(error); // Pass the error to the error handler
  }
});

/////// Get Call Details BY
exports.GetUserCallAccordingToTeamLeader = catchAsyncErrors(
  async (req, res, next) => {
    const { assign_to_agent } = req.body;

    if (!assign_to_agent) {
      return next(new ErrorHander("assign_to_agent is required..!", 404));
    }
    const allAgents = await Agent.find({ assigntl: assign_to_agent });
    if (allAgents.length < 1) {
      return next(new ErrorHander("No Lead..!", 404));
    }
    try {
      let array = [];
      let username = [];
      let value = [];

      await Promise.all(
        allAgents.map(async (agent) => {
          const user_id = agent._id; // Assuming _id is the correct property for user_id
          let TotalTime = 0;
          const callDetail = await CallLog.find({ user_id: user_id });
          const HigstNoOfCall = callDetail?.length || 0;

          callDetail.forEach((callDetails) => {
            TotalTime += parseInt(callDetails?.duration) || 0;
          });

          const AvrageTime =
            HigstNoOfCall > 0 ? parseInt(TotalTime / HigstNoOfCall) : 0;

          array.push({
            user_id: agent._id,
            username: agent.agent_name,
            HigstNoOfCall: HigstNoOfCall,
            TotalTime: TotalTime,
            AvrageTime: AvrageTime,
          });
          username.push(agent.agent_name);
          value.push(HigstNoOfCall);
        })
      );

      res.status(200).json({
        success: true,
        array,
        username,
        value,
      });
    } catch (error) {
      next(error); // Pass the error to the error handler
    }
  }
);

// get call detail by  group admin
exports.GetUserCallAccordingToGroupLeader = catchAsyncErrors(
  async (req, res, next) => {
    const { assign_to_agent } = req.body;

    if (!assign_to_agent) {
      return next(new ErrorHander("assign_to_agent is required..!", 404));
    }
    const allAgentss = await Agent.find({ assigntl: assign_to_agent });
    const tlids = allAgentss.map((agent) => agent.id);
    // console.log("tlids",tlids);
    const tlagents = await Agent.find({ assigntl: { $in: tlids } });
    console.log("tlagents", tlagents);

    const allAgents = [...allAgentss, ...tlagents];

    if (allAgents.length < 1) {
      return next(new ErrorHander("No Lead..!", 404));
    }
    try {
      let array = [];
      let username = [];
      let value = [];

      await Promise.all(
        allAgents.map(async (agent) => {
          const user_id = agent._id; // Assuming _id is the correct property for user_id
          let TotalTime = 0;
          const callDetail = await CallLog.find({ user_id: user_id });
          const HigstNoOfCall = callDetail?.length || 0;

          callDetail.forEach((callDetails) => {
            TotalTime += parseInt(callDetails?.duration) || 0;
          });

          const AvrageTime =
            HigstNoOfCall > 0 ? parseInt(TotalTime / HigstNoOfCall) : 0;

          array.push({
            user_id: agent._id,
            username: agent.agent_name,
            HigstNoOfCall: HigstNoOfCall,
            TotalTime: TotalTime,
            AvrageTime: AvrageTime,
          });
          username.push(agent.agent_name);
          value.push(HigstNoOfCall);
        })
      );

      res.status(200).json({
        success: true,
        array,
        username,
        value,
      });
    } catch (error) {
      next(error); // Pass the error to the error handler
    }
  }
);

/////// Get Call Details BY Date Wise
// exports.GetAllUserCallLogByDateWise = catchAsyncErrors(
//   async (req, res, next) => {
//     const { start_date, end_date,time } = req.body;
//     try {
//       const agents = await Agent.find({ role: "user" });
//       let array = [];

//       await Promise.all(
//         agents.map(async (agent) => {
//           const user_id = agent._id; // Assuming _id is the correct property for user_id
//           let TotalTime = 0; // Reset TotalTime for each user

//           const callDetail = await CallLog.find({
//             user_id: user_id,
//             calldate: {
//               $gte: start_date, // Filter calls with calldate greater than or equal to start_date
//               $lte: end_date, // Filter calls with calldate less than or equal to end_date
//             },
//           });

//           const HigstNoOfCall = await callDetail?.length;

//           callDetail.map((callDetails) => {
//             TotalTime += parseInt(callDetails?.duration) || 0; // Add the duration for each call
//           });

//           const AvrageTime = await parseInt(TotalTime / HigstNoOfCall);

//           array.push({
//             ["user_id"]: agent._id,
//             ["username"]: agent.agent_name,
//             ["HigstNoOfCall"]: HigstNoOfCall,
//             ["TotalTime"]: TotalTime,
//             ["AvrageTime"]: AvrageTime,
//           });
//         })
//       );

//       res.status(200).json({
//         success: true,
//         array,
//       });
//     } catch (error) {
//       next(error); // Pass the error to the error handler
//     }
//   }
// );

// Get Call Details BY Date Wise
exports.GetAllUserCallLogByDateWise = catchAsyncErrors(
  async (req, res, next) => {
    const { start_date, end_date, time } = req.body;
    console.log("getAllUserCallLogByDateWise", req.body);

    try {
      const agents = await Agent.find();
      let array = [];

      await Promise.all(
        agents.map(async (agent) => {
          const user_id = agent._id;
          let TotalTime = 0;

          // Build query with date and time filters
          const query = { user_id };

          if (start_date && end_date) {
            query.calldate = {
              $gte: new Date(start_date),
              $lte: new Date(end_date),
            };
          } else if (start_date) {
            query.calldate = {
              $gte: new Date(start_date),
            };
          }

          if (time) {
            query.duration = { $gte: parseInt(time) };
          }

          const callDetail = await CallLog.find(query);
          const HigstNoOfCall = callDetail.length;

          // Only proceed if calls match the filter
          if (HigstNoOfCall > 0) {
            callDetail.forEach((call) => {
              TotalTime += parseInt(call.duration) || 0;
            });

            const AvrageTime = parseInt(TotalTime / HigstNoOfCall);

            array.push({
              user_id: agent._id,
              username: agent.agent_name,
              HigstNoOfCall,
              TotalTime,
              AvrageTime,
            });
          }
        })
      );

      res.status(200).json({
        success: true,
        array,
      });
    } catch (error) {
      next(error);
    }
  }
);

////// GEt Call Log BY UserId And Date Range
exports.GetCallLogByIdAndDateRange = catchAsyncErrors(
  async (req, res, next) => {
    const { user_id, startDate, endDate } = req.body;

    const CallLogs = await CallLog.find({
      user_id: user_id,
      calldate: {
        $gte: startDate,
        $lte: endDate,
      },
    });
    res.status(200).json({
      success: true,
      message: "Get CallLog Successfully",
      CallLogs,
    });
  }
);

/// delete all calll log

exports.deleteAllCallLog = catchAsyncErrors(async (req, res, next) => {
  await CallLog.deleteMany();
  res.status(200).json({
    success: true,
    message: "Delete All CallLog Successfully",
  });
});

//add call log

exports.addCallLog = async (req, res) => {
  try {
    const { user_id, lead_id } = req.body;
    const existingCallLog = await CallLog.findOne({ user_id, lead_id });
    if (existingCallLog) {
      existingCallLog.call_start_time = new Date();
      await existingCallLog.save();
      return res.status(200).json({ msg: "you have called this lead" });
    }
    const callLog = new CallLog({
      user_id,
      lead_id,
      call_start_time: new Date(),
    });

    await callLog.save();

    return res.status(200).json({ success: true, msg: "call log created" });
  } catch (error) {
    console.log("error in addCallLog", error);
    return res.status(500).json("server error");
  }
};

exports.updateCallLog = async (req, res) => {
  try {
    const { user_id, lead_id } = req.body;
    const updatedCallLog = await CallLog.findOne({ user_id, lead_id });
    if (!updatedCallLog) {
      return res.status(400).json({ msg: "please call first" });
    }
    const callendTime = new Date();

    let duration =
      (new Date().getTime() -
        new Date(updatedCallLog.call_start_time).getTime()) /
      1000;
    updatedCallLog.duration = updatedCallLog.duration
      ? updatedCallLog.duration + duration
      : duration;
    updatedCallLog.call_end_time = callendTime;
    await updatedCallLog.save();
    return res.status(200).json({ msg: "call log updated" });
  } catch (error) {
    console.log("error in updateCallLog", error);
    return res.status(500).json({ msg: "server error" });
  }
};

exports.callReport = async (req, res) => {
  try {
    const callLogs = await CallLog.aggregate([
      {
        $lookup: {
          from: "crm_agents",
          localField: "user_id",
          foreignField: "_id",
          as: "users",
        },
      },
      {
        $unwind: {
          path: "$users",

          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$user_id",
          duration: { $sum: "$duration" },
          user: { $first: "$users" },
          number_of_calls: { $sum: 1 },
        },
      },
    ]);
    return res.status(200).json({ success: true, callLogs });
  } catch (error) {
    console.log("error in callReport", error);
    return res.status(500).json({ msg: "server error" });
  }
};
