import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Zap, Copy, Check, Sun, Moon, Trash2, StopCircle, User, Lock, 
  Mail, Loader2, Image as ImageIcon, Upload, 
  Menu, X, MessageSquare, Edit3, Plus, MessageCircle, AlertTriangle, 
  LogOut, Sparkles, Terminal
} from 'lucide-react';

// --- CONFIGURATION ---
const BACKEND_URL = ""; 

const CEREBRAS_API_KEY = "csk-mwxrfk94v8txn2nw2ym538hk38j6cm9vketfxrd9xcf6jc4t";
const CEREBRAS_MODEL_ID = "qwen-3-235b-a22b-instruct-2507";

const EMAIL_CONFIG = {
    SERVICE_ID: "service_rlpso0c",
    TEMPLATE_ID: "template_ozkoz93",
    PUBLIC_KEY: "0eVdYs-0usPaFRNPf"
};

const APP_INFO = {
    name: "Shanove AI",
    version: "v16.0 Auto-Format",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092?text=Halo%20Owner%20Shanove%20AI,%20lapor%20bug..."
};

const SYSTEM_PROMPT = `
Nama: Shanove AI.
Sifat: Professional Developer.
Gaya: Singkat, Padat, Kode Valid. Gunakan Markdown (**bold**) untuk poin penting.
`;

const FREE_LIMIT = 3;

// --- UTILS: TEXT FORMATTER ---
// Fungsi ini mengubah **text** menjadi Bold dan *text* menjadi Italic
const formatMessageText = (text) => {
    // Split berdasarkan baris baru dulu
    return text.split('\n').map((line, lineIdx) => {
        if (!line) return <div key={lineIdx} className="h-2"></div>; // Spasi antar paragraf

        // Regex untuk **bold** dan *italic*
        // Urutan split: Bold dulu, baru Italic
        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        
        return (
            <p key={lineIdx} className="mb-1 min-h-[1.2em]">
                {parts.map((part, partIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        // Render BOLD
                        return <strong key={partIdx} className="font-bold text-indigo-500 dark:text-indigo-400">{part.slice(2, -2)}</strong>;
                    } else if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
                        // Render ITALIC
                        return <em key={partIdx} className="italic text-gray-600 dark:text-gray-400">{part.slice(1, -1)}</em>;
                    }
                    return part;
                })}
            </p>
        );
    });
};

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
    <div className="w-full my-3 rounded-lg overflow-hidden font-mono text-sm border border-white/10 shadow-md bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] text-gray-300 select-none border-b border-white/5">
        <div className="flex items-center gap-2">
            <Terminal size={14} className="text-blue-400"/>
            <span className="text-xs font-semibold uppercase">{language || 'code'}</span>
        </div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
          {copied ? <Check size={14} className="text-green-500"/> : <Copy size={14} />} <span>{copied ? 'Disalin' : 'Salin'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <pre className="text-[13px] leading-6 font-mono text-[#d4d4d4] whitespace-pre">{highlightSyntax(code)}</pre>
      </div>
    </div>
  );
};

