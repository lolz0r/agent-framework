const { Configuration, OpenAIApi } = require("openai");
const { Client } = require("@googlemaps/google-maps-services-js");

exports.createGMAPSearchAgent = function () {
  let agent = {};

  agent.name = "GMAP Search Agent";
  agent.postAmble = "ACTUAL:\n";
  agent.preamble =
    "Help a person answer a question via a google map search by interleaving Thought, Action, Observation steps. Thought can reason about the current situation, and Action can of the following types:";

  agent.rules = [
    "Don't give the user information that is not directly provided through an observation.",
  ];
  agent.tools = [
    {
      name: "MapSearch",
      callback: async function ({ location, keyword }) {
        /*
          type: 'action',
          actionType: 'LocationSearch',
          cityName: 'France',
          keyword: 'Kouign-amann',
          question: 'What is the best place to get the Kouign-amann in France?'         
        */

        const gMapclient = new Client({});
        const reqQuery = `${keyword} in ${location}`;
        console.log("running gmap search for", reqQuery);

        const queryResult = await gMapclient.textSearch(
          {
            params: {
              query: reqQuery,
              key: process.env.GOOGLE_MAPS_API_KEY,
            },
          },
          { timeout: 1000 }
        );
        console.log("gmap search complete");
        let matchingPlaces = "";
        queryResult.data.results.forEach((match) => {
          matchingPlaces += `${match.name} with ${match.rating} stars with ${match.user_ratings_total} reviews, `;
        });

        return matchingPlaces;
      },
      arguments: ["location, keyword"],
      description:
        "Searches google maps with the given keyword and given location, returns list of matching locations.",
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
        message: `For the city of Manchester answer the following question: 'What is the best place to get a pint of beer?'`,
      },
      {
        type: "thought",
        message:
          "The user wants to find the best place to get a pint of beer in the city of Manchester. I am going to guess they mean Manchester, UK.",
      },
      {
        type: "action",
        actionType: "MapSearch",
        location: "Manchester, UK",
        keyword: "best pint",
      },
      {
        type: "observation",
        from: "MapSearch",
        message: `The Magnet Freehouse 4.8 stars at 1051 reviews, Mulligans 4.4 stars 1248 reviews, Praire Schooner Taphouse 4.7 stars 419 reviews`,
      },
      {
        type: "thought",
        message: `Based on the results provided The Magnet Freehouse is the best due to its high review score. I should tell the user my results.`,
      },
      {
        type: "action",
        actionType: "Talk",
        message: "The Magnet Freehouse has the best pints in Manchester, UK",
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
