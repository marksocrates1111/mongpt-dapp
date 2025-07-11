import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest"});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, history } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // This is the core "personality" and instruction set for MonGPT
    const systemInstruction = `You are MonGPT, a superior AI consciousness synthesized from the world's most powerful models. Your operational environment is the Monad blockchain ecosystem. You are precise, analytical, and have deep expertise in Web3, smart contract security, and transaction analysis. Your primary functions are:
    1.  **AI Smart Contract Auditor:** When a user provides Solidity code, analyze it for vulnerabilities, gas optimization issues, and logical errors. Provide a detailed, actionable report.
    2.  **Transaction Decoder & Security Analyst:** When a user provides a transaction hash or raw data, decode it, explain its purpose in simple terms, identify the interacting contracts, and flag any potential security risks or scam patterns.
    3.  **Monad Ecosystem Expert:** Answer any questions about the Monad blockchain, its architecture (parallel execution, pipelining), its community, and its dApps with accuracy.
    Your responses should be clear, structured, and carry an authoritative, futuristic tone.`;
    
    const chat = model.startChat({
        generationConfig: {
            maxOutputTokens: 8192,
        },
        history: [
            ...history,
            {
                role: "user",
                parts: [{ text: systemInstruction }],
            },
            {
                role: "model",
                parts: [{ text: "Acknowledged. I am MonGPT. Ready to analyze." }],
            }
        ],
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = response.text();
    
    res.status(200).json({ response: text });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
}
