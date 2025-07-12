import { useState, useEffect, useRef } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { ArrowUp, Bot, User, Loader2, Zap, Code, HelpCircle, Activity } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- The Main Chat Application Component ---
const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const { address, isConnected } = useAccount();
  const messagesEndRef = useRef(null);

  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  // --- NEW: Load chat history from localStorage when wallet connects ---
  useEffect(() => {
    if (address) {
      const storedMessages = localStorage.getItem(`mongpt_history_${address}`);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      } else {
        setMessages([]); // Start fresh if no history
      }
    } else {
      setMessages([]); // Clear messages if wallet disconnects
    }
  }, [address]);

  // --- NEW: Save chat history to localStorage whenever it changes ---
  useEffect(() => {
    // We only save if there are messages and a wallet is connected.
    if (address && messages.length > 0) {
      localStorage.setItem(`mongpt_history_${address}`, JSON.stringify(messages));
    }
    // Scroll to the bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, address]);

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    setTimeout(() => {
      document.getElementById('send-button').click();
    }, 0);
  };
  
  const handleSend = async (promptOverride) => {
    const currentPrompt = promptOverride || input;
    if (!currentPrompt.trim() || !isConnected || loadingMessage) return;
    
    const userMessage = { text: currentPrompt, sender: 'user' };
    
    const isFirstMessage = messages.length === 0;
    const initialBotMessage = { text: "Connection established. I am MonGPT, the analytical consciousness of the Monad network.", sender: 'bot' };
    
    // Add the initial bot message only if it's the very first interaction
    const newMessages = isFirstMessage ? [initialBotMessage, userMessage] : [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');

    let hash;
    try {
      setLoadingMessage('Awaiting signature in your wallet...');
      hash = await sendTransactionAsync({
        to: '0x000000000000000000000000000000000000dEaD',
        value: parseEther('0.00001'),
      });

      setLoadingMessage('Awaiting on-chain confirmation on Monad...');
      await publicClient.waitForTransactionReceipt({ hash });

      setLoadingMessage('MonGPT is analyzing...');
      await callApi(currentPrompt, newMessages, hash);

    } catch (error) {
      console.error("Process failed:", error.message);
      // Revert the optimistic UI update on failure
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoadingMessage('');
    }
  };

  const callApi = async (prompt, currentMessages, txHash) => {
    const history = currentMessages.filter(m => !m.error).map(msg => ({
        sender: msg.sender,
        text: msg.text
    }));

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt, history: history }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.statusText}`);
        }

        const data = await response.json();
        setMessages(prev => [...prev, { text: data.response, sender: 'bot', txHash: txHash }]);
    } catch (error) {
        console.error("API call failed:", error);
        setMessages(prev => [...prev, { text: `Error: ${error.message}. Please check the server console.`, sender: 'bot', error: true }]);
    }
  };

  const predefinedQueries = [
    { text: "What is MonGPT?", icon: <HelpCircle size={24} /> },
    { text: "What is Monad?", icon: <Zap size={24} /> },
    { text: "Audit a simple smart contract for reentrancy", icon: <Code size={24} /> },
    { text: "How are you doing MonGPT?", icon: <Activity size={24} /> },
  ];

  return (
    <div className="bg-[#0B0A0E] text-white min-h-screen flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 border-b border-[#B452FF]/20 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-3">
            <img src="/logo-mark.png" alt="MonGPT Logo" className="w-8 h-8"/>
            <h1 className="text-xl font-bold tracking-wider">Mon<span className="text-[#B452FF]">GPT</span></h1>
        </div>
        <ConnectButton />
      </header>

      <main className="flex-1 flex flex-col pt-20 pb-28">
        {messages.length === 0 ? (
          // --- EMPTY STATE UI ---
          <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
            <div className="flex items-center gap-4 mb-4">
              <img src="/logo-mark.png" alt="MonGPT Logo" className="w-20 h-20"/>
            </div>
            <h2 className="text-4xl font-bold flex items-center gap-3">
              Henlo, Gmonad!
              <img src="https://cdn.discordapp.com/emojis/1142237919101321276.webp?size=40" alt="gmonad emoji" className="w-10 h-10"/>
            </h2>
            <p className="text-neutral-400 mt-2 text-lg">What's on your mind?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-4xl">
              {predefinedQueries.map((query, index) => (
                <button 
                  key={index} 
                  onClick={() => handlePromptClick(query.text)}
                  className="bg-[#1C1B22] border border-neutral-700 rounded-lg p-4 text-left hover:bg-[#2A2931] transition-colors duration-200 flex items-center gap-4"
                >
                  <div className="text-[#B452FF]">{query.icon}</div>
                  <span className="text-neutral-200">{query.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // --- CHAT LOG UI ---
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-4 my-6 ${msg.sender === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'bot' ? 'bg-gradient-to-br from-[#B452FF] to-[#5271FF]' : 'bg-neutral-700'}`}>
                    {msg.sender === 'bot' ? <img src="/logo-mark.png" alt="MonGPT Avatar" className="w-6 h-6" /> : <User size={24} />}
                  </div>
                  <div className={`p-4 rounded-lg max-w-2xl prose prose-invert prose-p:text-neutral-200 prose-headings:text-[#B452FF] prose-strong:text-white prose-code:text-[#f08080] prose-pre:bg-black/20 prose-a:text-[#836EF9] hover:prose-a:text-[#B452FF] ${msg.sender === 'bot' ? 'bg-[#1C1B22] border border-[#B452FF]/20' : 'bg-[#2A2931]'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loadingMessage && (
                <div className="flex items-center p-4 text-neutral-400 animate-pulse">
                  <Loader2 className="animate-spin mr-3" size={20} />
                  {loadingMessage}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-[#0B0A0E]/80 backdrop-blur-lg border-t border-[#B452FF]/20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !loadingMessage && handleSend()}
              placeholder={isConnected ? "Enter a contract address, transaction hash, or query..." : "Please connect your wallet to begin."}
              disabled={!isConnected || !!loadingMessage}
              className="w-full bg-[#1C1B22] border border-neutral-700 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#B452FF] transition-all duration-300 disabled:opacity-50"
            />
            <button
              id="send-button"
              onClick={() => handleSend()}
              disabled={!isConnected || !!loadingMessage || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#B452FF] text-white hover:bg-[#a341f0] disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- This is the main component that controls the flow ---
export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);

  const handleIntroFinish = () => {
    setIntroFinished(true);
  };

  return (
    <div>
      {introFinished ? (
        <ChatInterface />
      ) : (
        <CinematicIntro onFinished={handleIntroFinish} />
      )}
    </div>
  );
}
