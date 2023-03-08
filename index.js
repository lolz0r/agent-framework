const { createTravelAgent } = require("./virtualTravelAgent.js");
const { processUserTurn } = require("./agentProcessor.js");

const express = require("express");
const app = express();
const port = 3000;

app.post("/", async (req, res) => {
  const { agentLog, userReply } = req.body.data;

  const agent = createTravelAgent();

  if (userReply == null || agentLog == null) {
    // no context provided, return early and give the user the initial context
    res.json({
      status: "OK",
      data: {
        agentLog: agent.cotPrompt,
      },
    });
    return;
  }

  let updatedLog = await processUserTurn({
    agent,
    agentLog,
    userReply,
  });

  res.json({
    status: "OK",
    data: {
      agentLog: updatedLog,
    },
  });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
