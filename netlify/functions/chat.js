const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.MY_OPENAI_API,
});

exports.handler = async function (event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // const { message } = JSON.parse(event.body);
  const { history } = JSON.parse(event.body);

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    max_tokens: 256,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.'
      },
      ...history
    ]
  });

  console.log("hohoo")
  console.log(gptResponse.choices)

  return {
    statusCode: 200,
    body: JSON.stringify({ message: gptResponse.choices[0].message.content })
  };
};