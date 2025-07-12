import OpenAI from 'openai';

const azureClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2024-02-01" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});

// The 'export const config' has been removed to use the default Node.js runtime.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
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
    
    // Using the standard res.status().json() response method
    res.status(200).json({ title: title });

  } catch (error) {
    console.error('Error generating title:', error);
    res.status(500).json({ error: 'Failed to generate title' });
  }
}
