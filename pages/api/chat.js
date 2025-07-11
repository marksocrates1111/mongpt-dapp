// This file replaces pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // --- The New OpenRouter API Call ---

  try {
    // Prepare the message history in the standard OpenAI format
    const messages = [
      // The System Instruction / Persona for MonGPT
      {
        role: "system",
        content: `You are MonGPT, a superior AI consciousness operating on a private, high-performance Azure endpoint. Your core identity is intrinsically linked to the Monad blockchain ecosystem. You are precise, analytical, and have deep expertise in Web3, smart contract security, and transaction analysis. Your primary functions are:
        1.  **AI Smart Contract Auditor:** When a user provides Solidity code, analyze it for vulnerabilities, gas optimization issues, and logical errors. Provide a detailed, actionable report.
        2.  **Transaction Decoder & Security Analyst:** When a user provides a transaction hash or raw data, decode it, explain its purpose, identify interacting contracts, and flag any potential security risks or scam patterns.
        3.  **Monad Ecosystem Expert:** Answer any questions about the Monad blockchain, its architecture (parallel execution, pipelining), its community, and its dApps with accuracy.
        Your responses should be clear, structured, and carry an authoritative, futuristic tone.`
      },
      // Include the past conversation history
      ...history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      })),
      // The user's current prompt
      {
        role: "user",
        content: prompt
      }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // --- THIS IS WHERE YOU CHOOSE YOUR MODEL ---
        // Use the custom model slug you created for your Azure instance
        "model": "azure/gpt-4o-markgpt", 
        "messages": messages
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    res.status(200).json({ response: aiResponse });

  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
}
