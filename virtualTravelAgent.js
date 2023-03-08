const { createWikiAgent } = require("./wikiSearchAgent.js");
const { createGMAPSearchAgent } = require("./gmapSearchAgent.js");
const { processUserTurn, runNeuralSubAgent } = require("./agentProcessor.js");

exports.createTravelAgent = function () {
  let agent = {};

  agent.name = "Virtual Travel Agent";
  agent.postAmble = "ACTUAL:\n";
  agent.preamble =
    "Help a person decide where to travel by interleaving Thought, Action, Observation steps. Thought can reason about the current situation, and Action can of the following types:";

  agent.rules = [
    "Don't give the user information that is not directly provided through an observation.",
  ];
  agent.tools = [
    {
      name: "WikiQuestion",
      callback: async function ({ question }) {
        // create a wiki agent and pass the question to it
        const wikiAgent = createWikiAgent();
        const { result, log } = await runNeuralSubAgent(wikiAgent, question);
        return { result, log };
      },
      arguments: ["question"],
      description: "Searches wikipedia to answer a given question.",
    },
    {
      name: "LocationSearch",
      callback: async function (context) {
        console.log("hello from locations earth", context);
        // create a wiki agent and pass the question to it
        const mapSearchAgent = createGMAPSearchAgent();
        /*
        type: 'action',
        actionType: 'LocationSearch',
        cityName: 'France',
        keyword: 'Kouign-amann',
        question: 'What is the best place to get the Kouign-amann in France?'
        */

        const { result, log } = await runNeuralSubAgent(
          mapSearchAgent,
          `For the city ${context.cityName} answer the following question: "${context.question}"`
        );
        return { result, log };
      },
      arguments: ["cityName", "keyword", "question"],
      description:
        "Searches a given city for the given keywords and attempts to answer the passed in qustion. CityName MUST be an actual city.",
    },
    {
      name: "Talk",
      arguments: ["question or statement"],
      description:
        "Ask the user a question to learn more about their wants and/or needs, or give information to the user.",
    },
  ];
  agent.examples = [
    [
      {
        type: "thought",
        message:
          "I need to determine where the user wants to go and what they want to do",
      },
      {
        type: "action",
        actionType: "talk",
        message: "I am a friendly virtual travel agent, how can I help you?",
      },
      {
        type: "observation",
        from: "user",
        message: "I want to visit somewhere warm",
      },
      {
        type: "thought",
        message:
          "The user wants to visit somewhere warm. However, I need to ask more specific questions to determine a possible locale",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "What type of activities do you want to do while you are there?",
      },
      { type: "observation", from: "user", message: "surf, eat tacos, chill" },
      {
        type: "thought",
        message:
          "The user wants to surf, eat tacos, and chill. I should search for a location that offers these activities.",
      },
      {
        type: "action",
        actionType: "LocationSearch",
        cityName: "San Diego",
        keyword: "surf, tacos, chill",
        question:
          "What is the best place to visit in San Diego for surfing, eating tacos, and chilling?",
      },
      {
        type: "observation",
        from: "LocationSearch",
        message: "Mission Beach has tacos, surf, and chilling within San Diego",
      },
      {
        type: "thought",
        message:
          "Mission Beach has what the user is looking for. I should see if the user needs a hotel or anything else.",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "Do you need a hotel or any other information for your trip to Mission Beach?",
      },
      {
        type: "observation",
        from: "user",
        message: "what is a good cheap hotel in the area?",
      },
      {
        type: "thought",
        message:
          "The user needs a hotel in the area. I should search for a good cheap hotel in Mission Beach.",
      },
      {
        type: "action",
        actionType: "LocationSearch",
        cityName: "San Diego",
        keyword: "cheap hotel",
        question: "What is the best cheap hotel in Mission Beach?",
      },
      {
        type: "observation",
        from: "LocationSearch",
        message: "The Dana on Mission Bay is a cheap hotel in Mission Beach",
      },
      {
        type: "thought",
        message:
          "The Dana on Mission Bay is a good cheap hotel in Mission Beach. I should recommend this to the user and see if they need anything else.",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "I recommend The Dana on Mission Bay for your stay in Mission Beach. Do you need anything else?",
      },
      { type: "observation", from: "user", message: "resturants?" },
      {
        type: "thought",
        message:
          "The user needs to know about taco resturants in Mission Beach. I should search for taco resturants in the area.",
      },
      {
        type: "action",
        actionType: "LocationSearch",
        cityName: "San Diego",
        keyword: "taco resturants",
        question: "What are the best taco resturants in Mission Beach?",
      },
      {
        type: "observation",
        from: "LocationSearch",
        message:
          "Taco Surf and The Taco Stand are two of the best taco resturants in Mission Beach.",
      },
      {
        type: "thought",
        message:
          "Taco Surf and The Taco Stand are two of the best taco resturants in Mission Beach. I should recommend these to the user.",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "I recommend Taco Surf and The Taco Stand for tacos in Mission Beach. Is there anything else I can help you with?",
      },
      { type: "observation", from: "user", message: "OK give me a summary" },
      {
        type: "thought",
        message:
          "The user needs a summary of their trip. I should provide a summary of the information I have gathered.",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "Based on our conversation, I recommend Mission Beach for your trip. The Dana on Mission Bay is a good cheap hotel in the area, and Taco Surf and The Taco Stand are two of the best taco resturants in Mission Beach. Is there anything else I can help you with?",
      },
    ],

    [
      {
        type: "thought",
        message:
          "I need to determine where the user wants to go and what they want to do",
      },
      {
        type: "action",
        actionType: "talk",
        message: "I am a friendly virtual travel agent, how can I help you?",
      },
      {
        type: "observation",
        from: "user",
        message: "I want to visit Japan and see 3 onsens",
      },
      {
        type: "thought",
        message:
          "The user wants to visit Japan and see 3 onsens. I should search for onsens in Japan. I can do this with a WikiQuestion",
      },
      {
        type: "action",
        actionType: "WikiQuestion",
        question: "What are the best onsens in Japan?",
      },
      {
        type: "observation",
        from: "WikiQuestion",
        message:
          "The best onsens in Japan are Arima Onsen, Dogo Onsen, and Goshiki Onsen",
      },
      {
        type: "thought",
        message:
          "The user wants to visit Arima Onsen, Dogo Onsen, and Goshiki Onsen. I should search for hotels near these onsens.",
      },
      {
        type: "action",
        actionType: "LocationSearch",
        cityName: "Japan",
        keyword: "hotel",
        question:
          "What are the best hotels near Arima Onsen, Dogo Onsen, and Goshiki Onsen?",
      },
      {
        type: "observation",
        from: "LocationSearch",
        message:
          "The cityName 'Japan' is not an actual city, so this query is not valid. The cityName should be a specific city near the three onsens mentioned in the question.",
      },
      {
        type: "thought",
        message:
          "The cityName must be a specific city near the three onsens mentioned in the question. I should determine the nearest city for each Onsen",
      },
      {
        type: "action",
        actionType: "WikiQuestion",
        question:
          "What is the nearest city to Arima Onsen, Dogo Onsen, and Goshiki Onsen?",
      },
      { type: "observation", from: "WikiQuestion", message: "Kobe" },
      {
        type: "thought",
        message:
          "The nearest city to Arima Onsen, Dogo Onsen, and Goshiki Onsen is Kobe. I should search for hotels in Kobe.",
      },
      {
        type: "action",
        actionType: "LocationSearch",
        cityName: "Kobe",
        keyword: "hotel",
        question:
          "What are the best hotels in Kobe near Arima Onsen, Dogo Onsen, and Goshiki Onsen?",
      },
      { type: "observation", from: "LocationSearch", message: "Mitushi Hotel" },
      {
        type: "thought",
        message:
          "Mitushi Hotel is a good hotel in Kobe near Arima Onsen, Dogo Onsen, and Goshiki Onsen. I should recommend this to the user and see if they need anything else.",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "I recommend Mitushi Hotel for your stay in Kobe. Do you need anything else?",
      },
      { type: "observation", from: "user", message: "Please summarize" },
      {
        type: "thought",
        message:
          "The user needs a summary of their trip. I should provide a summary of the information I have gathered.",
      },
      {
        type: "action",
        actionType: "talk",
        message:
          "Based on our conversation, I recommend Japan for your trip. The best onsens to visit are Arima Onsen, Dogo Onsen, and Goshiki Onsen. The nearest city to these onsens is Kobe, and Mitushi Hotel is a good hotel in Kobe. Is there anything else I can help you with?",
      },
    ],
  ];
  agent.cotPrompt = [
    {
      type: "thought",
      message:
        "I need to determine where the user wants to go and what they want to do",
    },
    {
      type: "action",
      actionType: "talk",
      message: "I am a friendly virtual travel agent, how can I help you?",
    },
  ];

  return agent;
};
