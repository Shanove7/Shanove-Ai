import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Sun, Moon, Trash2, StopCircle, User, Lock, 
  Loader2, Upload, Menu, X, MessageSquare, 
  Plus, MessageCircle, AlertTriangle, LogOut, 
  Check, Sparkles, Terminal, Key, LayoutDashboard
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
    version: "v22.0 Limit Info",
    logo_url: "https://raw.githubusercontent.com/Shanove7/Shanove-Ai/refs/heads/main/1764308690923.jpg",
    wa_url: "https://wa.me/6285185032092",
    admin_email: "kasannudin29@gmail.com"
};

const LIMITS = { GUEST: 3, USER: 50, ADMIN: 999999 };
const SYSTEM_PROMPT = "Nama: Shanove AI. Sifat: Asisten Cerdas. Bahasa: Indonesia. Format: Gunakan **bold** untuk poin penting.";

// --- SAFE STORAGE UTILS ---
const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch { return fallback; }
};

// --- COMPONENTS ---

// 1. Toast Notification
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
            <div key={t.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md animate-in slide-in-from-right duration-300 ${t.type==='error'?'bg-red-500/90 text-white border-red-400':'bg-green-500/90 text-white border-green-400'}`}>
                {t.type==='error' ? <AlertTriangle size={18}/> : <Check size={18}/>}
                <span className="text-sm font-medium">{t.msg}</span>
                <button onClick={() => removeToast(t.id)} className="ml-2 hover:opacity-70"><X size={14}/></button>
            </div>
        ))}
    </div>
);

// 2. Code Block
const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="w-full my-3 rounded-lg overflow-hidden font-mono text-sm border border-white/10 shadow-md bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] text-gray-300 border-b border-white/5 select-none">
        <div className="flex items-center gap-2"><Terminal size={14} className="text-blue-400"/><span className="text-xs font-bold uppercase">{language || 'code'}</span></div>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">{copied ? <Check size={14} className="text-green-500"/> : <Copy size={14}/>} {copied ? 'Disalin' : 'Salin'}</button>
      </div>
      <div className="p-4 overflow-x-auto custom-scrollbar"><pre className="text-[13px] leading-6 text-[#d4d4d4] whitespace-pre">{code}</pre></div>
    </div>
  );
};

// 3. Message Item
const MessageItem = ({ role, content, image, isDark }) => {
  const isUser = role === 'user';
  const parts = (content || "").split(/```(\w*)\n([\s\S]*?)```/g);

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 px-4 md:px-0 animate-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex w-full max-w-3xl gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden shadow-sm ${isUser ? 'bg-blue-600 text-white' : 'bg-transparent'}`}>
          {isUser ? <User size={18} /> : <img src={APP_INFO.logo_url} className="w-full h-full object-cover" alt="Bot" />}
        </div>
        <div className={`flex flex-col min-w-0 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`text-[15px] leading-relaxed shadow-sm transition-all ${isUser ? (isDark ? 'bg-[#2f2f2f] text-white' : 'bg-[#f4f4f4] text-gray-800') + ' py-3 px-5 rounded-2xl rounded-tr-sm' : (isDark ? 'text-gray-200' : 'text-gray-800') + ' w-full px-1'}`}>
             {!isUser && <div className="font-bold text-xs mb-2 opacity-50 text-indigo-400 select-none">Shanove AI</div>}
             {image && <img src={image} alt="Result" className="mb-4 rounded-xl border border-white/10 shadow-lg w-full max-h-[350px] object-cover" />}
             {parts.map((part, index) => {
               if (index % 3 === 0 && part.trim()) return <div key={index} className="whitespace-pre-wrap">{part.split('**').map((chk, i) => i % 2 === 1 ? <strong key={i} className="text-indigo-400">{chk}</strong> : chk)}</div>;
               if (index % 3 === 2) return <CodeBlock key={index} language={parts[index - 1]} code={part} />;
               return null;
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Sidebar
const Sidebar = ({ isOpen, onClose, chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, user, limits, onLogout, onOpenAdmin, onOpenAuth, isDark }) => {
    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
            <div className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col ${isDark ? 'bg-[#171717] border-r border-[#2f2f2f]' : 'bg-white border-r border-gray-200'}`}>
                <div className="p-4 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2 font-bold"><img src={APP_INFO.logo_url} className="w-8 h-8 rounded-lg"/> Shanove AI</div>
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10"><X size={20}/></button>
                </div>
                <div className="p-4">
                    <button onClick={() => { onNewChat(); onClose(); }} className="w-full py-3 bg-indigo-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-indigo-700 transition-colors"><Plus size={18}/> Chat Baru</button>
                </div>
                <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
                    {chats.map(c => (
                        <div key={c.id} onClick={() => { onSelectChat(c.id); onClose(); }} className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group ${currentChatId===c.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                            <div className="flex items-center gap-3 truncate"><MessageSquare size={16} className="opacity-50"/> <span className="text-sm truncate">{c.title}</span></div>
                            <button onClick={(e)=>{e.stopPropagation(); onDeleteChat(c.id)}} className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/10 bg-black/20">
                    {user.email ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-lg text-white">{user.email[0].toUpperCase()}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate text-sm">{user.email.split('@')[0]}</div>
                                    <div className="text-xs opacity-60 flex justify-between"><span>{user.usage}/{user.limit}</span> <span className="font-bold">{user.isAdmin?'ADMIN':'PRO'}</span></div>
                                    <div className="h-1 bg-gray-700 rounded-full mt-1 overflow-hidden"><div className="h-full bg-blue-500" style={{width:`${Math.min(100,(user.usage/user.limit)*100)}%`}}></div></div>
                                </div>
                            </div>
                            {user.isAdmin && <button onClick={onOpenAdmin} className="w-full py-2 bg-gray-800 rounded text-xs font-bold flex justify-center gap-2"><LayoutDashboard size={14}/> Admin Panel</button>}
                            <button onClick={onLogout} className="w-full py-2 text-red-400 hover:bg-red-500/10 rounded text-xs font-bold flex justify-center gap-2"><LogOut size={14}/> Logout</button>
                        </div>
                    ) : (
                        <div className="text-center space-y-2">
                            <div className="text-xs opacity-60">Guest Limit: {user.usage} / {limits.GUEST}</div>
                            <button onClick={onOpenAuth} className="w-full py-2 bg-white text-black font-bold rounded text-sm">Login / Daftar</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

// 5. Auth Modal
const AuthModal = ({ isOpen, onClose, onLogin, showToast, isDark }) => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null); 
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const sendEmail = async (e) => {
    e.preventDefault(); setLoading(true);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setServerOtp(code);
    try {
        await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service_id: EMAIL_CONFIG.SERVICE_ID, template_id: EMAIL_CONFIG.TEMPLATE_ID, user_id: EMAIL_CONFIG.PUBLIC_KEY, template_params: { to_email: email, otp_code: code, time: "15 Menit", reply_to: 'no-reply@shanove.ai', from_name: APP_INFO.name } })
        });
        setStep('otp'); showToast('OTP terkirim ke email', 'success');
    } catch { showToast('Gagal kirim email', 'error'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl relative ${isDark ? 'bg-[#1e1e1e] border border-gray-700 text-white' : 'bg-white text-black'}`}>
        <button onClick={onClose} className="absolute top-4 right-4"><X/></button>
        <h2 className="text-2xl font-bold mb-2 text-center">{step === 'email' ? 'Login Akun' : 'Verifikasi'}</h2>
        <p className="text-center text-sm opacity-60 mb-6">{step === 'email' ? 'Dapatkan 50 limit/hari.' : `OTP dikirim ke ${email}`}</p>
        
        {step === 'email' ? (
          <form onSubmit={sendEmail} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <div className="flex items-center gap-2 text-xs text-yellow-500 bg-yellow-500/10 p-3 rounded-lg"><AlertTriangle size={14}/> Cek folder <b>SPAM</b> jika tidak masuk!</div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 rounded-xl font-bold flex justify-center text-white">{loading ? <Loader2 className="animate-spin"/> : 'Kirim Kode'}</button>
          </form>
        ) : (
          <div className="space-y-4">
            <input type="text" required value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" className={`w-full p-3 rounded-xl border text-center tracking-widest text-xl font-mono outline-none ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-gray-50'}`} />
            <button onClick={() => { if(otp===serverOtp) onLogin(email); else showToast("OTP Salah", "error"); }} className="w-full py-3 bg-green-600 text-white rounded-xl font-bold">Verifikasi</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [toasts, setToasts] = useState([]);

  // DB & STATE
  const [usersDb, setUsersDb] = useState(() => safeParse('shanove_db_users', {}));
  const [currEmail, setCurrEmail] = useState(localStorage.getItem('shanove_curr_email'));
  const [chats, setChats] = useState(() => safeParse('shanove_chats_v5', [{id:1, title:'New Chat', messages:[{role:'assistant', content:'Halo! Saya Shanove AI.'}]}]));
  const [chatId, setChatId] = useState(() => chats[0]?.id || 1);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('shanove');
  const [status, setStatus] = useState('');
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const bottomRef = useRef(null);

  // COMPUTED
  const user = currEmail ? (usersDb[currEmail] || { role:'user', limit: LIMITS.USER, usage: 0 }) : { role:'guest', limit: LIMITS.GUEST, usage: parseInt(localStorage.getItem('shanove_guest_usage')||0) };
  const isAdmin = currEmail === APP_INFO.admin_email;
  const currentChat = chats.find(c => c.id === chatId) || chats[0];
  const remaining = Math.max(0, user.limit - user.usage);

  // EFFECTS
  useEffect(() => localStorage.setItem('shanove_db_users', JSON.stringify(usersDb)), [usersDb]);
  useEffect(() => localStorage.setItem('shanove_chats_v5', JSON.stringify(chats)), [chats]);
  useEffect(() => { if(currEmail) localStorage.setItem('shanove_curr_email', currEmail); else localStorage.removeItem('shanove_curr_email'); }, [currEmail]);
  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), [chats, loading, status]);

  const addToast = (msg, type='info') => { const id=Date.now(); setToasts(p=>[...p,{id,msg,type}]); setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)),3000); };

  const handleLogin = (email) => {
      const newDb = { ...usersDb };
      if (!newDb[email]) {
          const isAdm = email === APP_INFO.admin_email;
          newDb[email] = { role: isAdm?'admin':'user', limit: isAdm?LIMITS.ADMIN:LIMITS.USER, usage: 0, isAdmin: isAdm };
          setUsersDb(newDb);
      }
      setCurrEmail(email);
      setShowAuth(false);
      addToast("Login Berhasil!", "success");
  };

  const handleSend = async (e) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      if (user.usage >= user.limit) {
          addToast(currEmail ? "Limit Harian Habis!" : "Limit Tamu Habis!", "error");
          if (!currEmail) setShowAuth(true);
          return;
      }

      if (model === 'nano' && !img) { addToast("Upload gambar dulu!", "error"); return; }

      const userMsg = { role: 'user', content: input, image: model==='nano' ? preview : null };
      const newMsgs = [...currentChat.messages, userMsg];
      
      const newChats = chats.map(c => c.id === chatId ? { ...c, messages: newMsgs, title: c.messages.length===1 ? input.slice(0,15)+'...' : c.title } : c);
      setChats(newChats);
      setInput(''); setLoading(true); setStatus(model==='nano' ? "Bentar bg lagi proses nano Banana..." : "Sedang mengetik...");

      // Update Usage
      if (currEmail) {
          const u = usersDb[currEmail];
          setUsersDb({...usersDb, [currEmail]: {...u, usage: u.usage + 1}});
      } else {
          localStorage.setItem('shanove_guest_usage', (user.usage + 1).toString());
      }

      try {
          let reply = "", resImg = null;
          if (model === 'shanove') {
              const res = await fetch('https://api.cerebras.ai/v1/chat/completions', { method: 'POST', headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: CEREBRAS_MODEL_ID, messages: [{role:"system",content:SYSTEM_PROMPT}, ...newMsgs.slice(-5)], max_completion_tokens: 800 }) });
              const d = await res.json(); reply = d.choices[0].message.content;
          } else if (model === 'worm') {
              const res = await fetch(`${BACKEND_URL}/api/worm`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ query: userMsg.content }) });
              const d = await res.json(); reply = "🐛 " + (d.result || "Error");
          } else if (model === 'nano') {
              const fd = new FormData(); fd.append('prompt', userMsg.content); fd.append('image', img);
              const res = await fetch(`${BACKEND_URL}/api/nano`, { method: 'POST', body: fd });
              const d = await res.json();
              if (d.error) throw new Error(d.error);
              reply = "🍌 Selesai!"; resImg = d.result;
          }
          setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, userMsg, { role: 'assistant', content: reply, image: resImg }] } : c));
      } catch (err) {
          setChats(prev => prev.map(c => c.id === chatId ? { ...c, messages: [...c.messages, userMsg, { role: 'assistant', content: `Error: ${err.message}` }] } : c));
      } finally { setLoading(false); setStatus(''); if(model==='nano'){setImg(null);setPreview(null);} }
  };

  return (
    <div className={`flex h-[100dvh] overflow-hidden font-sans ${isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-900'}`}>
      
      <ToastContainer toasts={toasts} removeToast={(id) => setToasts(p => p.filter(t => t.id !== id))} />

      <Sidebar 
          isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
          chats={chats} currentChatId={chatId} onSelectChat={setChatId}
          onNewChat={() => { const nid=Date.now(); setChats([{id:nid,title:'New Chat',messages:[]} , ...chats]); setChatId(nid); }}
          onDeleteChat={(id) => { const f=chats.filter(c=>c.id!==id); if(f.length===0) setChats([{id:1,title:'New Chat',messages:[]}]); else { setChats(f); if(chatId===id) setChatId(f[0].id); } }}
          user={user} limits={LIMITS}
          onLogout={() => { setCurrEmail(null); addToast("Logout Berhasil"); }}
          onOpenAdmin={() => setShowAdmin(true)} onOpenAuth={() => setShowAuth(true)}
          isDark={isDark}
      />

      <div className="flex-1 flex flex-col relative w-full h-full">
          <header className={`p-3 border-b flex justify-between items-center z-20 ${isDark ? 'bg-[#212121] border-[#2f2f2f]' : 'bg-white border-gray-200'}`}>
              <div className="flex items-center gap-3">
                  <button onClick={()=>setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-white/10"><Menu/></button>
                  <div className="flex flex-col items-center">
                      <div className="flex bg-black/10 rounded-lg p-1 gap-1">
                          {['shanove','worm','nano'].map(m => <button key={m} onClick={()=>setModel(m)} className={`px-3 py-1 text-xs font-bold rounded uppercase transition-all ${model===m ? (isDark?'bg-[#2f2f2f] text-white shadow':'bg-white text-black shadow') : 'opacity-50'}`}>{m}</button>)}
                      </div>
                      {/* LIMIT INDICATOR DI BAWAH TOMBOL MODE */}
                      <div className={`text-[10px] font-bold mt-1 tracking-wide ${remaining <= 3 ? 'text-red-500 animate-pulse' : 'opacity-50'}`}>
                          Sisa Limit: {remaining}
                      </div>
                  </div>
              </div>
              <button onClick={()=>setIsDark(!isDark)} className="p-2 rounded-lg hover:bg-white/10">{isDark?<Sun size={20}/>:<Moon size={20}/>}</button>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar px-2 relative">
              {/* WA FLOATING TOP RIGHT */}
              <a href={APP_INFO.wa_url} target="_blank" rel="noreferrer" className="absolute top-2 right-2 z-10 opacity-50 hover:opacity-100 transition-opacity bg-green-500/10 p-2 rounded-full text-green-500"><MessageCircle size={20}/></a>

              <div className="flex flex-col items-center pb-32 pt-4">
                  {currentChat.messages.map((m, i) => <MessageItem key={i} role={m.role} content={m.content} image={m.image} isDark={isDark} />)}
                  {(loading || status) && <div className="animate-pulse text-xs opacity-50 mt-2 font-mono bg-white/5 px-3 py-1 rounded-full">{status}</div>}
                  <div ref={bottomRef} />
              </div>
          </main>

          <footer className={`p-3 md:p-4 z-20 ${isDark ? 'bg-[#212121]' : 'bg-white'}`}>
              <div className="max-w-3xl mx-auto">
                  <form onSubmit={handleSend} className={`flex items-center gap-2 p-2 rounded-2xl border transition-all shadow-lg ${isDark ? 'bg-[#2f2f2f] border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                      <input id="imgUp" type="file" className="hidden" onChange={e => {if(e.target.files[0]){setImg(e.target.files[0]); setPreview(URL.createObjectURL(e.target.files[0])); setModel('nano')}}} />
                      <button type="button" onClick={()=>document.getElementById('imgUp').click()} className={`p-2 rounded-lg transition-colors ${model==='nano'&&preview ? 'text-green-500 bg-green-500/10' : 'text-gray-400 hover:bg-white/5'}`}>{model==='nano'&&preview?<img src={preview} className="w-6 h-6 rounded object-cover"/>:<Upload size={20}/>}</button>
                      <input 
                        value={input} 
                        onChange={e=>setInput(e.target.value)} 
                        placeholder={model==='nano'?"Deskripsi gambar...":model==='worm'?"Tanya WormGPT...":"Ketik pesan..."} 
                        className="flex-1 bg-transparent outline-none text-sm min-w-0" 
                        disabled={loading} 
                        enterKeyHint="send" 
                        type="text"
                      />
                      <button type="submit" disabled={loading} className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"><Send size={18}/></button>
                  </form>
                  <div className="text-center mt-2 text-[10px] opacity-40">Shanove AI v22 • {currEmail ? "Pro Mode" : "Guest Mode"}</div>
              </div>
          </footer>
      </div>

      <AuthModal isOpen={showAuth} onClose={()=>setShowAuth(false)} onLogin={handleLogin} showToast={addToast} isDark={isDark} />
      <style jsx global>{`.custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }`}</style>
    </div>
  );
}


