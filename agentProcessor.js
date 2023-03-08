const { Configuration, OpenAIApi } = require("openai");
const dJSON = require("dirty-json");

function formatToolList(toolList) {
  let formattedToolList = "";
  toolList.forEach((tool) => {
    formattedToolList =
      formattedToolList +
      `${tool.name}:[${tool.arguments.toString()}], ${tool.description}\n`;
  });
  return formattedToolList;
}
function formatCOTTurns(cotTurns) {
  let result = "";

  cotTurns.forEach((cotTurn) => {
    const { subAgentLog, ...extractedCOTTurn } = { ...cotTurn };
    result += `${JSON.stringify(extractedCOTTurn)},\n`;
  });

  return result;
}

function formatExamples(examples) {
  let formattedExampleList = "";
  examples.forEach((example) => {
    formattedExampleList = formattedExampleList + "\nEXAMPLE:\n";
    formattedExampleList += formatCOTTurns(example);
  });
  return formattedExampleList;
}

async function buildPrompt(agent, agentLog) {
  let prompt = `${agent.preamble} \n ${formatToolList(agent.tools)}\n${
    agent.rules
  }
${formatExamples(agent.examples)}
${agent.postAmble}
${formatCOTTurns(agentLog)}`;
  return prompt;
}

exports.runNeuralSubAgent = async function (agent, query) {
  const initialAgentLog = [...agent.cotPrompt];
  console.log("** running neural sub agent", agent.name, query);

  const logResult = await exports.processUserTurn({
    agent: agent,
    agentLog: initialAgentLog,
    userReply: query,
  });

  console.log(`agent log ${agent.name}`, logResult);
  // get last talk from the search result
  let finalResult = "no result";
  logResult.forEach((logElement) => {
    if (logElement.type == "action" && logElement.actionType == "Talk") {
      finalResult = logElement.message;
    }
  });
  return { result: finalResult, log: logResult };
};

exports.processUserTurn = async function ({ agent, agentLog, userReply }) {
  // add on to the log the user reply as an observation
  let updatedLog = [
    ...agentLog,
    { type: "observation", from: "user", message: userReply },
  ];

  //console.log("** PROMPT");
  //console.log(prompt);
  //console.log("** END PROMPT");

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  let isThinkingComplete = false;
  let interationCount = 0;

  while (!isThinkingComplete && interationCount < 5) {
    interationCount += 1;

    const prompt = await buildPrompt(agent, updatedLog);
    const promptResult = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0,
      stop: `{"type":"observation"`,
    });

    const parsedPromptResult = promptResult.data.choices[0].text;

    console.log(parsedPromptResult);
    const promptResults = parsedPromptResult.split(",\n");

    const updatedLogElements = await Promise.all(
      promptResults.map(async (p) => {
        if (p.length > 0) {
          let observations = [];

          //const pp = JSON.parse(p);
          //const correctedPromptResult = p.replace(/,\s*([}\]])/g, "$1");
          //const correctedPromptResult = p.replace("},", "}");
          //const pp = JSON.parse(correctedPromptResult);
          let pp = null;
          console.log("about to parse: ", p);
          try {
            pp = dJSON.parse(p);
          } catch (ex) {
            //const correctedPromptResult = p.replace(/,\s*([}\]])/g, "$1");
            let correctedPromptResult = p.replace("},", "}");
            console.log("... how about ", correctedPromptResult);
            if (correctedPromptResult.charAt(0) != "{") {
              correctedPromptResult = `{${correctedPromptResult}`;
            }
            pp = JSON.parse(correctedPromptResult);
          }

          if (pp.type == "action") {
            // determine if we have a tool for the action type
            const matchingTool = agent.tools.find(
              (tool) => tool.name == pp.actionType
            );
            if (matchingTool && matchingTool.callback) {
              const callbackResult = await matchingTool.callback(pp);

              observations.push({
                type: "observation",
                from: matchingTool.name,
                message: callbackResult.result,
                subAgentLog: callbackResult.log,
              });
            }
          }

          return { event: pp, observations };
        }
      })
    );

    let filteredExpandedUpdatedLog = [];
    updatedLogElements.forEach((logElement) => {
      if (logElement && logElement.event) {
        if (
          logElement.event.type == "action" &&
          logElement.event.actionType == "talk"
        ) {
          // ready to speak to user, thinking complete
          isThinkingComplete = true;
        }

        filteredExpandedUpdatedLog.push(logElement.event);
        if (logElement.observations) {
          logElement.observations.forEach((observation) => {
            filteredExpandedUpdatedLog.push(observation);
          });
        }
      }
    });

    updatedLog = [...updatedLog, ...filteredExpandedUpdatedLog];
  }

  return updatedLog;
};
