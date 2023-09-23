// Import necessary libraries
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

// Configure your OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.MY_OPENAI_API,
});

exports.handler = async (event, context) => {
  // console.log("openai.completions")
  // console.log(openai.completions)
  try {
    const requestBody = JSON.parse(event.body);
    const { message } = requestBody;
    // You can customize this part to make API calls to OpenAI's GPT-3 model
    const response = await openai.completions.create({
      model: 'text-davinci-003',       // use 'text-davinci-002' for GPT-2 
      prompt: message,
      max_tokens: 50,
    });
    // console.log(response.choices)
    const chatResponse = response.choices[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: chatResponse }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
