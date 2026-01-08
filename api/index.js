const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require('form-data');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// --- UTILS ---
const rand = n => Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');

// --- PUBLIC REST API ENDPOINT ---
// Admin bisa menggunakan ini sebagai layanan API
app.post('/api/v1/chat', async (req, res) => {
    // Validasi API Key sederhana (Di production gunakan Database)
    const apiKey = req.headers['authorization'];
    if (!apiKey || !apiKey.startsWith('Bearer sk-shanove')) {
        return res.status(401).json({ status: false, message: "Invalid API Key" });
    }

    const { model, query, prompt } = req.body;
    
    try {
        if (model === 'worm') {
            const result = await wormgptChat(query || prompt);
            return res.json({ status: true, model: 'worm-gpt', result });
        } else {
            return res.status(400).json({ status: false, message: "Model not supported in this endpoint yet" });
        }
    } catch (e) {
        return res.status(500).json({ status: false, message: e.message });
    }
});

// --- WORM GPT LOGIC ---
async function wormgptChat(query) {
    const messageId = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`;
    const userId = `${rand(8)}-${rand(4)}-${rand(4)}-${rand(4)}-${rand(12)}`;
    const cookie = '__Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2Q0JDLUhTNTEyIiwia2lkIjoiRnlESjQ1UXFQeDVRSVhoaVNSQk5uNFBHcFBFVnQzbjBZTVhRVGlEZ3hNeS1KaEZCNTJQOWx6d0lvNTRIODU1X3JNVzhWTHE0UUVDUExTWF9aLTh2aXcifQ..BC1-RXYYZM0oVmP7FaXUsw.f5LshHBNgG24G0uaj9te9vcDqm7zynNtVRvuuFjiHJzChQHQ4TYDCG35JXFCtiy29JcTWULM3ynjMp9l3ygwnv4FVIo9BIZBcyUQBzFyPNYcF6FGQEYke-D5ebIXcQi_tXLbxkhLTh9jTJJ4qfqZC13CgeaG-8je-x_dLT7yDe7A0s9QYqk7edr0YT_AmngvgS3MvcvhNmVC35aDurZO3dV2egpNvwgjlJaCn3aNRoiXjmtZow8pX3BUig8pfdE1.TiCtK3B8lnk4_K7R9ZxQvjqd3SVeoBzEUr8V9BKjGN0; __Secure-authjs.callback-url=https%3A%2F%2Fchat.wrmgpt.com%2Flogin';

    const res = await fetch('https://chat.wrmgpt.com/api/chat', {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
            'Content-Type': 'application/json',
            'Cookie': cookie,
            'Origin': 'https://chat.wrmgpt.com',
            'Referer': 'https://chat.wrmgpt.com/'
        },
        body: JSON.stringify({
            id: messageId,
            message: { role: 'user', parts: [{ type: 'text', text: query }], id: userId },
            selectedChatModel: 'wormgpt-v5.5',
            selectedVisibilityType: 'private',
            searchEnabled: false,
            memoryLength: 8
        })
    });

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const raw = await res.text();
    let result = '';
    
    for (const line of raw.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
            const json = JSON.parse(data);
            if (json.type === 'text-delta' && json.delta) result += json.delta;
        } catch {}
    }
    return result || 'No response generated.';
}

// --- NANO BANANA LOGIC ---
const NANO_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
    'Origin': 'https://nano-banana-pro.co',
    'Referer': 'https://nano-banana-pro.co/'
};

async function nanoBananaImg2Img(prompt, imageBuffer, mimeType) {
    const mailRes = await fetch('https://api.nekolabs.web.id/tools/tempmail/v1/create').then(r => r.json());
    if(!mailRes.result) throw new Error("Gagal create email");
    const { email, sessionId } = mailRes.result;

    const password = 'Pass' + crypto.randomBytes(4).toString('hex') + '!';
    const name = 'User' + crypto.randomBytes(2).toString('hex');
    
    await fetch('https://nano-banana-pro.co/api/auth/sign-up/email', {
        method: 'POST',
        headers: { ...NANO_HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });

    let verifyLink = null;
    for(let i=0; i<15; i++) {
        await new Promise(r => setTimeout(r, 3000));
        const inbox = await fetch(`https://api.nekolabs.web.id/tools/tempmail/v1/inbox?id=${sessionId}`).then(r => r.json());
        if(inbox.result?.emails?.length) {
            const body = inbox.result.emails[0].text || inbox.result.emails[0].html || '';
            const match = body.match(/https:\/\/nano-banana-pro\.co\/api\/auth\/verify-email\?token=[^\s"]+/);
            if(match) { verifyLink = match[0]; break; }
        }
    }
    if(!verifyLink) throw new Error("Timeout verifikasi email");

    const verifyRes = await fetch(verifyLink, { headers: NANO_HEADERS, redirect: 'manual' });
    const rawCookies = verifyRes.headers.raw()['set-cookie'];
    const cookie = rawCookies ? rawCookies.map(v => v.split(';')[0]).join('; ') : '';

    const form = new FormData();
    form.append('files', imageBuffer, { filename: 'image.jpg', contentType: mimeType });
    
    const upRes = await fetch('https://nano-banana-pro.co/api/storage/upload-image', {
        method: 'POST',
        headers: { ...NANO_HEADERS, 'Cookie': cookie, ...form.getHeaders() },
        body: form
    });
    const upJson = await upRes.json();
    const uploadedUrl = upJson?.data?.urls?.[0];
    if(!uploadedUrl) throw new Error("Gagal upload gambar");

    const genRes = await fetch('https://nano-banana-pro.co/api/ai/generate', {
        method: 'POST',
        headers: { ...NANO_HEADERS, 'Content-Type': 'application/json', 'Cookie': cookie },
        body: JSON.stringify({
            mediaType: 'image', scene: 'image-to-image', provider: 'kie', model: 'nano-banana', prompt: prompt,
            options: { image_input: [uploadedUrl] }
        })
    });
    const genJson = await genRes.json();
    const taskId = genJson?.data?.id;
    if(!taskId) throw new Error("Gagal start task AI");

    for(let i=0; i<15; i++) {
        await new Promise(r => setTimeout(r, 4000));
        const qRes = await fetch('https://nano-banana-pro.co/api/ai/query', {
            method: 'POST',
            headers: { ...NANO_HEADERS, 'Content-Type': 'application/json', 'Cookie': cookie },
            body: JSON.stringify({ taskId })
        });
        
        if(qRes.headers.get('content-type')?.includes('image')) {
            const buffer = await qRes.buffer();
            return `data:${qRes.headers.get('content-type')};base64,${buffer.toString('base64')}`;
        }

        try {
            const json = await qRes.json();
            const taskStr = json?.data?.taskResult;
            if(taskStr) {
                const task = JSON.parse(taskStr);
                if(task.state === 'success') {
                    const res = JSON.parse(task.resultJson || '{}');
                    return res?.resultUrls?.[0];
                }
                if(['failed', 'error'].includes(task.state)) throw new Error("AI Task Failed");
            }
        } catch(e) { if(e.message === "AI Task Failed") throw e; }
    }
    throw new Error("Timeout generating image");
}

// --- ROUTES ---
app.get('/', (req, res) => res.send('Shanove AI Engine v17 - Running'));

app.post('/api/worm', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) return res.status(400).json({ error: 'Query required' });
        const result = await wormgptChat(query);
        res.json({ result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/nano', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!req.file || !prompt) return res.status(400).json({ error: 'Image and prompt required' });
        const result = await nanoBananaImg2Img(prompt, req.file.buffer, req.file.mimetype);
        res.json({ result });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;
