import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    Thermometer, Droplets, Wind, Lightbulb, Bot, Leaf, Sprout, Building, LogIn, LogOut, Settings, Bell, 
    Sparkles, TestTube2, Microscope, BrainCircuit, Globe, Tractor, Rocket, 
    ChevronRight, AlertTriangle, CheckCircle, Power, HelpCircle, Sun, Fan, Pipette, Camera, Box,
    Map, Cpu, GitBranch, Share2, Code, Factory, Dna
} from 'lucide-react';

// --- CONTEXTO DE DATOS (PREPARADO PARA CONEXIÓN REAL) ---
// Este contexto actúa como nuestro "doble digital" del hardware, proveyendo un flujo
// constante de datos realistas para que toda la aplicación funcione de forma natural.
const DataContext = createContext();

const mockDataGenerator = () => ({
  temperatura: (22 + Math.random() * 8).toFixed(1),
  humedadAire: (65 + Math.random() * 10).toFixed(1),
  humedadSuelo: (55 + Math.random() * 15).toFixed(1),
  luz: Math.floor(800 + Math.random() * 400),
  co2: Math.floor(400 + Math.random() * 150),
  phSuelo: (6.0 + Math.random() * 0.8).toFixed(2),
  consumoEnergia: (150 + Math.random() * 50).toFixed(2), // Watts
  nivelAguaTanque: (85 + Math.random() * 15).toFixed(1), // %
  timestamp: new Date().getTime(),
});

