import React, { useEffect, useState } from 'react';
import { fetchSensorData, parseDate, formatFriendlyDate, formatDateTime } from './services/dataService';
import { SensorData, GatewayStatus, SheetRow } from './types';
import { StatusBadge } from './components/StatusBadge';
import { SystemHealth } from './components/SystemHealth';
import { WaterLevelChart } from './components/WaterLevelChart';
import { DataLogs } from './components/DataLogs';
import { Droplets, RefreshCw, ArrowLeft, Clock, LayoutDashboard, FileText, AlertTriangle, Zap, Calendar, ChevronRight, Check, AlertOctagon } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [gateway, setGateway] = useState<GatewayStatus | null>(null);
  const [logs, setLogs] = useState<SheetRow[]>([]);
  
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'logs'>('dashboard');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSensorData();
      setSensors(data.sensors);
      setGateway(data.gateway);
      setLogs(data.logs);
      setLastRefreshed(new Date());

      if (selectedSensor) {
        const updated = data.sensors.find(s => s.id === selectedSensor.id);
        if (updated) setSelectedSensor(updated);
      }
    } catch (err: any) {
      console.error(err);
      const message = err.message && err.message.length > 0 && err.message !== "Failed to fetch" 
        ? err.message 
        : "Connection failed. Please ensure your Google Sheet is active and accessible.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (dateStr: string) => {
    const ts = parseDate(dateStr);
    if (ts === 0) return 'Unknown';
    
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return 'Just now';
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-xl bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg shadow-md shadow-blue-600/20">
                <Droplets className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">WaterMonitor</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IoT Dashboard</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 mx-6 bg-slate-100/50 p-1 rounded-full border border-slate-200/50">
                <button 
                  onClick={() => { setActiveTab('dashboard'); setSelectedSensor(null); }}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button 
                  onClick={() => { setActiveTab('logs'); setSelectedSensor(null); }}
                  className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'logs' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  <FileText size={16} /> Logs
                </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block border-r border-slate-100 pr-4 mr-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Updated</span>
                <span className="block text-xs font-mono font-semibold text-slate-700">{lastRefreshed.toLocaleTimeString()}</span>
              </div>
              <button 
                onClick={loadData}
                className={`p-2 rounded-full hover:bg-slate-100 border border-slate-200 hover:border-slate-300 hover:text-blue-600 transition-all ${loading ? 'animate-spin text-blue-600 bg-blue-50 border-blue-200' : 'text-slate-500'}`}
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Tabs */}
        <div className="grid grid-cols-2 md:hidden border-t border-slate-100 bg-white">
           <button 
              onClick={() => { setActiveTab('dashboard'); setSelectedSensor(null); }}
              className={`py-3 text-xs font-bold uppercase tracking-wide text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'dashboard' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500'}`}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('logs'); setSelectedSensor(null); }}
              className={`py-3 text-xs font-bold uppercase tracking-wide text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'logs' ? 'border-blue-600 text-blue-600 bg-blue-50/50' : 'border-transparent text-slate-500'}`}
            >
              <FileText size={14} /> Logs
            </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-4 text-red-800 shadow-sm animate-in slide-in-from-top-2">
            <div className="bg-red-100 p-2 rounded-full shrink-0">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-red-900">Sync Error</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
            </div>
            <button 
              onClick={loadData} 
              className="px-4 py-2 bg-white border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-red-50 shadow-sm"
            >
              Retry
            </button>
          </div>
        )}

        {/* Gateway Status */}
        {gateway && activeTab === 'dashboard' && !selectedSensor && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <SystemHealth status={gateway} />
          </div>
        )}

        {/* Content Area */}
        {loading && sensors.length === 0 ? (
           <div className="flex flex-col justify-center items-center h-96 animate-in fade-in">
             <div className="relative mb-8">
               <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
               <div className="relative rounded-full bg-white p-4 shadow-xl border border-blue-100">
                 <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
               </div>
             </div>
             <p className="text-slate-900 font-semibold text-lg">Synchronizing</p>
             <p className="text-slate-500 text-sm mt-2">Fetching latest telemetry...</p>
           </div>
        ) : activeTab === 'logs' ? (
           <div className="animate-in fade-in duration-300">
             <DataLogs logs={logs} error={error} />
           </div>
        ) : selectedSensor ? (
          // Detailed View
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setSelectedSensor(null)}
              className="group flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium"
            >
              <div className="p-1.5 rounded-lg bg-white border border-slate-200 group-hover:border-blue-300 mr-2 shadow-sm transition-all">
                 <ArrowLeft className="h-4 w-4" />
              </div>
              Back to Overview
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between md:items-start gap-6 bg-gradient-to-b from-white to-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedSensor.name}</h2>
                    <StatusBadge status={selectedSensor.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                     <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{selectedSensor.id}</span>
                     <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        Updated {getTimeAgo(selectedSensor.lastUpdated)}
                     </span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-6">
                    <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Level</div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-slate-900 tracking-tighter">{selectedSensor.currentLevel}</span>
                            <span className="text-lg font-medium text-slate-400">cm</span>
                        </div>
                    </div>
                    <div className="hidden sm:block h-10 w-px bg-slate-100"></div>
                    <div className="sm:min-w-[200px]">
                         <IrrigationAdvice level={selectedSensor.currentLevel} />
                    </div>
                </div>
              </div>
              
              <div className="p-6 md:p-8">
                <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  Real-time Water Level
                </h3>
                <WaterLevelChart data={selectedSensor.history} />
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-6 md:p-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={14} />
                  Telemetry Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DetailCard label="Last Received" value={formatDateTime(selectedSensor.raw["Gateway Received Time"])} />
                  <DetailCard label="Batch Upload" value={formatDateTime(selectedSensor.raw["Batch Upload Time"])} />
                  <DetailCard label="Signal Quality" value={`${selectedSensor.raw["GSM Strength (RSSI)"] || '-'} CSQ`} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Grid View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {sensors.length === 0 && !loading && !error && (
               <div className="col-span-full flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 border-dashed text-center">
                 <div className="bg-slate-50 p-4 rounded-full mb-4">
                   <LayoutDashboard className="h-10 w-10 text-slate-300" />
                 </div>
                 <h3 className="text-lg font-semibold text-slate-900">No Sensors Connected</h3>
                 <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Waiting for data transmission. Check if the Gateway is online and transmitting.</p>
               </div>
            )}

            {sensors.map((sensor) => (
              <div 
                key={sensor.id}
                onClick={() => setSelectedSensor(sensor)}
                className="group bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6 cursor-pointer hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                       <Droplets className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{sensor.name}</h3>
                      <div className="text-xs text-slate-400 font-mono">{sensor.id}</div>
                    </div>
                  </div>
                  <StatusBadge status={sensor.status} />
                </div>
                
                <div className="mb-4">
                   <div className="flex items-baseline gap-1">
                     <span className="text-4xl font-extrabold text-slate-800 tracking-tighter group-hover:text-blue-600 transition-colors">{sensor.currentLevel}</span>
                     <span className="text-lg font-medium text-slate-400">cm</span>
                   </div>
                   <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${Math.min(Math.max((sensor.currentLevel / 100) * 100, 5), 100)}%` }} 
                      ></div>
                   </div>
                   
                   <IrrigationAdvice level={sensor.currentLevel} />
                </div>
                
                <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock size={14} className="text-slate-400" />
                      {getTimeAgo(sensor.lastUpdated)}
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                     View Details <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const DetailCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
    <span className="font-mono font-semibold text-sm text-slate-700 break-all">{value}</span>
  </div>
);

const IrrigationAdvice = ({ level }: { level: number }) => {
  if (level < 5) {
    return (
      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 animate-pulse">
         <div className="bg-blue-200/50 p-1 rounded-full"><Droplets size={14} /></div>
         <span className="text-xs font-bold uppercase tracking-tight">Irrigate the plot</span>
      </div>
    );
  }
  if (level >= 20) {
    return (
      <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
         <div className="bg-red-200/50 p-1 rounded-full"><AlertOctagon size={14} /></div>
         <span className="text-xs font-bold uppercase tracking-tight">Stop irrigating the plot</span>
      </div>
    );
  }
  return (
    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
         <div className="bg-emerald-200/50 p-1 rounded-full"><Check size={14} /></div>
         <span className="text-xs font-bold uppercase tracking-tight">Water Level Optimal</span>
    </div>
  );
};

export default App;