const OpenAI = require('openai');

// Initialize OpenAI with error handling
let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.MY_OPENAI_API,
  });
} catch (error) {
  console.error('OpenAI initialization error:', error);
}

// CORS headers for better compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

exports.handler = async function (event, context) {
  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // Check if OpenAI is properly initialized
  if (!openai) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "OpenAI API not configured" })
    };
  }

  try {
    // Parse and validate request body
    const body = JSON.parse(event.body);
    const { message, history = [] } = body;

    // Validate required fields
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Message is required and must be a non-empty string" })
      };
    }

    // Validate history format
    if (!Array.isArray(history)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: "History must be an array" })
      };
    }

    // Create messages array with system prompt
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Provide clear, concise, and accurate responses.'
      },
      ...history,
      {
        role: 'user',
        content: message.trim()
      }
    ];

    // Call OpenAI API with increased token limit for more complete responses
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      max_tokens: 1024, // Increased from 256 for more complete responses
      temperature: 0.7,
      messages: messages
    });

    const aiMessage = gptResponse.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from OpenAI');
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        message: aiMessage,
        usage: gptResponse.usage // Include usage stats for monitoring
      })
    };

  } catch (error) {
    console.error('Chat function error:', error);
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ error: "API quota exceeded. Please try again later." })
      };
    }
    
    if (error.code === 'rate_limit_exceeded') {
      return {
        statusCode: 429,
        headers: corsHeaders,
        body: JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." })
      };
    }

    // Generic error response
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: "Sorry, I'm having trouble processing your request. Please try again." 
      })
    };
  }
};