const MessageItem = ({ role, content, image, isDark }) => {
  const isUser = role === 'user';
  // Split logic: Text | Code Block | Text
  const parts = (content || "").split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 md:px-0 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex w-full max-w-3xl gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-105 ${isUser ? 'bg-transparent' : (isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100')}`}>
          {isUser ? 
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg`}><User size={18} /></div> : 
            <img src={APP_INFO.logo_url} className="w-full h-full object-cover" alt="Bot" />
          }
        </div>

        {/* Bubble */}
        <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-[15px] leading-relaxed shadow-sm transition-all duration-300 ${isUser ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-[#f4f4f4] text-gray-800') + ' py-3 px-5 rounded-2xl rounded-tr-sm' : (isDark ? 'text-gray-200' : 'text-gray-800') + ' w-full px-1'}`}>
             
             {!isUser && <div className="font-bold text-xs mb-2 opacity-50 select-none flex items-center gap-1 uppercase tracking-wider">Shanove AI</div>}
             
             {image && (
                <div className="mb-4 mt-1 rounded-xl overflow-hidden border border-white/10 shadow-lg group">
                    <img src={image} alt="Generated" className="w-full h-auto object-cover max-h-[350px] transition-transform duration-500 group-hover:scale-105" />
                </div>
             )}

             {parts.map((part, index) => {
               // Render Text (Parsed for **bold**)
               if (index % 3 === 0 && part.trim()) {
                   return <div key={index} className="break-words">{formatMessageText(part)}</div>;
               }
               // Render Code Block
               if (index % 3 === 2) {
                   return <CodeBlock key={index} language={parts[index - 1]} code={part} />;
               }
               return null;
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat, isDark }) => {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");

    const startEdit = (chat) => { setEditingId(chat.id); setEditName(chat.title); };
    const saveEdit = (id) => { onRenameChat(id, editName); setEditingId(null); };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            )}
            
            <div className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static border-r ${isDark ? 'bg-[#171717] border-[#2f2f2f]' : 'bg-gray-50 border-gray-200'}`}>
                <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                             <img src={APP_INFO.logo_url} className="w-7 h-7 rounded-md" alt="Logo" />
                             <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>History</span>
                        </div>
                        <button onClick={onClose} className="md:hidden p-1 hover:bg-gray-700/20 rounded"><X size={20}/></button>
                    </div>

                    <button onClick={() => { onNewChat(); if(window.innerWidth < 768) onClose(); }} className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 mb-4 transition-all shadow-sm active:scale-95 ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                        <Plus size={18} /> <span className="font-semibold text-sm">Chat Baru</span>
                    </button>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                        {chats.map(chat => (
                            <div key={chat.id} className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${currentChatId === chat.id ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-gray-200 text-gray-900') : (isDark ? 'text-gray-400 hover:bg-[#2f2f2f]/50' : 'text-gray-600 hover:bg-gray-100')}`}
                                onClick={() => { onSelectChat(chat.id); if(window.innerWidth < 768) onClose(); }}
                            >
                                <MessageSquare size={16} className="shrink-0 opacity-70" />
                                {editingId === chat.id ? (
                                    <input autoFocus value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={() => saveEdit(chat.id)} onKeyDown={(e) => e.key === 'Enter' && saveEdit(chat.id)} className="bg-transparent border-b border-blue-500 outline-none text-sm w-full" onClick={(e) => e.stopPropagation()}/>
                                ) : ( <span className="text-sm truncate w-full">{chat.title}</span> )}
                                {(currentChatId === chat.id || editingId === chat.id) && (
                                    <div className="absolute right-2 flex gap-1 bg-inherit">
                                        <button onClick={(e) => { e.stopPropagation(); startEdit(chat); }} className="p-1 hover:text-blue-400"><Edit3 size={12}/></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }} className="p-1 hover:text-red-400"><Trash2 size={12}/></button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

const ProfileModal = ({ isOpen, onClose, user, onSave, onLogout, isDark }) => {
    const [name, setName] = useState(user.name);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl relative ${isDark ? 'bg-[#1e1e1e] border border-gray-700' : 'bg-white'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Profile</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/10"><X size={20}/></button>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mb-2 shadow-lg">
                        {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-sm opacity-60 font-medium">{user.email || 'Guest Session'}</div>
                    <div className={`text-[10px] font-bold tracking-widest px-3 py-1 rounded-full mt-2 ${user.isPro ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-gray-500/20 text-gray-500'}`}>
                        {user.isPro ? 'PRO MEMBER' : 'FREE TIER'}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs opacity-70 ml-1 font-semibold uppercase">Display Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3 rounded-xl border outline-none mt-1 transition-all focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 text-gray-900 border-gray-200'}`} />
                    </div>
                    <button onClick={() => { onSave(name); onClose(); }} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Simpan Perubahan</button>
                    <button onClick={onLogout} className="w-full py-3 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                        <LogOut size={18}/> Logout
                    </button>
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
  const [otpExpiry, setOtpExpiry] = useState(null);
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
    setOtpExpiry(Date.now() + 15 * 60 * 1000); 

    const data = {
      service_id: EMAIL_CONFIG.SERVICE_ID,
      template_id: EMAIL_CONFIG.TEMPLATE_ID,
      user_id: EMAIL_CONFIG.PUBLIC_KEY,
      template_params: { to_email: email, otp_code: code, time: "15 Menit", reply_to: 'no-reply@shanove.ai', from_name: APP_INFO.name }
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
      if (response.ok) setStep('otp');
      else throw new Error("Gagal");
    } catch (err) { setError('Gagal kirim. Cek koneksi.'); } finally { setLoading(false); }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (Date.now() > otpExpiry) { setError('OTP Expired.'); return; }
    if (inputOtp === serverOtp) onLogin(email);
    else setError('OTP Salah!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden ${isDark ? 'bg-[#1e1e1e] border border-gray-700' : 'bg-white'}`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X size={20}/></button>
        <div className="text-center mb-6">
          <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-black'}`}><Lock size={20}/></div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{step === 'email' ? 'Unlock Unlimited' : 'Verifikasi'}</h2>
          <p className="text-gray-500 text-sm mt-2">{step === 'email' ? 'Masukkan email untuk akses tanpa batas.' : `OTP dikirim ke ${email}`}</p>
        </div>
        {step === 'email' ? (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" className={`w-full py-3 px-4 rounded-xl border outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 text-gray-900'}`} />
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg border border-yellow-500/20">
                <AlertTriangle size={14} /> <span>Cek folder <b>SPAM</b> jika email tak masuk!</span>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-[#5436DA] hover:bg-[#462dbe] text-white rounded-xl flex justify-center items-center gap-2 transition-colors">{loading ? <Loader2 className="animate-spin"/> : 'Kirim Kode'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input type="text" required value={inputOtp} onChange={e => setInputOtp(e.target.value)} placeholder="000000" maxLength={6} className={`w-full py-3 px-4 rounded-xl border outline-none tracking-widest text-center text-xl font-mono ${isDark ? 'bg-[#2a2a2a] border-gray-700 text-white' : 'bg-gray-50 text-gray-900'}`} />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button type="submit" className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors">Verifikasi</button>
            <button type="button" onClick={() => { setStep('email'); setError(''); }} className="w-full py-2 text-sm text-gray-500 hover:text-gray-300">Kirim Ulang</button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP SHELL ---
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [user, setUser] = useState(() => {
      const saved = localStorage.getItem('shanove_user');
      return saved ? JSON.parse(saved) : { name: 'User', email: '', isPro: false };
  });
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [chats, setChats] = useState(() => {
      const saved = localStorage.getItem('shanove_chats_v2');
      return saved ? JSON.parse(saved) : [{ id: 1, title: 'New Chat', messages: [{ role: 'assistant', content: `Halo **${user.name}**! Saya Shanove AI.\nPilih model di navbar atas.` }] }];
  });
  const [currentChatId, setCurrentChatId] = useState(() => chats[0]?.id || 1);
  const currentChat = chats.find(c => c.id === currentChatId) || chats[0];
  const messages = currentChat.messages;
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState('shanove'); 
  const [statusText, setStatusText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const bottomRef = useRef(null);

  useEffect(() => localStorage.setItem('shanove_user', JSON.stringify(user)), [user]);
  useEffect(() => localStorage.setItem('shanove_chats_v2', JSON.stringify(chats)), [chats]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isLoading, statusText]);

  const handleNewChat = () => {
      const newId = Date.now();
      const newChat = { id: newId, title: 'New Chat', messages: [{ role: 'assistant', content: `Chat baru dimulai.` }] };
      setChats([newChat, ...chats]);
      setCurrentChatId(newId);
  };
  const handleDeleteChat = (id) => {
      const filtered = chats.filter(c => c.id !== id);
      if (filtered.length === 0) handleNewChat();
      else { setChats(filtered); if (currentChatId === id) setCurrentChatId(filtered[0].id); }
  };
  const handleRenameChat = (id, newName) => setChats(chats.map(c => c.id === id ? { ...c, title: newName } : c));
  const updateMsgs = (newMsgs) => setChats(chats.map(c => c.id === currentChatId ? { ...c, messages: newMsgs } : c));

  const handleLoginSuccess = (email) => {
    setUser({ ...user, email: email, isPro: true });
    setShowAuthModal(false);
    alert("✅ Login Sukses! Mode PRO Aktif.");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const totalUserMsgs = chats.reduce((acc, chat) => acc + chat.messages.filter(m => m.role === 'user').length, 0);
    if (!user.isPro && totalUserMsgs >= FREE_LIMIT) { setShowAuthModal(true); return; }

    const text = input;
    if (model === 'nano' && !selectedImage) { alert("⚠️ Wajib upload gambar untuk mode Nano Banana!"); return; }

    const userMsg = { role: 'user', content: text, image: (model === 'nano' ? previewUrl : null) };
    const newMsgs = [...messages, userMsg];
    
    if (messages.length === 1 && currentChat.title === 'New Chat') handleRenameChat(currentChatId, text.slice(0, 20) + '...');
    
    updateMsgs(newMsgs);
    setInput('');
    setIsLoading(true);
    setStatusText(model === 'nano' ? "Bentar bg lagi proses nano Banana..." : "Sedang mengetik...");

    try {
        let reply = "";
        let imgResult = null;

        if (model === 'shanove') {
            const payload = {
                model: CEREBRAS_MODEL_ID,
                messages: [{ role: "system", content: SYSTEM_PROMPT }, ...newMsgs.slice(-5)],
                max_completion_tokens: 1000
            };
            const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST', headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            reply = data.choices[0].message.content;

        } else if (model === 'worm') {
            const res = await fetch(`${BACKEND_URL}/api/worm`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: text })
            });
            const data = await res.json();
            reply = "**WormGPT:**\n" + (data.result || "No response");

        } else if (model === 'nano') {
            const formData = new FormData();
            formData.append('prompt', text);
            formData.append('image', selectedImage);
            const res = await fetch(`${BACKEND_URL}/api/nano`, { method: 'POST', body: formData });
            const data = await res.json();
            if(data.error) throw new Error(data.error);
            reply = "**Nano Banana Result:**";
            imgResult = data.result;
        }

        updateMsgs([...newMsgs, { role: 'assistant', content: reply, image: imgResult }]);

    } catch (err) {
        updateMsgs([...newMsgs, { role: 'assistant', content: `⚠️ Error: ${err.message}` }]);
    } finally {
        setIsLoading(false);
        setStatusText('');
        if(model === 'nano') { setSelectedImage(null); setPreviewUrl(null); }
    }
  };

  const handleImageSelect = (e) => {
      if (e.target.files?.[0]) {
          const file = e.target.files[0];
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(file));
          setModel('nano');
      }
  };

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-800'}`}>
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} chats={chats} currentChatId={currentChatId} onSelectChat={setCurrentChatId} onNewChat={handleNewChat} onDeleteChat={handleDeleteChat} onRenameChat={handleRenameChat} isDark={isDark} />

      <div className="flex-1 flex flex-col h-full w-full relative">
          
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
             <a href={APP_INFO.wa_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform">
                <MessageCircle size={14} /> Hubungi Owner
             </a>
          </div>

          <header className={`flex items-center justify-between p-3 border-b z-30 ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-gray-100'}`}>
             <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5"><Menu size={20} /></button>
                <div className={`hidden md:flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-[#171717]' : 'bg-gray-100'}`}>
                    {['shanove', 'worm', 'nano'].map(m => (
                        <button key={m} onClick={() => setModel(m)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${model === m ? (isDark ? 'bg-[#2f2f2f] text-white shadow-sm' : 'bg-white text-black shadow-sm') : 'text-gray-500'}`}>
                            {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                    ))}
                </div>
             </div>
             <div className="flex gap-2">
                 <button onClick={() => setIsDark(!isDark)} className="p-2 rounded hover:bg-white/5">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
                 <button onClick={() => setShowProfile(true)} className="p-1 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 w-9 h-9 flex items-center justify-center text-white font-bold shadow-md">
                     {user.name.charAt(0).toUpperCase()}
                 </button>
             </div>
          </header>

          <div className={`md:hidden flex justify-center py-2 border-b ${isDark ? 'bg-[#1e1e1e] border-[#2f2f2f]' : 'bg-gray-50 border-gray-100'}`}>
               <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-[#171717]' : 'bg-white border'}`}>
                    {['shanove', 'worm', 'nano'].map(m => (
                        <button key={m} onClick={() => setModel(m)} className={`px-4 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${model === m ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-black text-white') : 'text-gray-500'}`}>
                            {m}
                        </button>
                    ))}
                </div>
          </div>

          <main className="flex-1 overflow-y-auto w-full custom-scrollbar relative px-2">
            <div className="flex flex-col items-center w-full pb-36 pt-4">
               {messages.map((msg, idx) => <MessageItem key={idx} role={msg.role} content={msg.content} image={msg.image} isDark={isDark} />)}
               
               {(isLoading || statusText) && (
                   <div className="w-full max-w-3xl px-4 flex gap-3 animate-pulse">
                       <div className="w-8 h-8 rounded-full bg-gray-500/20"></div>
                       <div className="flex flex-col gap-1">
                           <div className="text-xs text-gray-500 font-mono">{statusText || "Sedang berpikir..."}</div>
                           <div className="h-2 w-24 bg-gray-500/20 rounded-full"></div>
                       </div>
                   </div>
               )}
               <div ref={bottomRef} />
            </div>
          </main>

          <footer className={`w-full p-3 md:p-4 z-30 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
            <div className="max-w-3xl mx-auto relative">
              <input id="imgUpload" type="file" onChange={handleImageSelect} accept="image/*" className="hidden" />

              <form onSubmit={handleSend} className={`flex items-center gap-2 p-2 rounded-2xl border shadow-lg transition-all ${isDark ? 'bg-[#2f2f2f] border-gray-700 focus-within:border-gray-500' : 'bg-white border-gray-200 focus-within:border-blue-400'}`}>
                 <button type="button" onClick={() => document.getElementById('imgUpload').click()} className={`pl-2 ${model === 'nano' && selectedImage ? 'text-green-500' : 'text-gray-400'}`}>
                     {model === 'nano' ? (selectedImage ? <img src={previewUrl} className="w-6 h-6 rounded border border-green-500 object-cover"/> : <Upload size={20} className="text-yellow-500 animate-bounce"/>) : <Sparkles size={20}/>}
                 </button>

                 <input
                     value={input}
                     onChange={(e) => setInput(e.target.value)}
                     placeholder={model === 'nano' ? "Deskripsi gambar..." : model === 'worm' ? "Tanya WormGPT..." : "Ketik pesan..."}
                     className="flex-1 bg-transparent px-2 py-2 outline-none text-sm md:text-base min-w-0"
                     disabled={isLoading}
                 />

                 <button type="submit" disabled={!input.trim() || isLoading} className={`p-2 rounded-xl transition-all ${input.trim() ? (isDark ? 'bg-white text-black' : 'bg-black text-white') : 'bg-transparent text-gray-500'}`}>
                     {isLoading ? <StopCircle size={18} /> : <Send size={18} />}
                 </button>
              </form>
              
              <div className="text-center mt-2 text-[10px] text-gray-500 flex justify-between px-2">
                  <span>{user.isPro ? '💎 Unlimited Pro' : `${Math.max(0, FREE_LIMIT - chats.reduce((a,c)=>a+c.messages.filter(m=>m.role==='user').length,0))} pesan gratis`}</span>
                  <span className="opacity-50">Shanove v16</span>
              </div>
            </div>
          </footer>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLogin={handleLoginSuccess} isDark={isDark} />
      <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} user={user} onSave={(n) => setUser({...user, name: n})} onLogout={() => { setUser({name:'User', email:'', isPro:false}); localStorage.removeItem('shanove_logged_in'); alert("Logged Out"); }} isDark={isDark} />
      
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }`}</style>
    </div>
  );
}