const DataProvider = ({ children }) => {
  const [liveData, setLiveData] = useState(mockDataGenerator());
  const [history, setHistory] = useState(() => {
    const initialHistory = [];
    for (let i = 0; i < 30; i++) {
      initialHistory.push({
        ...mockDataGenerator(),
        name: new Date(Date.now() - (29 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    return initialHistory;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = mockDataGenerator();
      setLiveData(newData);
      setHistory(prevHistory => {
        const newHistory = [...prevHistory.slice(1), { ...newData, name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
        return newHistory;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ liveData, history }}>
      {children}
    </DataContext.Provider>
  );
};

const useData = () => useContext(DataContext);

// --- COMPONENTES DE UI REUTILIZABLES ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-4 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ icon, title, value, unit, color }) => (
  <Card className="flex flex-col justify-between text-center">
    <div className="flex items-center text-gray-400 justify-center">
      {icon}
      <span className="ml-2 text-sm font-medium">{title}</span>
    </div>
    <div className="mt-2">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-md text-gray-300 ml-1">{unit}</span>
    </div>
  </Card>
);

const ToggleButton = ({ icon, label, isActive, onToggle }) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        {icon}
        <span className="text-white ml-2">{label}</span>
      </div>
      <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-gray-600'}`}>
        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-1'}`}/>
      </button>
    </div>
);


// --- CAPA 1: EL INVERNADERO CONECTADO (MÓDULO PERFECCIONADO) ---

const HistoryChart = () => {
  const { history } = useData();
  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Historial Ambiental</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/><stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} />
          <YAxis stroke="#a0aec0" tick={{ fontSize: 12 }} />
          <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
          <Legend wrapperStyle={{fontSize: "14px"}} />
          <Area type="monotone" dataKey="temperatura" stroke="#f87171" fillOpacity={1} fill="url(#colorTemp)" name="Temp (°C)" />
          <Area type="monotone" dataKey="humedadAire" stroke="#60a5fa" fillOpacity={1} fill="url(#colorHum)" name="Hum. Aire (%)" />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

const CameraFeed = () => {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setLastUpdated(new Date()), 10000); // Simula una nueva foto cada 10s
        return () => clearInterval(timer);
    }, []);

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Camera className="mr-2"/>Monitor Visual</h3>
            <div className="flex-grow bg-black rounded-lg relative overflow-hidden">
                <img 
                    src={`https://placehold.co/600x400/000000/FFFFFF?text=Planta+Tomate\\n(Feed+en+Vivo)&random=${lastUpdated.getTime()}`} 
                    alt="Live feed from greenhouse" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    <span className="relative flex h-2 w-2 mr-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span></span>
                    EN VIVO
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Última captura: {lastUpdated.toLocaleTimeString()}</p>
        </Card>
    );
};

const BimViewer = () => (
    <Card className="h-full flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><Box className="mr-2"/>Gemelo Digital BIM</h3>
        <div className="flex-grow bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
            <div className="text-center text-gray-500">
                <Box size={48} className="mx-auto"/>
                <p className="mt-2 font-semibold">Cargando Modelo BIM...</p>
                <p className="text-xs">(Aquí se integrará el visor `web-ifc-viewer`)</p>
            </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Interactúa con la réplica 1:1 de tu invernadero.</p>
    </Card>
);

const ControlPanel = () => {
  const [controls, setControls] = useState({ ventilacion: false, riego: true, luces: true });
  const toggleControl = (control) => setControls(prev => ({ ...prev, [control]: !prev[control] }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Panel de Control</h3>
      <div className="space-y-4">
        <ToggleButton icon={<Fan className="h-5 w-5 text-gray-400" />} label="Ventilación" isActive={controls.ventilacion} onToggle={() => toggleControl('ventilacion')} />
        <ToggleButton icon={<Pipette className="h-5 w-5 text-gray-400" />} label="Sistema de Riego" isActive={controls.riego} onToggle={() => toggleControl('riego')} />
        <ToggleButton icon={<Sun className="h-5 w-5 text-gray-400" />} label="Luces de Crecimiento" isActive={controls.luces} onToggle={() => toggleControl('luces')} />
      </div>
    </Card>
  );
};

const AiRootCauseAnalysis = () => {
    const { liveData } = useData();
    const [analysis, setAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const showAlert = parseFloat(liveData.temperatura) > 28;

    const getAnalysis = async () => {
        setIsLoading(true);
        setAnalysis(null);
        const prompt = `Actúa como un ingeniero de control y agrónomo experto para un invernadero de tomates en Lima, Perú. Se ha detectado una alerta de temperatura alta. Los datos actuales son: Temperatura=${liveData.temperatura}°C, Humedad Aire=${liveData.humedadAire}%, Humedad Suelo=${liveData.humedadSuelo}%. Basado en estos datos, genera un diagnóstico diferencial con la causa raíz más probable y sugiere una acción de mitigación inmediata. Sé conciso y directo, en formato: Causa Probable: [tu causa]. Acción Sugerida: [tu acción].`;
        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            if (!response.ok) throw new Error(`API request failed`);
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            const probableCauseMatch = text.match(/Causa Probable: (.*?)\./);
            const actionMatch = text.match(/Acción Sugerida: (.*)/);
            setAnalysis({
                probableCause: probableCauseMatch ? probableCauseMatch[1] : "Análisis no concluyente.",
                action: actionMatch ? actionMatch[1] : "Revisar sistemas manualmente."
            });
        } catch (error) {
            console.error("Error fetching Gemini API:", error);
            setAnalysis({ probableCause: "Error de conexión con la IA.", action: "Verificar la conexión a internet." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className={!showAlert ? 'opacity-50' : ''}>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center"><HelpCircle className="mr-2"/>Análisis de Causa Raíz (IA)</h3>
            {showAlert ? (
                <div className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded-lg flex items-center animate-pulse">
                    <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3"/>
                    <p className="font-bold text-yellow-300">Alerta Activa: Temperatura Alta</p>
                </div>
            ) : (
                <div className="bg-green-900/30 border border-green-500/50 p-3 rounded-lg flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-3"/>
                    <p className="font-bold text-green-300">Sistemas en Parámetros</p>
                </div>
            )}
            <button onClick={getAnalysis} disabled={isLoading || !showAlert} className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isLoading ? <BrainCircuit className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}
                {isLoading ? 'IA Investigando...' : 'Consultar IA'}
            </button>
            {analysis && (
                <div className="mt-4 space-y-2 animate-fade-in text-sm">
                    <p><strong className="text-yellow-400">Causa Probable:</strong> {analysis.probableCause}</p>
                    <p><strong className="text-yellow-400">Acción Sugerida:</strong> {analysis.action}</p>
                </div>
            )}
        </Card>
    );
};

const DashboardModule = () => {
  const { liveData } = useData();
  const [activeTab, setActiveTab] = useState('general');
  const tabs = { general: 'Vista General', ambiental: 'Análisis Ambiental', cultivo: 'Salud del Cultivo' };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex space-x-2 border-b border-gray-700">
            {Object.keys(tabs).map(tabKey => (
                 <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tabKey ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'}`}>{tabs[tabKey]}</button>
            ))}
        </div>
        {activeTab === 'general' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <KpiCard icon={<Thermometer className="h-6 w-6" />} title="Temperatura" value={liveData.temperatura} unit="°C" color="text-red-400" />
                    <KpiCard icon={<Droplets className="h-6 w-6" />} title="Humedad Aire" value={liveData.humedadAire} unit="%" color="text-blue-400" />
                    <KpiCard icon={<Power className="h-6 w-6" />} title="Consumo" value={liveData.consumoEnergia} unit="W" color="text-green-400" />
                    <KpiCard icon={<Leaf className="h-6 w-6" />} title="Humedad Suelo" value={liveData.humedadSuelo} unit="%" color="text-yellow-600" />
                    <KpiCard icon={<TestTube2 className="h-6 w-6" />} title="pH Suelo" value={liveData.phSuelo} unit="" color="text-purple-400" />
                    <KpiCard icon={<Pipette className="h-6 w-6" />} title="Tanque Agua" value={liveData.nivelAguaTanque} unit="%" color="text-cyan-400" />
                </div>
                <div className="space-y-6"><ControlPanel /><AiRootCauseAnalysis /></div>
            </div>
        )}
        {activeTab === 'ambiental' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in"><HistoryChart /><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><KpiCard icon={<Sun className="h-8 w-8" />} title="Luz (PAR)" value={liveData.luz} unit="µmol/m²" color="text-yellow-400" /><KpiCard icon={<Wind className="h-8 w-8" />} title="CO2" value={liveData.co2} unit="ppm" color="text-gray-300" /></div></div>)}
        {activeTab === 'cultivo' && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in"><CameraFeed /><BimViewer /></div>)}
    </div>
  );
};


// --- CAPA 2: ORÁCULO ESTRATÉGICO (MÓDULO PERFECCIONADO CON SIMULACIÓN INTERACTIVA) ---

// Componente para la visualización del crecimiento de la planta
const PlantVisualizer = ({ day, totalDays }) => {
    const growthPercentage = day / totalDays;
    let stage = 'Semilla';
    let PlantIcon = Sprout;
    let color = 'text-yellow-400';
    let size = 24 + (growthPercentage * 40);

    if (growthPercentage > 0.2) {
        stage = 'Crecimiento Vegetativo';
        PlantIcon = Leaf;
        color = 'text-green-400';
    }
    if (growthPercentage > 0.6) {
        stage = 'Floración';
        PlantIcon = Sparkles;
        color = 'text-pink-400';
    }
    if (growthPercentage > 0.8) {
        stage = 'Fructificación';
        PlantIcon = Bot; // Placeholder for fruit
        color = 'text-red-400';
    }
    if (growthPercentage >= 1) {
        stage = 'Cosecha';
    }

    return (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 rounded-lg p-4">
            <PlantIcon size={size} className={`transition-all duration-500 ${color}`} />
            <p className="mt-4 text-lg font-semibold">{stage}</p>
            <p className="text-sm text-gray-400">Día {day} de {totalDays}</p>
        </div>
    );
};


const SimulatorModule = () => {
    const [simulationResult, setSimulationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [marketPrice, setMarketPrice] = useState(null);
    
    // Estados para el Oráculo Temporal
    const [simHistory, setSimHistory] = useState([]);
    const [currentDay, setCurrentDay] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef(null);

    // Simula la conexión a un API de mercado
    useEffect(() => {
        const prices = { Tomate: 3.50, Lechuga: 2.80, Arándano: 12.50 };
        setMarketPrice(prices);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentDay(prevDay => {
                    if (prevDay >= (simulationResult?.diasCosecha || 0)) {
                        setIsPlaying(false);
                        return prevDay;
                    }
                    return prevDay + 1;
                });
            }, 200);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, simulationResult]);


    const runSimulation = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSimulationResult(null);
        setSimHistory([]);
        setCurrentDay(0);
        setIsPlaying(false);

        const form = e.target;
        const cultivo = form.cultivo.value;
        const ubicacion = form.ubicacion.value;
        const escenario = form.escenario.value;
        const estrategia = form.estrategia.value;

        setTimeout(() => {
            const diasCosecha = Math.floor(60 + Math.random() * 30);
            const baseRendimiento = 5 + Math.random() * 2;
            const baseCosto = 150 + Math.random() * 50;
            const precio = marketPrice[cultivo] || 5;

            let rendimiento = baseRendimiento;
            let costo = baseCosto;

            if (estrategia === 'max_ganancia') {
                rendimiento *= 1.15; // Aumenta rendimiento
                costo *= 1.2; // Aumenta costo
            } else if (estrategia === 'ecologico') {
                rendimiento *= 0.9; // Reduce rendimiento
                costo *= 0.75; // Reduce costo
            }
            
            const rentabilidadNeta = (rendimiento * diasCosecha * precio) - costo;

            const newSimResult = {
                cultivo, ubicacion, escenario, estrategia,
                diasCosecha,
                costoTotal: costo.toFixed(2),
                rendimientoFinal: rendimiento.toFixed(1),
                rentabilidadNeta: rentabilidadNeta.toFixed(2),
            };
            setSimulationResult(newSimResult);

            // Generar historial para el Oráculo Temporal
            const history = Array.from({ length: diasCosecha + 1 }, (_, i) => ({
                day: i,
                growth: (i / diasCosecha) * 100,
            }));
            setSimHistory(history);

            setIsLoading(false);
        }, 2500);
    };
    
    return (
        <div className="p-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><Rocket className="mr-2"/>Oráculo Estratégico</h3>
                        <p className="text-gray-400 mb-6">Define tus objetivos, viaja al futuro y descubre la estrategia óptima para tu cultivo.</p>
                        <form onSubmit={runSimulation} className="space-y-4">
                            <div><label className="text-sm font-medium text-gray-300">Cultivo</label><select name="cultivo" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"><option value="Tomate">Tomate (Río Grande)</option><option value="Lechuga">Lechuga (Orgánica)</option><option value="Arándano">Arándano (Biloxi)</option></select></div>
                            <div><label className="text-sm font-medium text-gray-300">Ubicación</label><select name="ubicacion" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"><option>Arequipa (Sierra)</option><option>La Molina (Costa)</option></select></div>
                            <div><label className="text-sm font-medium text-gray-300">Escenario (Lenguaje Natural)</label><input name="escenario" defaultValue="Un verano con una ola de calor extremo" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white" /></div>
                            <div>
                                <label className="text-sm font-medium text-gray-300">Estrategia de Optimización</label>
                                <select name="estrategia" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                    <option value="balanceado">Balanceado</option>
                                    <option value="max_ganancia">Maximizar Ganancia</option>
                                    <option value="ecologico">Modo Ecológico (Ahorro)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 flex items-center justify-center">{isLoading ? <Bot className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}{isLoading ? 'Calculando Futuro...' : 'Ejecutar Simulación'}</button>
                        </form>
                    </Card>
                     {marketPrice && <Card className="mt-4"><h4 className="text-lg font-bold text-white mb-2 flex items-center"><DollarSign className="mr-2"/>Mercado Hoy</h4><div className="text-sm space-y-1">{Object.entries(marketPrice).map(([key, value]) => <p key={key}>{key}: <span className="font-bold text-green-400">S/ {value.toFixed(2)}/kg</span></p>)}</div></Card>}
                </div>
                <div className="lg:col-span-2">
                    {isLoading && <div className="flex items-center justify-center h-full"><Bot className="h-16 w-16 text-green-500 animate-spin" /><p className="ml-4 text-xl">La IA está creando una realidad virtual para ti...</p></div>}
                    {simulationResult && (
                        <div className="space-y-6">
                            <Card className="animate-fade-in">
                                <h3 className="text-2xl font-bold text-white mb-4">Reporte de Simulación</h3>
                                <div className="grid grid-cols-2 gap-4 text-white">
                                   <div className="bg-gray-700/50 p-4 rounded-lg text-center"><p className="text-sm text-gray-400">Tiempo a Cosecha</p><p className="text-2xl font-semibold">{simulationResult.diasCosecha} días</p></div>
                                   <div className="bg-gray-700/50 p-4 rounded-lg text-center"><p className="text-sm text-gray-400">Rendimiento Est.</p><p className="text-2xl font-semibold">{simulationResult.rendimientoFinal} kg/m²</p></div>
                                   <div className="col-span-2 bg-green-800/50 p-4 rounded-lg text-center"><p className="text-sm text-green-300">Rentabilidad Neta Estimada</p><p className="text-4xl font-bold text-green-400">S/ {simulationResult.rentabilidadNeta}</p></div>
                                </div>
                            </Card>
                            <Card className="animate-fade-in">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><Bot className="mr-2"/>Oráculo Temporal</h3>
                                <div className="grid grid-cols-2 gap-4 h-64">
                                    <PlantVisualizer day={currentDay} totalDays={simulationResult.diasCosecha} />
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-400 mb-2">Evolución del Crecimiento</p>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={simHistory}>
                                                <XAxis dataKey="day" stroke="#a0aec0" tick={{ fontSize: 10 }} label={{ value: 'Días', position: 'insideBottom', offset: -5 }} />
                                                <YAxis stroke="#a0aec0" tick={{ fontSize: 10 }} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                                                <Line type="monotone" dataKey="growth" stroke="#84e1bc" strokeWidth={2} dot={false} name="% Crecimiento" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <input type="range" min="0" max={simulationResult.diasCosecha} value={currentDay} onChange={(e) => setCurrentDay(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    <div className="flex justify-center items-center space-x-4 mt-2">
                                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-gray-700 rounded-full hover:bg-green-600">
                                            {isPlaying ? <Pause/> : <Play/>}
                                        </button>
                                        <p className="text-lg font-bold">{currentDay} / {simulationResult.diasCosecha} días</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- CAPA 2: ORÁCULO ESTRATÉGICO (MÓDULO PERFECCIONADO) ---

// Componente para la visualización individual de la planta en la cuadrícula
const PlantVisualizer = ({ growth, hasPest, isSelected }) => {
    let PlantIcon = Sprout;
    let color = 'text-yellow-500';
    let sizeClass = 'w-6 h-6';

    if (growth > 0.15) { PlantIcon = Leaf; color = 'text-green-500'; sizeClass = 'w-8 h-8'; }
    if (growth > 0.6) { PlantIcon = Sparkles; color = 'text-pink-400'; sizeClass = 'w-10 h-10'; }
    if (growth > 0.8) { PlantIcon = Bot; color = 'text-red-500'; sizeClass = 'w-12 h-12'; }

    return (
        <div className={`relative flex items-center justify-center w-full h-full rounded-md transition-all duration-300 ${isSelected ? 'bg-green-500/30' : 'bg-black/20'}`}>
            <PlantIcon className={`${sizeClass} ${color} transition-all duration-500`} />
            {hasPest && <Bug className="absolute top-1 right-1 h-4 w-4 text-orange-400 animate-pulse" />}
        </div>
    );
};

// El nuevo simulador "Tycoon"
const SimulatorModule = () => {
    const [simulationResult, setSimulationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [marketPrice, setMarketPrice] = useState({ Tomate: 3.50, Lechuga: 2.80, Arándano: 12.50 });
    
    // Estados para el Oráculo Temporal
    const [simHistory, setSimHistory] = useState([]);
    const [events, setEvents] = useState([]);
    const [currentDay, setCurrentDay] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentDay(prevDay => {
                    if (prevDay >= (simulationResult?.diasCosecha || 0)) {
                        setIsPlaying(false);
                        return prevDay;
                    }
                    return prevDay + 1;
                });
            }, 100); // Más rápido para una mejor experiencia visual
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, simulationResult]);

    const runSimulation = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Resetear estados
        setSimulationResult(null); setSimHistory([]); setEvents([]); setCurrentDay(0); setIsPlaying(false);

        // ... Lógica de simulación (igual que antes) ...
        const diasCosecha = 90; // Duración fija para la demo
        
        // --- Generación de Simulación Granular (NUEVO) ---
        // Se crea un historial para cada una de las 24 plantas
        const gridPlants = 24;
        let newHistory = Array.from({ length: diasCosecha + 1 }, () => ({ day: 0, plants: [] }));
        let newEvents = [];

        for (let i = 0; i < gridPlants; i++) {
            let hasPestEvent = Math.random() < 0.15; // 15% de probabilidad de plaga por planta
            let pestDay = 0;
            if(hasPestEvent) {
                pestDay = Math.floor(30 + Math.random() * 30);
                newEvents.push({day: pestDay, plantId: i, type: 'Plaga Detectada', icon: Bug});
            }

            for (let day = 0; day <= diasCosecha; day++) {
                // Cada planta tiene una ligera variación en su crecimiento
                const growthVariation = 1 + (Math.random() - 0.5) * 0.1;
                let growth = (day / diasCosecha) * growthVariation;
                if(hasPestEvent && day > pestDay) {
                    growth *= 0.7; // La plaga reduce el crecimiento
                }
                newHistory[day].day = day;
                newHistory[day].plants.push({
                    id: i,
                    growth: Math.min(1, growth),
                    hasPest: hasPestEvent && day > pestDay,
                });
            }
        }
        
        setTimeout(() => {
            setSimulationResult({ diasCosecha, rentabilidadNeta: (2000 + Math.random() * 500).toFixed(2) });
            setSimHistory(newHistory);
            setEvents(newEvents);
            setIsLoading(false);
        }, 2500);
    };
    
    return (
        <div className="p-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna de Controles */}
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><Rocket className="mr-2"/>Oráculo Estratégico</h3>
                        <p className="text-gray-400 mb-6">Define tus objetivos, viaja al futuro y descubre la estrategia óptima para tu cultivo.</p>
                        <form onSubmit={runSimulation} className="space-y-4">
                           {/* ... (Formulario igual que antes) ... */}
                           <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 flex items-center justify-center">{isLoading ? <Bot className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}{isLoading ? 'Calculando Futuro...' : 'Ejecutar Simulación'}</button>
                        </form>
                    </Card>
                    {events.length > 0 && (
                        <Card className="mt-4">
                             <h4 className="text-lg font-bold text-white mb-2">Registro de Eventos</h4>
                             <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                                {events.map(event => (
                                    <div key={`${event.day}-${event.plantId}`} className={`flex items-center p-2 rounded-md ${currentDay >= event.day ? 'bg-yellow-900/50' : 'bg-gray-700/50 opacity-50'}`}>
                                        <event.icon className="h-5 w-5 text-yellow-400 mr-2"/>
                                        <p>Día {event.day}: {event.type} en Planta #{event.plantId + 1}</p>
                                    </div>
                                ))}
                             </div>
                        </Card>
                    )}
                </div>
                {/* Columna de Visualización */}
                <div className="lg:col-span-2">
                    {isLoading && <div className="flex items-center justify-center h-full"><Bot className="h-16 w-16 text-green-500 animate-spin" /><p className="ml-4 text-xl">La IA está creando una realidad virtual para ti...</p></div>}
                    {simulationResult && (
                        <div className="space-y-6">
                            <Card className="animate-fade-in">
                                <h3 className="text-2xl font-bold text-white mb-4">Invernadero Virtual 2D "Tycoon"</h3>
                                <div className="grid grid-cols-6 gap-2 bg-stone-800 p-2 rounded-lg">
                                    {simHistory[currentDay]?.plants.map(plant => (
                                        <PlantVisualizer key={plant.id} growth={plant.growth} hasPest={plant.hasPest} />
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-center font-bold text-2xl mb-2">Día {currentDay} / {simulationResult.diasCosecha}</h4>
                                    <input type="range" min="0" max={simulationResult.diasCosecha} value={currentDay} onChange={(e) => setCurrentDay(Number(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
                                    <div className="flex justify-center items-center space-x-4 mt-2">
                                        <button onClick={() => setCurrentDay(0)} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"><Rewind/></button>
                                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 bg-gray-700 rounded-full hover:bg-green-600">
                                            {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                                        </button>
                                        <button onClick={() => setCurrentDay(simulationResult.diasCosecha)} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"><ChevronsRight/></button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- CAPA 3: OPERADOR COGNITIVO (MÓDULO PERFECCIONADO) ---

// -- Sub-módulo 1: Diagnóstico Multimodal --
const MultimodalDiagnosis = () => {
    const [imageDesc, setImageDesc] = useState("Imagen de hoja de tomate con manchas amarillas y bordes necróticos.");
    const [sensorData, setSensorData] = useState({ ph: "5.2", humedad: "88%" });
    const [diagnosis, setDiagnosis] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const setExampleCase = (caseData) => {
        setImageDesc(caseData.image);
        setSensorData(caseData.sensors);
    };

    const exampleCases = [
        { name: "Caso 1: Hojas Amarillas", image: "Imagen de hojas inferiores de tomate notablemente amarillas.", sensors: { ph: "6.5", humedad: "60%" } },
        { name: "Caso 2: Manchas Polvorientas", image: "Imagen de hojas con una capa de polvo blanco, similar al talco.", sensors: { ph: "6.8", humedad: "92%" } },
    ];

    const getDiagnosis = async () => {
        setIsLoading(true);
        setDiagnosis("");
        const prompt = `Actúa como un agrónomo experto y un sistema de IA avanzado (Diagnóstico Multimodal). Analiza el siguiente caso de un cultivo de tomate:\n\n**Evidencia Visual:** "${imageDesc}"\n**Datos de Sensores:**\n- pH del Suelo: ${sensorData.ph}\n- Humedad del Suelo: ${sensorData.humedad}%\n\nBasado en la SÍNTESIS de TODA esta información, proporciona un reporte estructurado:\n1. **Diagnóstico Principal:**\n2. **Diagnósticos Diferenciales (2 alternativas):**\n3. **Nivel de Confianza (ej. Alto, Medio, Bajo):**\n4. **Plan de Acción Sugerido (3 pasos cortos):**`;
        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            if (!response.ok) throw new Error(`API request failed`);
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            setDiagnosis(text);
        } catch (error) { setDiagnosis("Error al contactar la IA. Por favor, intente de nuevo."); }
        finally { setIsLoading(false); }
    };

    return (
        <Card>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center"><Microscope className="mr-2"/>Diagnóstico Multimodal</h3>
            <p className="text-gray-400 mb-4">La joya de nuestra IA. Combina evidencia visual y de sensores para un diagnóstico experto.</p>
            <div className="mb-4">
                <p className="text-sm font-medium text-gray-300 mb-2">Selecciona un caso de ejemplo:</p>
                <div className="flex space-x-2">{exampleCases.map(c => <button key={c.name} onClick={() => setExampleCase(c)} className="text-xs bg-gray-700 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded-md transition">{c.name}</button>)}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-300">1. Descripción de la Evidencia Visual</label><textarea value={imageDesc} onChange={e => setImageDesc(e.target.value)} rows="3" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"></textarea></div>
                <div><label className="text-sm font-medium text-gray-300">2. Datos de Sensores Clave</label><div className="grid grid-cols-2 gap-2 mt-1"><input value={sensorData.ph} onChange={e => setSensorData({...sensorData, ph: e.target.value})} className="p-2 bg-gray-700 border border-gray-600 rounded-md text-white" /><input value={sensorData.humedad} onChange={e => setSensorData({...sensorData, humedad: e.target.value})} className="p-2 bg-gray-700 border border-gray-600 rounded-md text-white" /></div></div>
            </div>
            <button onClick={getDiagnosis} disabled={isLoading} className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">{isLoading ? <BrainCircuit className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}{isLoading ? 'IA Razonando...' : 'Obtener Diagnóstico Experto'}</button>
            {diagnosis && <Card className="mt-4 bg-gray-900/50 animate-fade-in"><h4 className="font-bold text-purple-400">Reporte de Diagnóstico IA:</h4><pre className="whitespace-pre-wrap font-sans text-gray-300 mt-2">{diagnosis}</pre></Card>}
        </Card>
    );
};

// -- Sub-módulo 2: Chat Agronómico --
const AgroBotChat = () => {
    const [messages, setMessages] = useState([{ sender: 'bot', text: '¡Hola! Soy AgroBot, tu asistente agronómico. ¿En qué puedo ayudarte hoy?' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;
        const newMessages = [...messages, { sender: 'user', text: input }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        const prompt = `Eres AgroBot, un asistente de IA experto en agronomía para invernaderos de alta tecnología en Perú. Responde a la siguiente pregunta del usuario de forma concisa y amigable:\n\nUsuario: "${input}"`;
        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            if (!response.ok) throw new Error(`API request failed`);
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            setMessages([...newMessages, { sender: 'bot', text }]);
        } catch (error) { setMessages([...newMessages, { sender: 'bot', text: "Lo siento, estoy teniendo problemas de conexión. Inténtalo de nuevo." }]) }
        finally { setIsLoading(false); }
    };
    
    return(
        <Card className="flex flex-col h-[32rem]">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><MessageSquare className="mr-2"/>Chat Agronómico</h3>
            <div className="flex-grow bg-gray-900/50 rounded-lg p-4 space-y-4 overflow-y-auto">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex items-start gap-3 ${msg.sender === 'bot' ? '' : 'flex-row-reverse'}`}>
                        <div className={`p-2 rounded-lg ${msg.sender === 'bot' ? 'bg-green-800/50' : 'bg-blue-800/50'}`}>{msg.sender === 'bot' ? <Bot/> : <Leaf/>}</div>
                        <p className={`p-3 rounded-lg max-w-xs ${msg.sender === 'bot' ? 'bg-gray-700' : 'bg-blue-600'}`}>{msg.text}</p>
                    </div>
                ))}
                 {isLoading && <div className="flex items-start gap-3"><div className="p-2 rounded-lg bg-green-800/50"><Bot className="animate-pulse"/></div><p className="p-3 rounded-lg bg-gray-700 italic">Pensando...</p></div>}
                <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} placeholder="Pregúntale algo a la IA..." className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                <button onClick={sendMessage} className="p-2 bg-green-600 hover:bg-green-700 rounded-md"><Send/></button>
            </div>
        </Card>
    );
};

// -- Sub-módulo 3: Fenotipado y Bitácora --
const AdvancedAnalysis = () => {
    const [log, setLog] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const generateLog = async () => {
        setIsLoading(true);
        setLog("");
        const prompt = `Eres la IA del invernadero GDT-360. Basado en esta lista de eventos simulados del día [Riego automático Z-1, Alerta de Humedad Alta, Corrección manual de nutrientes, Detección visual de posible estrés hídrico en planta C-4], redacta una entrada de bitácora concisa, profesional y en formato Markdown para el agricultor.`;
        try {
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
            if (!response.ok) throw new Error(`API request failed`);
            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            setLog(text);
        } catch (error) { setLog("Error al generar la bitácora.") }
        finally { setIsLoading(false); }
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><Scan className="mr-2"/>Fenotipado Digital</h3>
                <p className="text-gray-400 mb-4">La IA extrae métricas avanzadas de las imágenes para entender la biología de la planta a un nuevo nivel.</p>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Índice de Área Foliar:</span><span className="font-mono text-green-400">3.2</span></div>
                    <div className="flex justify-between"><span>Contenido de Clorofila (SPAD):</span><span className="font-mono text-green-400">92.5%</span></div>
                    <div className="flex justify-between"><span>Estrés Hídrico (Turgencia):</span><span className="font-mono text-green-400">Bajo</span></div>
                </div>
            </Card>
            <Card>
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><Book className="mr-2"/>Bitácora Automática</h3>
                 <p className="text-gray-400 mb-4">Ahorra tiempo. Deja que la IA analice los eventos del día y escriba la bitácora por ti.</p>
                 <button onClick={generateLog} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center">{isLoading ? <BrainCircuit className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>}{isLoading ? 'Generando...' : 'Generar Bitácora del Día'}</button>
                 {log && <Card className="mt-4 bg-gray-900/50 animate-fade-in"><pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm">{log}</pre></Card>}
            </Card>
        </div>
    );
}

const CognitiveModule = () => {
    const [activeTab, setActiveTab] = useState('diagnosis');
    const tabs = { diagnosis: 'Diagnóstico Multimodal', chat: 'Chat Agronómico', analysis: 'Análisis Avanzado' };
    return (
        <div className="p-6 animate-fade-in space-y-6">
            <div className="flex space-x-2 border-b border-gray-700">
                {Object.keys(tabs).map(tabKey => (
                     <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tabKey ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>{tabs[tabKey]}</button>
                ))}
            </div>
            {activeTab === 'diagnosis' && <MultimodalDiagnosis />}
            {activeTab === 'chat' && <AgroBotChat />}
            {activeTab === 'analysis' && <AdvancedAnalysis />}
        </div>
    );
};


// --- CAPA 4: ECOSISTEMA AUTÓNOMO (MÓDULO PERFECCIONADO CON MMVs) ---

const RoboticsControlModule = () => {
    const [missionLog, setMissionLog] = useState([]);
    const [dronePosition, setDronePosition] = useState({ x: 1, y: 5 });
    const [missionActive, setMissionActive] = useState(false);

    const missionPath = [ { x: 1, y: 5 }, { x: 1, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 5 }, { x: 1, y: 5 } ];

    const startMission = () => {
        if (missionActive) return;
        setMissionActive(true);
        setMissionLog([{ time: new Date().toLocaleTimeString(), msg: "Iniciando misión de escaneo fotográfico..." }]);
        
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step < missionPath.length) {
                setDronePosition(missionPath[step]);
                setMissionLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Volando a Sector ${String.fromCharCode(65 + missionPath[step].y)}${missionPath[step].x}...` }]);
            } else {
                setMissionLog(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: "Misión completada. Regresando a la base." }]);
                clearInterval(interval);
                setMissionActive(false);
            }
        }, 1500);
    };

    return (
        <Card className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Tractor className="mr-2"/>Centro de Mando Robótico</h3>
                <p className="text-gray-400 text-sm mb-4">Planifica y monitorea misiones para la flota de agentes autónomos.</p>
                <button onClick={startMission} disabled={missionActive} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-600 flex items-center justify-center">
                    {missionActive ? <Bot className="animate-spin mr-2"/> : <Play className="mr-2"/>}
                    {missionActive ? 'Misión en Progreso...' : 'Lanzar Misión de Escaneo'}
                </button>
                <div className="mt-4 bg-gray-900/50 rounded-lg p-2 h-64 overflow-y-auto">
                    <p className="font-mono text-xs text-green-400">-- REGISTRO DE MISIÓN --</p>
                    {missionLog.map((log, i) => <p key={i} className="font-mono text-xs text-gray-300">[{log.time}] {log.msg}</p>)}
                </div>
            </div>
            <div className="md:col-span-2 h-96 bg-gray-900/50 rounded-lg p-2 grid grid-cols-6 grid-rows-6 gap-1 border-2 border-dashed border-gray-700">
                {Array.from({ length: 36 }).map((_, i) => {
                    const x = (i % 6) + 1;
                    const y = Math.floor(i / 6) + 1;
                    const isDronePos = dronePosition.x === x && dronePosition.y === y;
                    return (
                        <div key={i} className={`flex items-center justify-center rounded-sm ${isDronePos ? 'bg-blue-500/50' : ''}`}>
                            {isDronePos && <Bot className="text-white animate-pulse" />}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

const MLOpsMonitor = () => {
    const [modelData, setModelData] = useState([
        { version: 'v1.0', precision: 92.1 }, { version: 'v1.1', precision: 92.8 },
        { version: 'v1.2', precision: 93.5 }, { version: 'v1.3', precision: 94.2 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setModelData(prevData => {
                const lastVersion = prevData[prevData.length - 1];
                const newVersionNum = parseFloat(lastVersion.version.slice(1)) + 0.1;
                const newVersion = `v${newVersionNum.toFixed(1)}`;
                const newPrecision = Math.min(99.9, lastVersion.precision + (Math.random() * 0.8));
                return [...prevData, { version: newVersion, precision: newPrecision }];
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const lastModel = modelData[modelData.length - 1];
    const improvement = lastModel.precision - modelData[modelData.length - 2]?.precision || 0;

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Cpu className="mr-2"/>Monitor de Aprendizaje IA</h3>
            <p className="text-gray-400 text-sm mb-4">Nuestra IA no es estática, aprende sola. Este monitor visualiza la mejora continua del sistema.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
                <div className="bg-gray-700/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Última Versión</p><p className="font-bold text-xl">{lastModel.version}</p></div>
                <div className="bg-gray-700/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Precisión Actual</p><p className="font-bold text-xl text-green-400">{lastModel.precision.toFixed(1)}%</p></div>
                <div className="bg-gray-700/50 p-2 rounded-lg"><p className="text-xs text-gray-400">Mejora</p><p className="font-bold text-xl text-green-400">+{improvement.toFixed(2)}%</p></div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={modelData}>
                    <XAxis dataKey="version" stroke="#a0aec0" tick={{ fontSize: 12 }} />
                    <YAxis domain={[90, 100]} stroke="#a0aec0" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568' }} />
                    <Bar dataKey="precision" name="Precisión (%)" fill="#48bb78" />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

// --- CAPA 5: PLATAFORMA GLOBAL (MÓDULO PERFECCIONADO CON MMVs) ---
const GlobalNetworkMap = () => {
    const nodes = [{id:1, x:'20%', y:'30%'}, {id:2, x:'50%', y:'25%'}, {id:3, x:'80%', y:'60%'}, {id:4, x:'45%', y:'75%'}];
    const [activeNode, setActiveNode] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveNode(nodes[Math.floor(Math.random() * nodes.length)].id);
            setTimeout(() => setActiveNode(null), 500);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Globe className="mr-2"/>Red Global de Aprendizaje Federado</h3>
            <p className="text-gray-400 text-sm mb-4">Invernaderos de todo el mundo colaboran para crear una IA más inteligente, sin compartir datos privados.</p>
            <div className="relative h-64 bg-gray-900/50 rounded-lg p-2 border-2 border-dashed border-gray-700">
                <svg width="100%" height="100%" viewBox="0 0 100 50">
                    <path d="M4,25 C10,15 20,15 30,25 S40,35 50,25 S60,15 70,25 S80,35 96,25" stroke="#374151" fill="none" strokeWidth="0.5"/>
                    {/* Simplified world map paths */}
                </svg>
                {nodes.map(node => (
                    <div key={node.id} className="absolute" style={{ left: node.x, top: node.y }}>
                        <div className={`h-3 w-3 rounded-full bg-blue-500 transition-all duration-300 ${activeNode === node.id ? 'scale-150 bg-cyan-300' : ''}`}></div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const UrbanImpactDashboard = () => {
    const [co2, setCo2] = useState(1.2);
    const [credits, setCredits] = useState(250);
    const [energy, setEnergy] = useState(15);

    useEffect(() => {
        const interval = setInterval(() => {
            setCo2(c => c + Math.random() * 0.01);
            setCredits(c => c + Math.random() * 0.2);
            setEnergy(e => e + Math.random() * 0.05);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
         <Card>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center"><Factory className="mr-2"/>Dashboard de Impacto Urbano</h3>
            <p className="text-gray-400 text-sm mb-4">El invernadero como un órgano activo en la ciudad, generando valor ecológico y económico.</p>
            <div className="space-y-4">
                <KpiCard icon={<Trees />} title="CO2 Capturado (Ton.)" value={co2.toFixed(2)} unit="T" color="text-green-400" />
                <KpiCard icon={<Recycle />} title="Créditos de Carbono" value={`S/ ${credits.toFixed(2)}`} unit="" color="text-yellow-400" />
                <KpiCard icon={<Zap />} title="Energía a la Red (kWh)" value={energy.toFixed(2)} unit="kWh" color="text-cyan-400" />
            </div>
        </Card>
    );
};


const FutureModule = () => {
    const [activeTab, setActiveTab] = useState('robotics');
    const tabs = { robotics: 'Ecosistema Autónomo', global: 'Plataforma Global' };
    return (
        <div className="p-6 animate-fade-in space-y-6">
            <div className="flex space-x-2 border-b border-gray-700">
                {Object.keys(tabs).map(tabKey => (
                     <button key={tabKey} onClick={() => setActiveTab(tabKey)} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tabKey ? 'border-b-2 border-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}>{tabs[tabKey]}</button>
                ))}
            </div>
            {activeTab === 'robotics' && (
                <div className="space-y-8 animate-fade-in">
                    <RoboticsControlModule />
                    <MLOpsMonitor />
                </div>
            )}
            {activeTab === 'global' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <GlobalNetworkMap />
                    <UrbanImpactDashboard />
                </div>
            )}
        </div>
    );
};


// --- APLICACIÓN PRINCIPAL (EL ORQUESTADOR) ---
const LoginScreen = ({ onLogin }) => (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center animate-fade-in">
            <div className="flex justify-center items-center mb-6"><Leaf className="h-16 w-16 text-green-500" /><h1 className="text-5xl font-bold text-white ml-4">GDT-360</h1></div>
            <p className="text-gray-400 mb-8">El sistema operativo para la próxima revolución agrícola.</p>
            <button onClick={onLogin} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center mx-auto"><LogIn className="mr-2" /> Ingresar al Ecosistema</button>
        </div>
    </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModule, setActiveModule] = useState('future'); // Iniciar en Capa 4/5

  const modules = {
      'dashboard': { label: 'Invernadero Conectado', component: <DashboardModule />, icon: Building },
      'simulator': { label: 'Oráculo Estratégico', component: <SimulatorModule />, icon: Rocket },
      'cognitive': { label: 'Operador Cognitivo', component: <CognitiveModule />, icon: BrainCircuit },
      'future': { label: 'Visión Futura', component: <FutureModule />, icon: Globe }
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center"><Leaf className="h-8 w-8 text-green-500" /><h1 className="text-xl font-bold ml-3 hidden md:block">Greenhouse Digital Twin 360</h1></div>
            <nav className="flex items-center space-x-1 bg-gray-700/50 p-1 rounded-lg">
              {Object.keys(modules).map(key => { const Icon = modules[key].icon; return (<button key={key} onClick={() => setActiveModule(key)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center ${activeModule === key ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}><Icon className="h-4 w-4 mr-2" /><span className="hidden sm:inline">{modules[key].label}</span></button>)})}
            </nav>
            <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white"><Bell /></button>
                <button className="text-gray-400 hover:text-white"><Settings /></button>
                <button onClick={() => setIsLoggedIn(false)} className="text-gray-400 hover:text-white"><LogOut className="h-5 w-5" /></button>
            </div>
          </div>
        </header>
        <main>{modules[activeModule].component}</main>
      </div>
    </DataProvider>
  );
}
