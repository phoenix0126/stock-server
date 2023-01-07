const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const cors = require("cors");

const {
  getActiveSettings,
  getMessage,
  sendMessage,
  timeFrames,
  runProcess,
} = require("./utils/app");

require("dotenv").config();

// apis
const auth = require("./api/auth");
const setting = require("./api/setting");
const main = require("./api/main");
const indice = require("./api/indice");
const analyze = require("./api/analyze");

// App
const app = express();

// cors middleware
const whitelist = [
  // "https://tradingdiscrepancy.com",
  "http://localhost:3000",
  // "http://192.168.98.133:3000/"
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors({}));

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// passport middleware
require("./config/passport")(passport);

app.use("/", auth.router);
app.use("/setting", setting.router);
app.use("/main", main.router);
app.use("/indice", indice.router);
app.use("/analyze", analyze.router);

// mail notification logic
let tomorrow = new Date();
tomorrow.setUTCHours(23, 59, 59, 999);

let mailTimer = null;

const init = async () => {
  await runProcess();
}

const timer = async () => {
  const now = new Date();

  console.log("now" + now.getTime(), "tomorrow" + tomorrow.getTime());

  if (now > tomorrow) {
    clearInterval(mailTimer);
    
    await runProcess();
    // get all settings
    const settings = await getActiveSettings();
    // process
    const result = [];
    for (let i = 0; i < settings.length; i++) {
      const res = await getMessage(
        settings[i].minXSD,
        settings[i].timeframe
      );
      if (res) {
        result.push(res);
      }
    }

    let text = "";

    result.forEach((result) => {
      text += `<h3>${result.title}</h3>`;
      if (result.data.length) {
        result.data.forEach((res) => {
          text += `<h4>${res.pair}</h4>`;
          text += `<p style="margin-left:50px;text-align:justify">GAP : ${res.gap} <br/> ${
            timeFrames[res.range - 1].label
          }'s SD : ${res.sd} <br/> XSD : ${res.xsd}</p><br/>`;
        });
      }
    });

    sendMessage(text);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(5, 59, 59, 999);
    mailTimer = setInterval(timer, 1000);
    console.log("sent");
  }
};

setTimeout(init, 1000);

mailTimer = setInterval(timer, 1000);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));
