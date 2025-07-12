import { useState, useEffect, useRef } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { ArrowUp, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- The Main Chat Application Component ---
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: "Connection established. I am MonGPT, the analytical consciousness of the Monad network. Provide a smart contract, transaction hash, or query for analysis.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const { isConnected } = useAccount();
  const messagesEndRef = useRef(null);

  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessage]);
  
  const handleSend = async () => {
    if (!input.trim() || !isConnected || loadingMessage) return;
    
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
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
      await callApi(currentInput, hash);

    } catch (error) {
      console.error("Process failed:", error.message);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoadingMessage('');
    }
  };

  const callApi = async (prompt, txHash) => {
    const history = messages.filter(m => !m.error).map(msg => ({
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

  const LoadingState = () => {
    if (!loadingMessage) return null;
    return (
        <div className="flex items-center p-4 text-neutral-400 animate-pulse">
            <Loader2 className="animate-spin mr-3" size={20} />
            {loadingMessage}
        </div>
    );
  };

  return (
    <div className="bg-[#0B0A0E] text-white min-h-screen flex flex-col font-sans">
      <header className="flex justify-between items-center p-4 border-b border-[#B452FF]/20 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-3">
            {/* UPDATED: Using an img tag for the header logo */}
            <img src="/logo-mark-transparent.png" alt="MonGPT Logo" className="w-8 h-8"/>
            <h1 className="text-xl font-bold tracking-wider">Mon<span className="text-[#B452FF]">GPT</span></h1>
        </div>
        <ConnectButton />
      </header>

      <main className="flex-1 pt-20 pb-28 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 my-6 ${msg.sender === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'bot' ? 'bg-gradient-to-br from-[#B452FF] to-[#5271FF]' : 'bg-neutral-700'}`}>
                {/* UPDATED: Replaced the Bot icon with your custom logo */}
                {msg.sender === 'bot' ? <img src="/logo-mark.png" alt="MonGPT Avatar" className="w-6 h-6" /> : <User size={24} />}
              </div>
              <div className={`p-4 rounded-lg max-w-2xl prose prose-invert prose-p:text-neutral-200 prose-headings:text-[#B452FF] prose-strong:text-white prose-code:text-[#f08080] prose-pre:bg-black/20 prose-a:text-[#836EF9] hover:prose-a:text-[#B452FF] ${msg.sender === 'bot' ? 'bg-[#1C1B22] border border-[#B452FF]/20' : 'bg-[#2A2931]'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          <LoadingState />
          <div ref={messagesEndRef} />
        </div>
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
              onClick={handleSend}
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
