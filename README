# Neural Agent Framework

This is a framework for running neural, tool based agents via the ReAct paradigm. It provides an example of such an agent in the form of a 'Virtual Travel Agent'.

[Running example of the agent](https://travelai-demo.web.app/).

The virtual travel agent is contained within the endpoint specified in the index.js (see the file for detail)

To run you will need API KEYS for openAI and google maps, within the environment variables OPENAI_API_KEY and GOOGLE_MAPS_API_KEY

One the environment variables are in place you should be able to run the script with a few simple commands:
`npm install
node index.js`
This should launch the endpoint on port 3000, where upon you can POST userReply's and pass logs to/from the agent.

# Virtual Travel Agent

The Virtual Travel Agent (VTA) is an example neural agent built on this framework. It utilizes a number of tools, which are themselves neural agents (sub-agents). The sub-agents then in turn call the actual external APIS (google maps, wikipedia) to help anwswer the primary agent's questions.

The endpoint is setup to expect a 'log', which is a record of all the turns between the agent and human, as well as any internal 'thoughts' and 'observations' the agent has along the way. A request payload to the endpoint can look something like this:

`{"data":{"userReply":"I want to surf and maybe just sit in the sun","agentLog":[{"type":"thought","message":"I need to determine where the user wants to go and what they want to do"},{"type":"action","actionType":"talk","message":"I am a friendly virtual travel agent, how can I help you?"},{"type":"observation","from":"user","message":"Hi, I am thinking about traveling to a warm sandy beach. "},{"type":"thought","message":"The user wants to visit a warm sandy beach. I should ask more specific questions to determine a possible locale."},{"type":"action","actionType":"talk","message":"What type of activities do you want to do while you are there?"}]}}`

Generally when interacting with humans the human's "response" will be in the userReply.
The end point should return an updated log containing the new observations/thoughts/actions of the agent, as well as all the previous log elements. In this way the context is passed between the human and agent.

# Agent - General

To define an agent it is best to start from an existing agent specs, such as the 'gmapSearchAgent'. Generally you need to provide a name, description, a list of every tool available to the agent, and examples of how the agent works in practice.

# Agent - Tools

One of the defining features of this framework is the tool usage. Tools can multiple arguments, and can optionally 'parse' results. Architecturally speaking it is better to have the actual tool usage agent be a sub-agent, as it will keep the context from getting too large.
