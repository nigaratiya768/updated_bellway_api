const cron = require("node-cron");
const { tasks } = require("./task");

cron.schedule("0 0 * * *", () => {
  console.log("reminder");
  tasks();
});
