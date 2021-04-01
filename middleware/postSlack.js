const https = require("https");

const postOptions = {
  hostname: "hooks.slack.com",
  path: "/services/T038RGMSP/B01LQB0648G/HvvQkZ8hKB3DfxmtiAdQ6Zg2",
  method: "POST",
  headers: {
    "Content-type": "application/json",
  },
};

const postSlack = (message) => {
  const req = https.request(postOptions, (res) => {
    if (res.statusCode === 200) {
      console.log("Slack message sent");
    } else {
      console.log("Slack message not sent");
    }
  });

  const data = {
    text: message,
  };

  req.write(JSON.stringify(data));
  req.end();
};

module.exports = postSlack;
