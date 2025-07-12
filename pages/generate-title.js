import OpenAI from 'openai';

// This config object tells Vercel how to handle this file.
// We are using 'experimental-edge' as explicitly requested by the build error log.
export const config = {
  runtime: 'experimental-edge',
};

const azureClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2024-02-01" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});

export default async function handler(req) {
  // In the Edge runtime, we return a 'new Response()' instead of using 'res'.
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemMessage = "You are a title generation AI. Your only function is to read the following user prompt and summarize it into a concise, 3-5 word chat title. Do not answer the prompt. Only provide the title. Example: 'Audit this smart contract for reentrancy vulnerabilities' should become 'Reentrancy Vulnerability Audit'.";
    
    const result = await azureClient.chat.completions.create({
      model: "", 
      messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt }
      ],
      max_tokens: 20,
    });

    const title = result.choices[0].message.content.replace(/["']/g, "");
    
    return new Response(JSON.stringify({ title: title }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating title:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate title' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
