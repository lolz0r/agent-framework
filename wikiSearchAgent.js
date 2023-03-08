const { Configuration, OpenAIApi } = require("openai");
const { Client } = require("@googlemaps/google-maps-services-js");
const wiki = require("wikijs").default;
exports.createWikiAgent = function () {
  let agent = {};

  agent.name = "WikiSearch Agent";
  agent.postAmble = "ACTUAL:\n";
  agent.preamble =
    "Help a person answer a question via Wikipedia by interleaving Thought, Action, Observation steps. Thought can reason about the current situation, and Action can of the following types:";

  agent.rules = [
    "Don't give the user information that is not directly provided through an observation.",
  ];
  agent.tools = [
    {
      name: "Search",
      callback: async function (context) {
        try {
          const wikiSearchResult = await wiki().search(context.message);
          console.log("wiki search result", wikiSearchResult.results);

          return JSON.stringify(wikiSearchResult.results);
        } catch (ex) {
          return "No results for that search";
        }
      },
      arguments: ["keyword"],
      description:
        "Searches wikipedia with the given keyword and returns a list of possible matching article names.",
    },
    {
      name: "Read",
      callback: async function (context) {
        //console.log("read context", context);
        try {
          const wikiSearchResult = await wiki().page(context.message);
          console.log("wiki read result", await wikiSearchResult.summary());

          return await wikiSearchResult.summary();
        } catch (ex) {
          return "Can't read page";
        }
      },
      arguments: ["article name"],
      description:
        "Returns the text of a specific article. Article name should be obtaind by first performing a Search",
    },
    {
      name: "Talk",
      arguments: ["answer"],
      description: "Respond back to the user",
    },
  ];
  agent.examples = [
    [
      {
        type: "thought",
        message: "I must answer the user's question.",
      },
      {
        type: "observation",
        from: "user",
        message: "Highest Mountain in France",
      },
      {
        type: "thought",
        message:
          "The user wants to visit to learn about the Highest Mountian in France. I should formulate a query to ask Wikipedia.",
      },
      {
        type: "action",
        actionType: "Search",
        message: "France, Highest Mountian",
      },
      {
        type: "observation",
        from: "Search",
        message: `["Carpathian Mountains", "Brokeback Mountain", "Great Smoky Mountains National Park"]`,
      },
      {
        type: "thought",
        message: `Based on the articles provided the "Carpathian Mountains" seems most likely. I should read that article. I can only read one article at a time.`,
      },
      {
        type: "action",
        actionType: "Read",
        message: "Carpathian Mountains",
      },
      {
        type: "observation",
        from: "Read",
        message: `The Carpathian Mountains or Carpathians (/kɑːrˈpeɪθiənz/) are a range of mountains forming an arc across Central Europe. Roughly 1,500 km (930 mi) long, it is the third-longest European mountain range after the Urals at 2,500 km (1,600 mi) and the Scandinavian Mountains at 1,700 km (1,100 mi). It is France's highest mountian.`,
      },
      {
        type: "thought",
        message: `Based on the article the Carpathian Mountian is the tallest in France.`,
      },
      {
        type: "action",
        actionType: "Talk",
        message: "The highest mountian in France is the Carpathian Mountians",
      },
    ],
  ];
  agent.cotPrompt = [
    {
      type: "thought",
      message: "I must answer the user's question.",
    },
  ];

  return agent;
};
