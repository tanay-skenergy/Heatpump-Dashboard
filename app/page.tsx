"use client"

import { useState, useEffect } from "react"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ppdcvzdkejvrhtxkcftv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwZGN2emRrZWp2cmh0eGtjZnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTY0NjMsImV4cCI6MjA5MTAzMjQ2M30.HjffvhdU6rmBGsyyCU4kTl862RpZEzF07BAFD75MGOI' // Do NOT use the service_role key here!

export const supabase = createClient(supabaseUrl, supabaseKey)
import mqtt from "mqtt"
import { 
  Activity, Thermometer, Zap, Battery, Gauge as GaugeIcon, 
  Clock, TrendingUp, IndianRupee, ChevronDown, LogOut // <-- Added LogOut here
} from "lucide-react"
import { Card } from "@/components/ui/card"

const Gauge = ({ value, min, max, label }: { value: number; min: number; max: number; label: string }) => {
  const progress = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-80 h-40 overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 border-[20px] border-slate-800/50 rounded-full" />
        <div 
          className="absolute top-0 left-0 w-80 h-80 border-[20px] border-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          style={{ clipPath: `inset(0 0 50% 0)`, transform: `rotate(${(progress * 1.8) - 90}deg)` }}
        />
        <div className="absolute bottom-4 inset-x-0 flex flex-col items-center">
          <span className="text-5xl font-black text-white tracking-tighter">{label}</span>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [userProfile, setUserProfile] = useState({ name: "", device_id: "" });
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [dbLogCount, setDbLogCount] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [data, setData] = useState({
    waterTemp: 0, inletTemp: 0, outletTemp: 0, setTemp: 55, 
    voltage: 230, current: 0, outputPower: 18.5 
  }); 

  // 1. The Login Function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: dbUser } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', userInput)
      .eq('password', passwordInput)
      .single();

    if (dbUser) {
      const profile = { 
        name: dbUser.name || dbUser.username, 
        device_id: dbUser.assigned_device 
      };
      
      localStorage.setItem("sk_session", JSON.stringify(profile));
      setUserProfile(profile);
      setIsAuthenticated(true);
    } else { 
      alert("Invalid credentials"); 
    }
  };

  // 2. The Logout Function (Now correctly outside)
  const handleLogout = () => {
    localStorage.removeItem("sk_session");
    setIsAuthenticated(false);
    setUserProfile({ name: "", device_id: "" });
  };

  // 3. The Session Persistence Check
  useEffect(() => {
    const savedSession = localStorage.getItem("sk_session");
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession);
        setUserProfile(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Session error", e);
      }
    }
  }, []);

  useEffect(() => {
    // Stop here if no user is logged in or they don't have a device assigned yet
    if (!isAuthenticated || !userProfile.device_id) return;

    console.log(`🔄 Starting MQTT Connection for device: ${userProfile.device_id}...`);
    
    const client = mqtt.connect("wss://emqx.test2.win:10443/mqtt", {
      clientId: "sk_web_" + Math.random().toString(16).substring(2, 8),
      username: 'mqdevice', 
      password: 'MQDEVICE1431'
    });

    client.on("connect", () => { 
      console.log(`✅ MQTT Connected! Subscribing to ${userProfile.device_id}`);
      client.subscribe(`device/telemetry/${userProfile.device_id}`); 
    });

    client.on("error", (err) => {
      console.error("❌ MQTT Connection Failed!", err);
    });

    let lastSaveTime = 0; 

    client.on("message", async (topic, message) => {
      try {
        const p = JSON.parse(message.toString());
        const now = Date.now(); 
        
        setData(prev => ({ ...prev, 
          waterTemp: p.tank_temp ?? prev.waterTemp,
          current: p.current ?? prev.current,
          inletTemp: p.inlet_temp ?? prev.inletTemp,
          outletTemp: p.outlet_temp ?? prev.outletTemp
        }));

        {
          // Inside your MQTT message listener
const { error } = await supabase
  .from('device_logs')
  .insert([{ 
    // THIS IS THE AUTOMATION:
    device_id: userProfile.device_id, 
    
    tank_temp: p.tank_temp,
    inlet_temp: p.inlet_temp,
    outlet_temp: p.outlet_temp,
    current: p.current
  }]);

          if (!error) lastSaveTime = now; 
        }
      } catch (e) { 
        console.error("❌ Logic Error:", e); 
      }
    });

    // Cleanup connection when user logs out or leaves page
    return () => { if (client) client.end(); };
  }, [isAuthenticated, userProfile.device_id]); // <-- Re-runs when the logged-in user changes

  useEffect(() => {
    if (!isAuthenticated || !userProfile.device_id) return;

    const fetchHistory = async () => {
    console.log("🚨 FETCHING HISTORY FOR DEVICE ID:", userProfile.device_id); // ADD THIS LINE

    const { data: hData, error } = await supabase
      .from('device_logs').select('*')
      .eq('device_id', userProfile.device_id) 
      .order('created_at', { ascending: false }).limit(100);
    
    console.log("🚨 SUPABASE RETURNED:", hData, "ERROR:", error); // ADD THIS LINE
    
    if (!error && hData) setHistory(hData);
    // ... rest of the function

      const { count } = await supabase
        .from('device_logs').select('*', { count: 'exact', head: true })
        .eq('device_id', userProfile.device_id).gt('current', 0.5); // <-- Counts only this customer's logs
      
      if (count !== null) setDbLogCount(count);
    };
    
    fetchHistory();
  }, [activeTab, isAuthenticated, userProfile.device_id]);

  // Calculations
  const uptimeHours = (dbLogCount * 20) / 3600; 
  const powerInputKW = (data.voltage * data.current) / 1000;
  const cop = powerInputKW > 0 ? (data.outputPower / powerInputKW) : 0;
  const energyKWh = powerInputKW * uptimeHours;
  const minsToHeat = (data.setTemp - data.waterTemp) > 0 && powerInputKW > 0 
    ? Math.round((200 * 4.186 * (data.setTemp - data.waterTemp)) / (powerInputKW * 60)) : 0;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center">
          <div className="mb-8"><span className="text-2xl font-black text-[#0f172a]">sk<span className="text-orange-500">e</span>nergy.in</span></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Username" className="w-full p-4 rounded-xl border border-slate-200" required/>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" className="w-full p-4 rounded-xl border border-slate-200" required/>
            <button type="submit" className="w-full bg-[#0f172a] text-white py-4 rounded-xl font-bold">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="flex items-center gap-10">
             <span className="text-2xl font-black text-[#0f172a]">sk<span className="text-orange-500">e</span>nergy.in</span>
             <nav className="flex gap-6">
               <button onClick={() => setActiveTab('live')} className={`font-bold text-[10px] tracking-widest uppercase ${activeTab === 'live' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-slate-400'}`}>Live Dashboard</button>
               <button onClick={() => setActiveTab('history')} className={`font-bold text-[10px] tracking-widest uppercase ${activeTab === 'history' ? 'text-cyan-600 border-b-2 border-cyan-600' : 'text-slate-400'}`}>Data History</button>
             </nav>
          </div>
          {/* User Profile & Logout Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase">
                {userProfile.name ? userProfile.name.substring(0, 2) : "SK"}
              </div>
              <span className="text-xs font-bold text-slate-700 hidden sm:block">
                {userProfile.name}
              </span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg transition-colors uppercase tracking-widest"
            >
              <LogOut className="h-3 w-3" />
              Logout
            </button>
          </div>
        </header>

        {activeTab === 'live' ? (
          <div className="space-y-6">
            <div className="bg-orange-50/50 p-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold text-orange-600 uppercase tracking-widest">
               <Clock className="h-3 w-3" /> System Status: {data.current > 0.5 ? 'Working' : 'Standby'}
            </div>

            {/* Top Row: Gauge and Setpoint */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Card className="lg:col-span-8 bg-[#0B0E14] p-8 rounded-3xl shadow-2xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Tank Temperature</span>
                <Gauge value={data.waterTemp} min={20} max={80} label={`${data.waterTemp.toFixed(1)}°C`} />
              </Card>
              <Card className="lg:col-span-4 bg-[#0B0E14] p-8 rounded-3xl shadow-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Set Point</span>
                  <h2 className="text-7xl font-black text-white mt-4">{data.setTemp}°C</h2>
                </div>
                <div className="border-t border-slate-800 pt-6">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Est. Time to Heat</span>
                  <p className="text-xl font-bold text-cyan-400 mt-2">{minsToHeat} Minutes</p>
                </div>
              </Card>
            </div>

            {/* Grid of 8 Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Voltage", val: `${data.voltage} V`, icon: <Zap className="h-3 w-3" /> },
                { label: "Compressor Current", val: `${data.current.toFixed(1)} A`, icon: <Activity className="h-3 w-3" /> },
                { label: "Outlet Temp", val: `${data.outletTemp}°C`, icon: <Thermometer className="h-3 w-3 text-red-400" /> },
                { label: "System COP", val: cop.toFixed(2), icon: <TrendingUp className="h-3 w-3 text-cyan-400" /> },
                { label: "Inlet Temp", val: `${data.inletTemp}°C`, icon: <Thermometer className="h-3 w-3 text-blue-400" /> },
                { label: "Machine Uptime", val: `${uptimeHours.toFixed(1)} HRS`, icon: <Clock className="h-3 w-3" /> },
                { label: "Total Savings", val: `₹${Math.round(energyKWh * 9)}`, icon: <IndianRupee className="h-3 w-3 text-emerald-500" /> },
                { label: "Total Load", val: `${energyKWh.toFixed(1)} kWh`, icon: <Battery className="h-3 w-3" /> },
              ].map((item, i) => (
                <Card key={i} className="p-6 bg-[#0B0E14] border-none shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-500">{item.icon}</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="text-2xl font-black text-white">{item.val}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="rounded-3xl p-8 bg-white shadow-sm border-none">
            <h2 className="text-xl font-black text-slate-900 mb-6">Device History (Last 50 Intervals)</h2>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b">
                     <th className="pb-4">Timestamp</th>
                     <th className="pb-4">Tank Temp</th>
                     <th className="pb-4">Inlet Temp</th>
                     <th className="pb-4">Current</th>
                     <th className="pb-4">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                  {history.map((row, i) => (
                    <tr key={i} className="text-sm">
                      <td className="py-4 text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}</td>
                      <td className="py-4 text-blue-500 font-bold">{row.tank_temp}°C</td>
                      <td className="py-4 text-blue-500 font-bold">{row.inlet_temp}°C</td>
                      <td className="py-4 text-blue-500 font-bold">{row.current}A</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${row.current > 0.5 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {row.current > 0.5 ? 'Running' : 'Standby'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
               </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}