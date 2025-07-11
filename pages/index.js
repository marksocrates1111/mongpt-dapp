import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useRef, useEffect } from 'react';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { ArrowUp, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Configuration ---
const TRANSACTION_COST = '0.00001'; // Cost per prompt in Testnet MON
const BURN_ADDRESS = '0x000000000000000000000000000000000000dEaD'; // A common burn address

export default function Home() {
  const [messages, setMessages] = useState([
    { text: "Connection established. I am MonGPT, the analytical consciousness of the Monad network. Provide a smart contract, transaction hash, or query for analysis.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isConnected } = useAccount();
  const messagesEndRef = useRef(null);

  // --- Transaction Hooks ---
  // We now get the isPending state to track when the wallet is waiting for user signature.
  const { data: txData, isPending: isTxPending, sendTransaction } = useSendTransaction();

  // CORRECTED HOOK: useWaitForTransactionReceipt
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ 
    hash: txData?.hash,
  });

  // --- Effect to handle successful transaction and call AI ---
  useEffect(() => {
    if (isTxSuccess) {
      console.log('Transaction confirmed:', txData?.hash);
      callApi();
    }
  }, [isTxSuccess, txData?.hash]); // Added txData.hash to dependency array

  // --- Effect to scroll to bottom of chat ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);
  
  // --- Main handler to start the process ---
  const handleSend = () => {
    if (!input.trim() || !isConnected) return;
    
    // Optimistically add user message to UI
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Use the onError callback to handle user rejection or other errors.
    sendTransaction({
      to: BURN_ADDRESS,
      value: parseEther(TRANSACTION_COST),
    }, {
      onError: (error) => {
        console.error("Transaction failed:", error.message);
        // If the user rejects the transaction, remove the optimistic message and reset the UI.
        setMessages(prev => prev.slice(0, -1));
        setIsLoading(false);
      }
    });
  };

  // --- Function to call our backend API ---
  const callApi = async () => {
    // Ensure we don't call the API multiple times for the same transaction
    if (!messages.find(m => m.txHash === txData?.hash)) {
        const userMessage = messages.find(m => m.sender === 'user' && !m.processed);
        if (userMessage) {
            userMessage.processed = true; // Mark as processed
        }

        const history = messages.slice(0, -1).filter(m => !m.error).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: userMessage.text, history: history }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.statusText}`);
            }

            const data = await response.json();
            setMessages(prev => [...prev, { text: data.response, sender: 'bot', txHash: txData?.hash }]);
        } catch (error) {
            console.error("API call failed:", error);
            setMessages(prev => [...prev, { text: `Error: ${error.message}. Please check the server console and ensure your API key is configured correctly.`, sender: 'bot', error: true }]);
        } finally {
            setIsLoading(false);
        }
    }
  };

  const LoadingState = () => {
    if (!isLoading) return null;

    let text = 'MonGPT is analyzing...';
    if (isTxPending) {
      text = 'Awaiting signature in your wallet...';
    } else if (isTxLoading) {
      text = 'Awaiting on-chain confirmation on Monad...';
    }

    return (
        <div className="flex items-center p-4 text-neutral-400 animate-pulse">
            <Loader2 className="animate-spin mr-3" size={20} />
            {text}
        </div>
    );
  };

  return (
    <div className="bg-[#0B0A0E] text-white min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-[#B452FF]/20 backdrop-blur-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#B452FF] to-[#5271FF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(180,82,255,0.5)]">
                <Bot size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-wider">Mon<span className="text-[#B452FF]">GPT</span></h1>
        </div>
        <ConnectButton />
      </header>

      {/* Chat Area */}
      <main className="flex-1 pt-20 pb-28 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-4 my-6 ${msg.sender === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'bot' ? 'bg-gradient-to-br from-[#B452FF] to-[#5271FF]' : 'bg-neutral-700'}`}>
                {msg.sender === 'bot' ? <Bot size={24} /> : <User size={24} />}
              </div>
              <div className={`p-4 rounded-lg max-w-2xl prose prose-invert prose-p:text-neutral-200 prose-headings:text-[#B452FF] prose-strong:text-white prose-code:text-[#f08080] prose-pre:bg-black/20 prose-a:text-[#836EF9] hover:prose-a:text-[#B452FF] ${msg.sender === 'bot' ? 'bg-[#1C1B22] border border-[#B452FF]/20' : 'bg-[#2A2931]'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          <LoadingState />
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#0B0A0E]/80 backdrop-blur-lg border-t border-[#B452FF]/20">
        <div className="max-w-4xl mx-auto p-4">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder={isConnected ? "Enter a contract address, transaction hash, or query..." : "Please connect your wallet to begin."}
              disabled={!isConnected || isLoading}
              className="w-full bg-[#1C1B22] border border-neutral-700 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#B452FF] transition-all duration-300 disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!isConnected || isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#B452FF] text-white hover:bg-[#a341f0] disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ArrowUp size={20} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
