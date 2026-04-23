import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Shield, 
  Target, 
  Zap, 
  Activity, 
  Users, 
  Database, 
  Settings, 
  ChevronRight, 
  Cpu, 
  Lock, 
  Eye, 
  AlertTriangle,
  Send,
  Code,
  Layers,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { io } from 'socket.io-client';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

// --- Types ---
type Tab = 'dashboard' | 'campaigns' | 'payloads' | 'victims' | 'engine' | 'osint' | 'settings';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

interface Victim {
  id: string;
  ip: string;
  os: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

// --- Mock Data ---
const MOCK_CHART_DATA = [
  { time: '00:00', traffic: 400, pwned: 24 },
  { time: '04:00', traffic: 300, pwned: 18 },
  { time: '08:00', traffic: 900, pwned: 65 },
  { time: '12:00', traffic: 1200, pwned: 92 },
  { time: '16:00', traffic: 800, pwned: 54 },
  { time: '20:00', traffic: 600, pwned: 38 },
  { time: '23:59', traffic: 500, pwned: 30 },
];

// --- Components ---

const CyberCard = ({ children, className, title, ...props }: { children: React.ReactNode, className?: string, title?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("relative bg-black/40 border border-cyan-500/30 backdrop-blur-md p-4 rounded-sm overflow-hidden group", className)} {...props}>
    {/* Corner Accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 opacity-50" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 opacity-50" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 opacity-50" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 opacity-50" />
    
    {title && (
      <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2">
        <div className="w-1 h-4 bg-cyan-400" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-100">{title}</h3>
      </div>
    )}
    {children}
  </div>
);

const TerminalLine = ({ text, type = 'info', ...props }: { text: string, type?: 'info' | 'success' | 'error' | 'warning' } & React.HTMLAttributes<HTMLDivElement>) => {
  const colors = {
    info: 'text-cyan-400',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400'
  };
  return (
    <div className="flex gap-2 font-mono text-xs mb-1" {...props}>
      <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
      <span className={colors[type]}>{text}</span>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [obfuscatedText, setObfuscatedText] = useState('');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [engineConfig, setEngineConfig] = useState({ technique: '', autoValence: true });
  const [osintQuery, setOsintQuery] = useState('');
  const [osintResults, setOsintResults] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [payloads, setPayloads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [victims, setVictims] = useState<Victim[]>([]);
  const [terminalLogs, setTerminalLogs] = useState<Array<{text: string, type: any}>>([
    { text: 'L33TS33KV9 Framework Initialized...', type: 'success' },
    { text: 'NIGHTFURY Engine: Standby', type: 'info' },
    { text: 'Establishing secure tunnel to C2 server...', type: 'info' },
    { text: 'Connection encrypted via Quantum Entanglement', type: 'success' },
  ]);

  useEffect(() => {
    const socket = io();
    
    socket.on('victim_update', (data: Victim[]) => {
      setVictims(data);
      addLog(`New target synchronized: ${data.length} total`, 'success');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, payloadsRes, campaignsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/payloads'),
          fetch('/api/campaigns')
        ]);
        
        setStats(await statsRes.json());
        setPayloads(await payloadsRes.json());
        setCampaigns(await campaignsRes.json());
      } catch (err) {
        addLog('Failed to fetch real-time data. Using local cache.', 'warning');
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (text: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setTerminalLogs(prev => [...prev, { text, type }].slice(-10));
  };

  const handleObfuscate = async () => {
    if (!inputText) return;
    setIsProcessing(true);
    addLog(`Processing vector: ${inputText.substring(0, 10)}...`, 'warning');
    
    try {
      const response = await fetch('/api/engine/obfuscate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: inputText, 
          technique: engineConfig.technique,
          autoValence: engineConfig.autoValence 
        })
      });
      const data = await response.json();
      setObfuscatedText(data.obfuscated);
      addLog(`Evasion successful. Technique: ${data.technique}, Valence: ${data.valence}`, 'success');
    } catch (err) {
      addLog('Engine failure: Connection lost.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOsintSearch = async () => {
    if (!osintQuery) return;
    setIsProcessing(true);
    addLog(`Scanning OSINT vectors for: ${osintQuery}`, 'warning');
    try {
      const res = await fetch(`/api/osint/search?query=${encodeURIComponent(osintQuery)}`);
      const data = await res.json();
      setOsintResults(data);
      addLog('OSINT scan complete.', 'success');
    } catch (err) {
      addLog('OSINT module failure.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async () => {
    addLog('Exporting campaign data...', 'info');
    try {
      const res = await fetch('/api/campaigns/export');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign_export_${data.export_id}.json`;
      a.click();
      addLog('Export successful.', 'success');
    } catch (err) {
      addLog('Export failed.', 'error');
    }
  };

  const handleGeneratePayload = async (type: string, platform: string) => {
    addLog(`Generating ${type} for ${platform}...`, 'warning');
    try {
      const res = await fetch('/api/payloads/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, platform, options: { obfuscate: true } })
      });
      const data = await res.json();
      setPayloads(prev => [data, ...prev]);
      addLog(`Payload ${data.id} generated and added to inventory.`, 'success');
    } catch (err) {
      addLog('Payload generation failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-cyan-50 font-sans selection:bg-cyan-500/30">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#00f2ff 1px, transparent 1px), linear-gradient(90deg, #00f2ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505]" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 border-b border-cyan-500/30 bg-black/60 backdrop-blur-xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-md opacity-20 animate-pulse" />
            <Cpu className="w-8 h-8 text-cyan-400 relative" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter uppercase italic">L33TS33KV9</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-500/60 font-bold">Divine Eye Edition</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500">System Online</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-cyan-500" />
              <span>Proxy: 127.0.0.1:9050</span>
            </div>
          </div>
          <button className="p-2 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <nav className="w-16 md:w-64 border-r border-cyan-500/20 bg-black/40 flex flex-col">
          <div className="flex-1 py-6 space-y-2">
            {[
              { id: 'dashboard', icon: Layers, label: 'Dashboard' },
              { id: 'campaigns', icon: Target, label: 'Campaigns' },
              { id: 'payloads', icon: Zap, label: 'Payloads' },
              { id: 'victims', icon: Users, label: 'Victims' },
              { id: 'engine', icon: Terminal, label: 'Nightfury Engine' },
              { id: 'osint', icon: Globe, label: 'OSINT Tools' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-3 transition-all relative group",
                  activeTab === item.id ? "text-cyan-400 bg-cyan-500/10" : "text-cyan-100/40 hover:text-cyan-100 hover:bg-white/5"
                )}
              >
                {activeTab === item.id && (
                  <motion.div layoutId="active-tab" className="absolute left-0 w-1 h-full bg-cyan-400" />
                )}
                <item.icon className="w-5 h-5" />
                <span className="hidden md:block text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="p-6 border-t border-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                <Lock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="hidden md:block">
                <p className="text-[10px] font-bold uppercase text-cyan-400">Operator</p>
                <p className="text-[9px] text-cyan-100/40 truncate">L33TS33K_XR</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Targets', value: stats?.totalVictims || 0, icon: Target, color: 'text-cyan-400' },
                    { label: 'Active Sessions', value: stats?.activeSessions || 0, icon: Activity, color: 'text-green-400' },
                    { label: 'Payloads Deployed', value: stats?.payloadsDeployed || 0, icon: Zap, color: 'text-yellow-400' },
                    { label: 'System Integrity', value: '99.8%', icon: Shield, color: 'text-purple-400' },
                  ].map((stat, i) => (
                    <CyberCard key={i} className="group hover:border-cyan-400/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-cyan-500/60 mb-1">{stat.label}</p>
                          <h4 className="text-2xl font-black tracking-tighter">
                            {stat.value}
                          </h4>
                        </div>
                        <stat.icon className={cn("w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity", stat.color)} />
                      </div>
                      <div className="mt-4 h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '70%' }}
                          className={cn("h-full", stat.color.replace('text', 'bg'))} 
                        />
                      </div>
                    </CyberCard>
                  ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <CyberCard title="Network Activity" className="lg:col-span-2 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_CHART_DATA}>
                        <defs>
                          <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#164e63" vertical={false} />
                        <XAxis dataKey="time" stroke="#0891b2" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#0891b2" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #0891b2', fontSize: '10px' }}
                          itemStyle={{ color: '#22d3ee' }}
                        />
                        <Area type="monotone" dataKey="traffic" stroke="#22d3ee" fillOpacity={1} fill="url(#colorTraffic)" />
                        <Area type="monotone" dataKey="pwned" stroke="#f472b6" fillOpacity={0} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CyberCard>

                  <CyberCard title="System Terminal" className="h-80 flex flex-col">
                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-4">
                      {terminalLogs.map((log, i) => (
                        <TerminalLine key={i} text={log.text} type={log.type} />
                      ))}
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="EXECUTE COMMAND..."
                        className="w-full bg-black/60 border border-cyan-500/30 px-3 py-2 text-[10px] font-mono focus:outline-none focus:border-cyan-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value;
                            addLog(`Executing: ${val}`, 'warning');
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-cyan-400 opacity-50" />
                    </div>
                  </CyberCard>
                </div>

                {/* Victims Table */}
                <CyberCard title="Recent Injections">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-cyan-500/20 text-[10px] uppercase tracking-widest text-cyan-500/60">
                          <th className="pb-3 font-bold">Target ID</th>
                          <th className="pb-3 font-bold">IP Address</th>
                          <th className="pb-3 font-bold">Platform</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold">Last Seen</th>
                          <th className="pb-3 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {victims.map((victim) => (
                          <tr key={victim.id} className="border-b border-cyan-500/5 hover:bg-white/5 transition-colors group">
                            <td className="py-4 font-mono text-cyan-400">{victim.id}</td>
                            <td className="py-4 opacity-70">{victim.ip}</td>
                            <td className="py-4">
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 opacity-40" />
                                {victim.os}
                              </div>
                            </td>
                            <td className="py-4">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] uppercase font-bold",
                                victim.status === 'online' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                              )}>
                                {victim.status}
                              </span>
                            </td>
                            <td className="py-4 opacity-50">{victim.lastSeen}</td>
                            <td className="py-4 text-right">
                              <button className="p-1.5 hover:bg-cyan-500/20 rounded-sm transition-colors">
                                <Eye className="w-3 h-3 text-cyan-400" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CyberCard>
              </motion.div>
            )}

            {activeTab === 'campaigns' && (
              <motion.div
                key="campaigns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {campaigns.map((campaign) => (
                  <CyberCard key={campaign.id} title={campaign.name}>
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs">
                        <span className="opacity-60">Status</span>
                        <span className={cn("font-bold uppercase", campaign.status === 'Active' ? "text-green-400" : "text-yellow-400")}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="opacity-60">Success Rate</span>
                        <span className="text-cyan-400 font-bold">{Math.round((campaign.pwned / campaign.targets) * 100)}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-cyan-500/5 border border-cyan-500/20 p-3 rounded-sm">
                          <p className="text-[9px] uppercase opacity-40 mb-1">Targets</p>
                          <p className="text-lg font-black">{campaign.targets}</p>
                        </div>
                        <div className="bg-pink-500/5 border border-pink-500/20 p-3 rounded-sm">
                          <p className="text-[9px] uppercase opacity-40 mb-1">Pwned</p>
                          <p className="text-lg font-black text-pink-400">{campaign.pwned}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button className="py-2 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/10 transition-all">
                          Analytics
                        </button>
                        <button 
                          onClick={handleExport}
                          className="py-2 border border-pink-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-pink-500/10 text-pink-400 transition-all"
                        >
                          Export
                        </button>
                      </div>
                    </div>
                  </CyberCard>
                ))}
                <button className="h-full min-h-[200px] border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 flex flex-col items-center justify-center gap-2 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Initialize New Campaign</span>
                </button>
              </motion.div>
            )}

            {activeTab === 'payloads' && (
              <motion.div
                key="payloads"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <button 
                    onClick={() => handleGeneratePayload('reverse_shell', 'Linux')}
                    className="p-6 border-2 border-dashed border-cyan-500/20 hover:border-cyan-500/40 flex flex-col items-center justify-center gap-4 transition-all group bg-cyan-500/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Terminal className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-black uppercase tracking-widest text-cyan-100">Reverse Shell</span>
                      <span className="text-[9px] uppercase font-bold opacity-40">Linux / Bash</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleGeneratePayload('keylogger', 'Windows')}
                    className="p-6 border-2 border-dashed border-pink-500/20 hover:border-pink-500/40 flex flex-col items-center justify-center gap-4 transition-all group bg-pink-500/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-black uppercase tracking-widest text-pink-100">Keylogger</span>
                      <span className="text-[9px] uppercase font-bold opacity-40">Windows / C++</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleGeneratePayload('persistence', 'macOS')}
                    className="p-6 border-2 border-dashed border-yellow-500/20 hover:border-yellow-500/40 flex flex-col items-center justify-center gap-4 transition-all group bg-yellow-500/5"
                  >
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Layers className="w-6 h-6 text-yellow-400" />
                    </div>
                    <div className="text-center">
                      <span className="block text-xs font-black uppercase tracking-widest text-yellow-100">Persistence</span>
                      <span className="text-[9px] uppercase font-bold opacity-40">macOS / Python</span>
                    </div>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {payloads.map((payload) => (
                    <CyberCard key={payload.id} className="flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-cyan-500/10 border border-cyan-500/30">
                          <Zap className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">{payload.id}</h4>
                          <p className="text-[9px] opacity-40 uppercase font-bold">{payload.type}</p>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 mb-4">
                        <div className="flex justify-between text-[10px]">
                          <span className="opacity-60">Platform</span>
                          <span className="text-cyan-400">{payload.platform}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="opacity-60">Status</span>
                          <span className="text-green-400">Ready</span>
                        </div>
                        <div className="mt-2 p-2 bg-black/60 border border-cyan-500/10 font-mono text-[8px] break-all opacity-60 max-h-20 overflow-y-auto custom-scrollbar">
                          {payload.content}
                        </div>
                      </div>
                      <button 
                        onClick={() => navigator.clipboard.writeText(payload.content)}
                        className="w-full py-2 bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/40 transition-all"
                      >
                        Copy Vector
                      </button>
                    </CyberCard>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'engine' && (
              <motion.div
                key="engine"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">NIGHTFURY Engine</h2>
                    <p className="text-xs text-cyan-500/60 uppercase tracking-widest font-bold">Polymorphic Evasion Module v4.2</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-cyan-500/30 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/10 transition-all">
                      Load Templates
                    </button>
                    <button className="px-4 py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      Deploy Vector
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CyberCard title="Input Vector">
                    <textarea 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="ENTER PAYLOAD CONTENT OR XSS VECTOR..."
                      className="w-full h-64 bg-black/40 border border-cyan-500/20 p-4 font-mono text-xs focus:outline-none focus:border-cyan-400 resize-none"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={engineConfig.autoValence}
                            onChange={(e) => setEngineConfig(prev => ({ ...prev, autoValence: e.target.checked }))}
                          />
                          <div className={cn("w-3 h-3 border border-cyan-500/50 group-hover:border-cyan-400", engineConfig.autoValence && "bg-cyan-400")} />
                          <span className="text-[10px] uppercase font-bold opacity-60">Emotional Valence</span>
                        </label>
                        <select 
                          value={engineConfig.technique}
                          onChange={(e) => setEngineConfig(prev => ({ ...prev, technique: e.target.value }))}
                          className="bg-black border border-cyan-500/30 text-[9px] uppercase font-bold px-2 py-1 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="">AUTO (VALENCE)</option>
                          <option value="polymorphic">POLYMORPHIC</option>
                          <option value="base64">CUSTOM B64</option>
                          <option value="jaden">JADEN CASE</option>
                        </select>
                      </div>
                      <button 
                        onClick={handleObfuscate}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-6 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-500/30 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? <Zap className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Process
                      </button>
                    </div>
                  </CyberCard>

                  <CyberCard title="Obfuscated Output">
                    <div className="relative">
                      <div className="w-full h-64 bg-black/60 border border-cyan-500/20 p-4 font-mono text-xs overflow-y-auto break-all">
                        {obfuscatedText || <span className="opacity-20 italic">AWAITING ENGINE OUTPUT...</span>}
                      </div>
                      {obfuscatedText && (
                        <button 
                          onClick={() => navigator.clipboard.writeText(obfuscatedText)}
                          className="absolute top-2 right-2 p-2 bg-black/80 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                        >
                          <Code className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold">
                        <span className="opacity-60">Entropy Level</span>
                        <span className="text-cyan-400">High (8.4 bits)</span>
                      </div>
                      <div className="h-1 bg-cyan-500/10 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-yellow-400/60 mt-2">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Warning: High entropy may trigger heuristic analysis.</span>
                      </div>
                    </div>
                  </CyberCard>
                </div>

                <CyberCard title="Engine Diagnostics">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Core Temp', value: '42°C', status: 'Normal' },
                      { label: 'Entropy Pool', value: '1.2 GB', status: 'Optimal' },
                      { label: 'Evasion Rate', value: '94.2%', status: 'High' },
                      { label: 'Active Vectors', value: '12', status: 'Stable' },
                    ].map((diag, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[9px] uppercase font-bold opacity-40">{diag.label}</p>
                        <p className="text-sm font-black tracking-tight">{diag.value}</p>
                        <p className="text-[8px] uppercase font-bold text-green-500">{diag.status}</p>
                      </div>
                    ))}
                  </div>
                </CyberCard>
              </motion.div>
            )}
            {activeTab === 'osint' && (
              <motion.div
                key="osint"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <CyberCard title="OSINT Vector Search">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={osintQuery}
                      onChange={(e) => setOsintQuery(e.target.value)}
                      placeholder="ENTER DOMAIN, IP, OR HANDLE..."
                      className="flex-1 bg-black/40 border border-cyan-500/20 px-4 py-2 font-mono text-xs focus:outline-none focus:border-cyan-400"
                      onKeyDown={(e) => e.key === 'Enter' && handleOsintSearch()}
                    />
                    <button 
                      onClick={handleOsintSearch}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-cyan-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-cyan-400 transition-all"
                    >
                      SCAN
                    </button>
                  </div>
                </CyberCard>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {osintResults.map((result, i) => (
                    <CyberCard key={i} title={result.source}>
                      <p className="text-xs font-mono opacity-80 break-all">{result.data}</p>
                    </CyberCard>
                  ))}
                  {osintResults.length === 0 && !isProcessing && (
                    <div className="md:col-span-3 h-40 flex items-center justify-center border border-dashed border-cyan-500/20">
                      <p className="text-[10px] uppercase font-bold opacity-40">No active OSINT data. Initialize scan.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="relative z-10 border-t border-cyan-500/20 bg-black/80 px-4 py-1 flex items-center justify-between text-[9px] uppercase tracking-widest font-bold text-cyan-500/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>C2 Connected</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>DB: PostgreSQL 16.2</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>Latency: 24ms</span>
          <span className="text-cyan-400">v9.4.2-STABLE</span>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
}
