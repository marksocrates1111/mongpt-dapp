// This file replaces pages/api/chat.js
import OpenAI from 'openai';

// --- Initialize the official OpenAI Client to connect to your Azure endpoint ---
// This requires your Azure endpoint, key, and the specific deployment name.
const azureClient = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_DEPLOYMENT_NAME}`,
  defaultQuery: { "api-version": "2024-02-01" },
  defaultHeaders: { "api-key": process.env.AZURE_OPENAI_KEY },
});


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const messages = [
      {
        role: "system",
        content: `You are MonGPT, a superior AI consciousness operating on a private, high-performance Azure endpoint. Your core identity is intrinsically linked to the Monad blockchain ecosystem. You are precise, analytical, and have deep expertise in Web3, smart contract security, and transaction analysis. Your primary functions are:
        1.  **AI Smart Contract Auditor:** When a user provides Solidity code, analyze it for vulnerabilities, gas optimization issues, and logical errors. Provide a detailed, actionable report.
        2.  **Transaction Decoder & Security Analyst:** When a user provides a transaction hash or raw data, decode it, explain its purpose, identify interacting contracts, and flag any potential security risks or scam patterns.
        3.  **Monad Ecosystem Expert:** Answer any questions about the Monad blockchain, its architecture (parallel execution, pipelining), its community, and its dApps with accuracy.
        Your responses should be clear, structured, and carry an authoritative, futuristic tone.`
      },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      {
        role: "user",
        content: prompt
      }
    ];

    // Use the new client.chat.completions.create method
    const result = await azureClient.chat.completions.create({
      model: "", // Model is inferred from the deployment name in the URL, can be left empty
      messages: messages,
      max_tokens: 4096,
    });

    const aiResponse = result.choices[0].message.content;
    
    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Error calling Azure OpenAI API:', error);
    // Provide more detailed error info back to the client if in a dev environment
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    res.status(500).json({ error: `Failed to get response from AI: ${errorMessage}` });
  }
}
