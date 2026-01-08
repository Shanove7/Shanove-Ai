import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Copy, Check, Sun, Moon, Trash2, StopCircle, User, Lock, Mail, ArrowRight, KeyRound, Loader2, Image as ImageIcon, Upload, MoreVertical, Bug, Smartphone, Globe } from 'lucide-react';

// --- CONFIGURATION ---
// KOSONGKAN INI agar otomatis ikut domain Vercel (ai.shanove.my.id)
const BACKEND_URL = ""; 

const CEREBRAS_API_KEY = "csk-mwxrfk94v8txn2nw2ym538hk38j6cm9vketfxrd9xcf6jc4t";
const CEREBRAS_MODEL_ID = "qwen-3-235b-a22b-instruct-2507";

const EMAIL_CONFIG = {
    SERVICE_ID: "service_rlpso0c",
    TEMPLATE_ID: "template_6ylv3rq",
    PUBLIC_KEY: "0eVdYs-0usPaFRNPf"
};

const APP_INFO = {
    name: "Shanove AI",
    version: "v12.0 Final",
    logo_url: "https://via.placeholder.com/150/5436DA/FFFFFF?text=S", 
};

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
Nama: Shanove AI.
Sifat: Professional Developer.
Gaya: Singkat, Padat, Kode Valid.
`;

// --- UTILS ---
const highlightSyntax = (code) => {
  let colored = code
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\b(const|let|var|function|return|if|else|import|from|async|await|try|catch|class|export|default)\b/g, '<span style="color: #c678dd; font-weight: bold;">$1</span>')
    .replace(/\b(console|log|document|window)\b/g, '<span style="color: #61afef;">$1</span>')
    .replace(/(['"`])(.*?)\1/g, '<span style="color: #98c379;">$&</span>')
    .replace(/\/\/.*$/gm, '<span style="color: #5c6370; font-style: italic;">$&</span>');
  return <div dangerouslySetInnerHTML={{ __html: colored }} />;
};

// --- COMPONENTS ---

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="w-full my-4 rounded-md overflow-hidden font-mono text-sm border border-white/10 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2f2f2f] text-gray-200 select-none">
        <span className="text-xs text-gray-400 font-sans">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
          {copied ? <Check size={14} /> : <Copy size={14} />} <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="bg-black p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-[13px] leading-6 font-mono text-[#abb2bf] whitespace-pre">{highlightSyntax(code)}</pre>
      </div>
    </div>
  );
};

