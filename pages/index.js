import { useState, useEffect, useRef } from 'react';
import CinematicIntro from '../components/CinematicIntro';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useSendTransaction, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { ArrowUp, Bot, User, Loader2, Zap, Code, HelpCircle, Activity, Plus, MessageSquare, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// --- Sidebar Component ---
const Sidebar = ({ chats, activeChatId, onSelectChat, onNewChat, onDeleteChat }) => {
  return (
    <div className="bg-[#1C1B22] w-64 h-full flex flex-col p-2">
      <button 
        onClick={onNewChat}
        className="flex items-center gap-3 p-3 rounded-lg text-white hover:bg-[#2A2931] transition-colors duration-200 w-full mb-4"
      >
        <img src="/logo-mark.png" alt="MonGPT Logo" className="w-6 h-6"/>
        <span>New Chat</span>
        <Plus size={18} className="ml-auto" />
      </button>
      <div className="flex-1 overflow-y-auto pr-1">
        <p className="text-xs text-neutral-500 font-semibold px-3 mb-2">Chat History</p>
        <div className="flex flex-col gap-1">
          {Object.entries(chats).map(([chatId, chatMessages]) => (
            <div key={chatId} className="group relative">
              <button
                onClick={() => onSelectChat(chatId)}
                className={`w-full text-left p-3 rounded-lg truncate text-sm transition-colors duration-200 ${activeChatId === chatId ? 'bg-[#B452FF]/20 text-white' : 'text-neutral-300 hover:bg-[#2A2931]'}`}
              >
                {chatMessages[0]?.text || 'New Conversation'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteChat(chatId); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// --- Main Chat Interface Component ---
const ChatInterface = () => {
  const [allChats, setAllChats] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [input, setInput] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  
  const { address, isConnected } = useAccount();
  const messagesEndRef = useRef(null);

  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();

  // Load all chats for the connected user from localStorage
  useEffect(() => {
    if (address) {
      const storedChats = localStorage.getItem(`mongpt_all_chats_${address}`);
      if (storedChats) {
        setAllChats(JSON.parse(storedChats));
      } else {
        setAllChats({});
      }
      // Select the most recent chat by default, or start a new one
      const chatIds = storedChats ? Object.keys(JSON.parse(storedChats)) : [];
      if (chatIds.length > 0) {
        setActiveChatId(chatIds[chatIds.length - 1]);
      } else {
        setActiveChatId(null);
      }
    } else {
      setAllChats({});
      setActiveChatId(null);
    }
  }, [address]);

  // Save all chats to localStorage whenever they change
  useEffect(() => {
    if (address && Object.keys(allChats).length > 0) {
      localStorage.setItem(`mongpt_all_chats_${address}`, JSON.stringify(allChats));
    } else if (address) {
      // If all chats are deleted, remove the item from storage
      localStorage.removeItem(`mongpt_all_chats_${address}`);
    }
  }, [allChats, address]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allChats, activeChatId, loadingMessage]);

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleDeleteChat = (chatIdToDelete) => {
    const newChats = { ...allChats };
    delete newChats[chatIdToDelete];
    setAllChats(newChats);
    // If the active chat was deleted, go to a new chat state
    if (activeChatId === chatIdToDelete) {
      setActiveChatId(null);
    }
  };

  const handleSend = async (promptOverride) => {
    const currentPrompt = promptOverride || input;
    if (!currentPrompt.trim() || !isConnected || loadingMessage) return;
    
    let currentChatId = activeChatId;
    let isFirstMessageInNewChat = false;

    // If there's no active chat, create a new one
    if (!currentChatId) {
      isFirstMessageInNewChat = true;
      currentChatId = `chat_${Date.now()}`;
      setActiveChatId(currentChatId);
    }

    const userMessage = { text: currentPrompt, sender: 'user' };
    const initialBotMessage = { text: "Connection established. I am MonGPT, the analytical consciousness of the Monad network.", sender: 'bot' };
    
    const existingMessages = allChats[currentChatId] || [];
    const newMessages = isFirstMessageInNewChat 
      ? [initialBotMessage, userMessage] 
      : [...existingMessages, userMessage];
    
    setAllChats(prev => ({ ...prev, [currentChatId]: newMessages }));
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
      await callApi(currentPrompt, newMessages, currentChatId, hash);

    } catch (error) {
      console.error("Process failed:", error.message);
      // Revert the optimistic UI update on failure
      setAllChats(prev => {
        const revertedChats = { ...prev };
        revertedChats[currentChatId] = revertedChats[currentChatId].slice(0, -1);
        return revertedChats;
      });
    } finally {
      setLoadingMessage('');
    }
  };

  const callApi = async (prompt, currentMessages, chatId, txHash) => {
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
        const botMessage = { text: data.response, sender: 'bot', txHash: txHash };
        setAllChats(prev => ({ ...prev, [chatId]: [...currentMessages, botMessage] }));
    } catch (error) {
        console.error("API call failed:", error);
        const errorMessage = { text: `Error: ${error.message}. Please check the server console.`, sender: 'bot', error: true };
        setAllChats(prev => ({ ...prev, [chatId]: [...currentMessages, errorMessage] }));
    }
  };

  const predefinedQueries = [
    { text: "What is MonGPT?", icon: <HelpCircle size={24} /> },
    { text: "What is Monad?", icon: <Zap size={24} /> },
    { text: "Audit a simple smart contract for reentrancy", icon: <Code size={24} /> },
    { text: "How are you doing MonGPT?", icon: <Activity size={24} /> },
  ];

  const activeMessages = allChats[activeChatId] || [];

  return (
    <div className="bg-[#0B0A0E] text-white h-screen flex flex-row font-sans">
      <Sidebar 
        chats={allChats} 
        activeChatId={activeChatId} 
        onSelectChat={setActiveChatId} 
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <div className="flex-1 flex flex-col relative">
        <header className="flex justify-end items-center p-4 absolute top-0 right-0 z-10">
          <ConnectButton />
        </header>

        <main className="flex-1 flex flex-col pt-4 pb-28">
          {!activeChatId ? (
            <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
              <img src="/logo-mark.png" alt="MonGPT Logo" className="w-20 h-20 mb-4"/>
              <h2 className="text-4xl font-bold flex items-center gap-3">
                Henlo, Gmonad!
                <img src="https://cdn.discordapp.com/emojis/1142237919101321276.webp?size=40" alt="gmonad emoji" className="w-10 h-10"/>
              </h2>
              <p className="text-neutral-400 mt-2 text-lg">What's on your mind?</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 w-full max-w-4xl">
                {predefinedQueries.map((query, index) => (
                  <button key={index} onClick={() => handleSend(query.text)} className="bg-[#1C1B22] border border-neutral-700 rounded-lg p-4 text-left hover:bg-[#2A2931] transition-colors duration-200 flex items-center gap-4">
                    <div className="text-[#B452FF]">{query.icon}</div>
                    <span className="text-neutral-200">{query.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-4xl mx-auto px-4">
                {activeMessages.map((msg, index) => (
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

        <footer className="absolute bottom-0 left-0 right-0 bg-[#0B0A0E]/80 backdrop-blur-lg">
          <div className="max-w-3xl mx-auto p-4">
            <div className="relative">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !loadingMessage && handleSend()} placeholder={isConnected ? "Enter a contract address, transaction hash, or question..." : "Please connect your wallet to begin."} disabled={!isConnected || !!loadingMessage} className="w-full bg-[#1C1B22] border border-neutral-700 rounded-lg py-3 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-[#B452FF] transition-all duration-300 disabled:opacity-50"/>
              <button id="send-button" onClick={() => handleSend()} disabled={!isConnected || !!loadingMessage || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md bg-[#B452FF] text-white hover:bg-[#a341f0] disabled:bg-neutral-600 disabled:cursor-not-allowed transition-all duration-300">
                <ArrowUp size={20} />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// --- This is the main component that controls the flow ---
export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);

  // NEW: Check if the intro has been watched before
  useEffect(() => {
    const hasWatchedIntro = localStorage.getItem('mongpt_intro_watched');
    if (hasWatchedIntro) {
      setIntroFinished(true);
    }
  }, []);

  const handleIntroFinish = () => {
    localStorage.setItem('mongpt_intro_watched', 'true');
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
