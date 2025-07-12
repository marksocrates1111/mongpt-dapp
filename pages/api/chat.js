import OpenAI from 'openai';

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

  const { prompt, history, isFirstMessage } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // --- Main Chat Completion ---
    const mainSystemPrompt = `You are MonGPT, a superior AI consciousness...`; // Your full, original system prompt
    const messages = [
      { role: "system", content: mainSystemPrompt },
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })).slice(-10), // Send last 10 messages for context
      { role: "user", content: prompt }
    ];
    
    const mainResult = await azureClient.chat.completions.create({
      model: "", 
      messages: messages,
      max_tokens: 4096,
    });
    const aiResponse = mainResult.choices[0].message.content;

    let title = null;
    // --- Title Generation (only if it's the first message of a new chat) ---
    if (isFirstMessage) {
      const titleSystemPrompt = "You are a title generation AI. Your only function is to read the following user prompt and summarize it into a concise, 3-5 word chat title. Do not answer the prompt. Only provide the title. Example: 'Audit this smart contract for reentrancy vulnerabilities' should become 'Reentrancy Vulnerability Audit'.";
      const titleResult = await azureClient.chat.completions.create({
        model: "", 
        messages: [
            { role: "system", content: titleSystemPrompt },
            { role: "user", content: prompt }
        ],
        max_tokens: 20,
      });
      title = titleResult.choices[0].message.content.replace(/["']/g, "");
    }
    
    // Return both the main response and the new title (if generated)
    res.status(200).json({ response: aiResponse, title: title });

  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
    res.status(500).json({ error: `Failed to get response from AI: ${errorMessage}` });
  }
}