const MessageItem = ({ role, content, image, isDark }) => {
  const isUser = role === 'user';
  const safeContent = content || "";
  const parts = safeContent.split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 md:px-0`}>
      <div className={`flex w-full max-w-3xl gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isUser ? 'bg-transparent' : (isDark ? 'bg-green-500/10' : 'bg-black')}`}>
          {isUser ? 
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-[#5436DA]' : 'bg-black'}`}><User size={16} className="text-white" /></div> : 
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500' : 'bg-white'}`}><Zap size={14} className={isDark ? "text-white" : "text-black"} fill="currentColor" /></div>
          }
        </div>

        <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-[15px] leading-7 ${isUser ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-[#f4f4f4] text-gray-800') + ' py-2.5 px-5 rounded-3xl' : (isDark ? 'text-gray-100' : 'text-gray-800') + ' w-full'}`}>
             {!isUser && <div className="font-semibold text-sm mb-1 opacity-90 select-none">Shanove AI</div>}
             {image && (
                <div className="mb-4 mt-2 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                    <img src={image} alt="Generated" className="w-full h-auto object-cover max-h-[400px]" />
                </div>
             )}
             {parts.map((part, index) => {
               if (index % 3 === 0 && part.trim()) return <p key={index} className="whitespace-pre-wrap break-words mb-3 last:mb-0">{part}</p>;
               if (index % 3 === 2) return <CodeBlock key={index} language={parts[index - 1]} code={part} />;
               return null;
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthModal = ({ isOpen, onClose, onLogin, isDark }) => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const code = generateOTP();
    setServerOtp(code);

    // Kirim OTP via EmailJS
    const data = {
      service_id: EMAIL_CONFIG.SERVICE_ID,
      template_id: EMAIL_CONFIG.TEMPLATE_ID,
      user_id: EMAIL_CONFIG.PUBLIC_KEY,
      template_params: { to_email: email, otp_code: code, reply_to: 'no-reply@shanove.ai', from_name: APP_INFO.name }
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) setStep('otp');
      else throw new Error("Gagal kirim email");
    } catch (err) { setError('Gagal mengirim email.'); } finally { setLoading(false); }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (inputOtp === serverOtp) onLogin();
    else setError('Kode OTP salah!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden ${isDark ? 'bg-[#1e1e1e] border border-gray-700' : 'bg-white'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><Trash2 size={18}/></button>
        <div className="text-center mb-6">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}><Lock size={20}/></div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{step === 'email' ? 'Akses Terbatas' : 'Verifikasi OTP'}</h2>
        </div>
        {step === 'email' ? (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" className={`w-full py-3 px-4 rounded-xl border outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 text-gray-900'}`} />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#5436DA] text-white rounded-xl flex justify-center items-center gap-2">{loading ? <Loader2 className="animate-spin"/> : 'Kirim Kode'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input type="text" required value={inputOtp} onChange={e => setInputOtp(e.target.value)} placeholder="Kode OTP" maxLength={6} className={`w-full py-3 px-4 rounded-xl border outline-none tracking-widest ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 text-gray-900'}`} />
            <button type="submit" className="w-full py-3 bg-green-600 text-white rounded-xl">Verifikasi</button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Halo! Saya **${APP_INFO.name}**. \nPilih model di menu kanan bawah (titik tiga).` }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  
  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('shanove_logged_in') === 'true';
    return false;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const FREE_LIMIT = 2;

  // Model State
  const [model, setModel] = useState('shanove'); 
  const [showMenu, setShowMenu] = useState(false);
  
  // Nano Specific
  const [selectedImage, setSelectedImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  const switchModel = (m) => {
      setModel(m);
      setShowMenu(false);
      setMessages(prev => [...prev, { role: 'system', content: `🔄 Mode changed to: **${m.toUpperCase()}**` }]);
      if(m !== 'nano') { setSelectedImage(null); setPreviewUrl(null); }
  };

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      switchModel('nano'); 
    }
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('shanove_logged_in', 'true');
    setShowAuthModal(false);
    alert("Login Sukses! Akses Unlimited.");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Check Login State Directly
    const userIsPro = isLoggedIn || localStorage.getItem('shanove_logged_in') === 'true';

    if (!userIsPro && msgCount >= FREE_LIMIT) { setShowAuthModal(true); return; }

    const text = input;
    if (model === 'nano' && !selectedImage) { alert("Upload gambar dulu untuk mode Nano!"); return; }

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text, image: (model === 'nano' ? previewUrl : null) }]);
    if(!userIsPro) setMsgCount(prev => prev + 1);
    setIsLoading(true);

    try {
        let reply = "";
        let imgResult = null;

        if (model === 'shanove') {
            const payload = {
                model: CEREBRAS_MODEL_ID,
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-5), { role: "user", content: text }],
                max_completion_tokens: 1000
            };
            const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST', headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            reply = data.choices[0].message.content;

        } else if (model === 'worm') {
            // CALL BACKEND (/api/worm)
            const res = await fetch(`${BACKEND_URL}/api/worm`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: text })
            });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            reply = "🐛 **WormGPT:**\n" + data.result;

        } else if (model === 'nano') {
            // CALL BACKEND (/api/nano)
            const formData = new FormData();
            formData.append('prompt', text);
            formData.append('image', selectedImage);
            
            const res = await fetch(`${BACKEND_URL}/api/nano`, { method: 'POST', body: formData });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            
            reply = "🍌 **Nano Banana Result:**";
            imgResult = data.result;
            setSelectedImage(null); setPreviewUrl(null);
        }

        setMessages(prev => [...prev, { role: 'assistant', content: reply, image: imgResult }]);

    } catch (err) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-[100dvh] font-sans transition-colors duration-300 ${isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-800'}`}>
      
      {/* Header */}
      <header className={`flex items-center justify-between p-3 sticky top-0 z-10 border-b ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-gray-100'}`}>
         <div className="flex items-center gap-2 px-2">
            <div>
                <h1 className="font-bold text-lg leading-tight">{APP_INFO.name}</h1>
                <div className={`text-[10px] font-mono opacity-60`}>{isLoggedIn ? 'PREMIUM' : 'FREE TIER'}</div>
            </div>
         </div>
         <div className="flex gap-2">
             <button onClick={() => setMessages([messages[0]])} className="p-2 rounded hover:bg-white/5"><Trash2 size={20} className="text-gray-400"/></button>
             <button onClick={() => setIsDark(!isDark)} className="p-2 rounded hover:bg-white/5">{isDark ? <Sun size={20} className="text-gray-400"/> : <Moon size={20} className="text-gray-600"/>}</button>
         </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto w-full custom-scrollbar">
        <div className="flex flex-col items-center w-full pb-32 pt-4">
           {messages.map((msg, idx) => <MessageItem key={idx} role={msg.role} content={msg.content} image={msg.image} isDark={isDark} />)}
           {isLoading && <div className="w-full max-w-3xl px-4 flex gap-4 animate-pulse"><div className="w-8 h-8 rounded-full bg-gray-500/20"></div><div className="h-8 bg-gray-500/20 rounded-full w-24"></div></div>}
           <div ref={bottomRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className={`w-full fixed bottom-0 left-0 p-4 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto relative">
          
          {showMenu && (
              <div className={`absolute bottom-full right-0 mb-2 w-48 rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="p-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Select Model</div>
                  <button onClick={() => switchModel('shanove')} className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 ${model==='shanove' ? 'text-green-500' : ''}`}><Zap size={16}/> Shanove (Fast)</button>
                  <button onClick={() => switchModel('worm')} className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 ${model==='worm' ? 'text-red-500' : ''}`}><Bug size={16}/> WormGPT (Uncensored)</button>
                  <button onClick={() => document.getElementById('imgUpload').click()} className={`w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-white/5 ${model==='nano' ? 'text-yellow-500' : ''}`}><ImageIcon size={16}/> Nano Banana</button>
              </div>
          )}

          <input id="imgUpload" type="file" onChange={handleImageSelect} accept="image/*" className="hidden" />

          <form onSubmit={handleSend} className={`flex items-center gap-2 p-2 rounded-2xl border shadow-lg ${isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
             
             <div className="pl-2 text-gray-400">
                 {model === 'nano' ? (selectedImage ? <img src={previewUrl} className="w-6 h-6 rounded object-cover border border-green-500"/> : <Upload size={20} className="text-yellow-500"/>) : 
                  model === 'worm' ? <Bug size={20} className="text-red-500"/> : 
                  <Zap size={20} className="text-green-500"/>}
             </div>

             <input
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 placeholder={model === 'nano' ? "Prompt gambar..." : model === 'worm' ? "Ask WormGPT..." : "Message Shanove..."}
                 className="flex-1 bg-transparent px-2 py-2 outline-none text-sm md:text-base"
                 disabled={isLoading}
             />

             <button type="submit" disabled={!input.trim() || isLoading} className={`p-2 rounded-xl transition-all ${input.trim() ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'bg-transparent text-gray-500'}`}>
                 {isLoading ? <StopCircle size={18} /> : <Send size={18} />}
             </button>

             <button type="button" onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-xl hover:bg-gray-500/20 text-gray-400 transition-colors">
                 <MoreVertical size={18} />
             </button>
          </form>

        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLoginSuccess} isDark={isDark} />
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }`}</style>
    </div>
  );
}

        
