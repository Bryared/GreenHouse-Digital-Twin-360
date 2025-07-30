import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Wind, Lightbulb, Bot, Leaf, Sprout, Building, LogIn, LogOut, Settings, Bell, Sparkles } from 'lucide-react';

// --- CONTEXTO DE DATOS SIMULADOS ---
// Este contexto simula el flujo de datos en tiempo real desde el backend de Joel.
const DataContext = createContext();

const mockDataGenerator = () => ({
  temperatura: (22 + Math.random() * 5).toFixed(1),
  humedadAire: (65 + Math.random() * 10).toFixed(1),
  humedadSuelo: (55 + Math.random() * 15).toFixed(1),
  luz: Math.floor(800 + Math.random() * 400),
  co2: Math.floor(400 + Math.random() * 150),
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
    }, 5000); // Actualiza cada 5 segundos para no saturar la API
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ liveData, history }}>
      {children}
    </DataContext.Provider>
  );
};

const useData = () => useContext(DataContext);

// --- COMPONENTES DE LA UI (shadcn/ui style) ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 ${className}`}>
    {children}
  </div>
);

const KpiCard = ({ icon, title, value, unit, color }) => (
  <Card className="flex flex-col justify-between">
    <div className="flex items-center text-gray-400">
      {icon}
      <span className="ml-2 text-sm font-medium">{title}</span>
    </div>
    <div className="mt-2 text-center">
      <span className={`text-4xl font-bold ${color}`}>{value}</span>
      <span className="text-lg text-gray-300 ml-1">{unit}</span>
    </div>
  </Card>
);

const HistoryChart = () => {
  const { history } = useData();
  return (
    <Card className="h-80">
      <h3 className="text-lg font-semibold text-white mb-4">Historial de Sensores (Últimos 30 min)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
            </linearGradient>
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

const DigitalTwinView = () => {
    const { liveData } = useData();
    const tempColor = liveData.temperatura > 28 ? 'bg-red-500/50' : liveData.temperatura < 20 ? 'bg-blue-500/50' : 'bg-green-500/50';

    return (
        <Card className="h-full flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-4">Gemelo Digital - Vista Isométrica</h3>
            <div className="flex-grow bg-gray-900/50 rounded-lg p-4 grid grid-cols-3 grid-rows-2 gap-4 relative border-2 border-dashed border-green-500/20">
                {/* Simulación de camas de cultivo */}
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`rounded-lg flex items-center justify-center transition-all duration-500 ${tempColor}`}>
                        <Sprout className="text-green-300 h-12 w-12" />
                    </div>
                ))}
                
                {/* Superposición de sensores */}
                <div className="absolute top-5 left-5 flex items-center bg-gray-900/80 p-2 rounded-lg">
                    <Thermometer className="h-5 w-5 text-red-400" />
                    <span className="text-white ml-2 text-sm">{liveData.temperatura}°C</span>
                </div>
                <div className="absolute top-5 right-5 flex items-center bg-gray-900/80 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-blue-400" />
                    <span className="text-white ml-2 text-sm">{liveData.humedadAire}%</span>
                </div>
            </div>
        </Card>
    );
};

const ControlPanel = () => {
  const [controls, setControls] = useState({ ventilacion: false, riego: true, luces: true });

  const toggleControl = (control) => {
    setControls(prev => ({ ...prev, [control]: !prev[control] }));
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Panel de Control</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Wind className="h-5 w-5 text-gray-400" />
            <span className="text-white ml-2">Ventilación</span>
          </div>
          <button onClick={() => toggleControl('ventilacion')} className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${controls.ventilacion ? 'bg-green-500' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${controls.ventilacion ? 'translate-x-7' : ''}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Droplets className="h-5 w-5 text-gray-400" />
            <span className="text-white ml-2">Sistema de Riego</span>
          </div>
          <button onClick={() => toggleControl('riego')} className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${controls.riego ? 'bg-green-500' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${controls.riego ? 'translate-x-7' : ''}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Lightbulb className="h-5 w-5 text-gray-400" />
            <span className="text-white ml-2">Luces de Crecimiento</span>
          </div>
          <button onClick={() => toggleControl('luces')} className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 ${controls.luces ? 'bg-green-500' : 'bg-gray-600'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${controls.luces ? 'translate-x-7' : ''}`}></div>
          </button>
        </div>
      </div>
    </Card>
  );
};

// --- ✨ COMPONENTE CON INTEGRACIÓN DE GEMINI API ---
const AiRecommendations = () => {
    const { liveData } = useData();
    const [recommendation, setRecommendation] = useState("Analizando datos del invernadero...");
    const [isLoading, setIsLoading] = useState(true);
    const prevTempRef = useRef(liveData.temperatura);

    // Función para llamar a la API de Gemini
    const fetchAiRecommendation = async (data) => {
        setIsLoading(true);
        const prompt = `Eres un ingeniero agrónomo experto. Basado en los siguientes datos de un invernadero de tomates en La Molina, Lima, Perú (Temperatura: ${data.temperatura}°C, Humedad del Aire: ${data.humedadAire}%, Humedad del Suelo: ${data.humedadSuelo}%, Luz: ${data.luz} µmol/m², CO2: ${data.co2} ppm), proporciona una recomendación corta y accionable (máximo 2 frases) para optimizar el cultivo.`;
        
        try {
            const apiKey = ""; // La API key se gestiona automáticamente
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            setRecommendation(text);
        } catch (error) {
            console.error("Error fetching Gemini API:", error);
            setRecommendation("No se pudo obtener la recomendación. Verifique la conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Para no llamar a la API cada 5s, solo la llamamos si la temperatura cambia significativamente.
        if (Math.abs(liveData.temperatura - prevTempRef.current) > 1.5) {
            fetchAiRecommendation(liveData);
            prevTempRef.current = liveData.temperatura;
        } else if (isLoading) {
             // Carga inicial
            fetchAiRecommendation(liveData);
        }
    }, [liveData]);


    return (
        <Card className="bg-green-900/30 border-green-500/50">
            <div className="flex items-start">
                <Bot className={`h-8 w-8 text-green-400 mr-4 ${isLoading ? 'animate-pulse' : ''}`} />
                <div>
                    <h3 className="text-lg font-semibold text-green-300">Recomendación de la IA ✨</h3>
                    {isLoading ? (
                        <p className="text-white mt-1 italic">Generando nueva recomendación...</p>
                    ) : (
                        <p className="text-white mt-1">{recommendation}</p>
                    )}
                </div>
            </div>
        </Card>
    );
};


// --- MÓDULOS PRINCIPALES ---

const DashboardModule = () => {
  const { liveData } = useData();
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <KpiCard icon={<Thermometer className="h-6 w-6" />} title="Temperatura" value={liveData.temperatura} unit="°C" color="text-red-400" />
        <KpiCard icon={<Droplets className="h-6 w-6" />} title="Humedad Aire" value={liveData.humedadAire} unit="%" color="text-blue-400" />
        <KpiCard icon={<Leaf className="h-6 w-6" />} title="Humedad Suelo" value={liveData.humedadSuelo} unit="%" color="text-yellow-600" />
        <KpiCard icon={<Lightbulb className="h-6 w-6" />} title="Luz (PAR)" value={liveData.luz} unit="µmol/m²" color="text-yellow-400" />
        <KpiCard icon={<Wind className="h-6 w-6" />} title="CO2" value={liveData.co2} unit="ppm" color="text-gray-300" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <HistoryChart />
        </div>
        <div className="space-y-6">
            <ControlPanel />
        </div>
      </div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
           <DigitalTwinView />
        </div>
        <div className="space-y-6">
           <AiRecommendations />
        </div>
      </div>
    </div>
  );
};

// --- ✨ MÓDULO CON INTEGRACIÓN DE GEMINI API ---
const SimulatorModule = () => {
    const [simulationResult, setSimulationResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cultivationPlan, setCultivationPlan] = useState("");
    const [isPlanLoading, setIsPlanLoading] = useState(false);

    const runSimulation = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSimulationResult(null);
        setCultivationPlan(""); // Limpiar plan anterior
        setTimeout(() => {
            setSimulationResult({
                cultivo: e.target.cultivo.value,
                ubicacion: e.target.ubicacion.value,
                diasCosecha: Math.floor(60 + Math.random() * 30),
                costoEnergia: (150 + Math.random() * 50).toFixed(2),
                rendimiento: (5 + Math.random() * 2).toFixed(1),
                rentabilidadNeta: (950 + Math.random() * 200).toFixed(2),
            });
            setIsLoading(false);
        }, 2000);
    };
    
    // Función para generar el plan de cultivo con Gemini
    const generateCultivationPlan = async () => {
        if (!simulationResult) return;
        setIsPlanLoading(true);
        setCultivationPlan("");

        const prompt = `Eres un ingeniero agrónomo y bot de IA. Basado en los resultados de una simulación para un cultivo de ${simulationResult.cultivo} en ${simulationResult.ubicacion}, Perú, que predice una cosecha en ${simulationResult.diasCosecha} días con un rendimiento de ${simulationResult.rendimiento} kg/m², genera un plan de cultivo detallado. El plan debe ser un texto en formato Markdown con los siguientes puntos: 1. **Preparación del Sustrato**, 2. **Plan de Fertilización** (sugerir NPK), 3. **Control de Plagas y Enfermedades** comunes para ese cultivo en esa región, y 4. **Hitos Clave** del cultivo.`;

        try {
            const apiKey = ""; // La API key se gestiona automáticamente
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
             if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

            const result = await response.json();
            const text = result.candidates[0].content.parts[0].text;
            setCultivationPlan(text);
        } catch (error) {
            console.error("Error fetching Gemini API for plan:", error);
            setCultivationPlan("No se pudo generar el plan de cultivo. Intente de nuevo.");
        } finally {
            setIsPlanLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card>
                        <h3 className="text-2xl font-bold text-white mb-4">Simulador Tycoon</h3>
                        <p className="text-gray-400 mb-6">Diseña tu invernadero virtual y predice el resultado de tu cultivo antes de sembrar una sola semilla.</p>
                        <form onSubmit={runSimulation} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-300">Cultivo</label>
                                <select name="cultivo" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                    <option>Tomate</option>
                                    <option>Lechuga</option>
                                    <option>Arándano</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-gray-300">Ubicación (Región)</label>
                                <select name="ubicacion" className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                                    <option>La Molina (Costa)</option>
                                    <option>Huaraz (Sierra)</option>
                                    <option>Iquitos (Selva)</option>
                                </select>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500">
                                {isLoading ? 'Simulando...' : 'Ejecutar Simulación'}
                            </button>
                        </form>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                             <Bot className="h-16 w-16 text-green-500 animate-spin" />
                        </div>
                    )}
                    {simulationResult && (
                        <Card>
                            <h3 className="text-2xl font-bold text-white mb-4">Resultados de la Simulación</h3>
                            <div className="grid grid-cols-2 gap-4 text-white">
                                <div className="bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Cultivo / Ubicación</p>
                                    <p className="text-xl font-semibold">{simulationResult.cultivo} en {simulationResult.ubicacion}</p>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Tiempo a Cosecha</p>
                                    <p className="text-xl font-semibold">{simulationResult.diasCosecha} días</p>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Costo Energético Est.</p>
                                    <p className="text-xl font-semibold">S/ {simulationResult.costoEnergia}</p>
                                </div>
                                <div className="bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-400">Rendimiento Est.</p>
                                    <p className="text-xl font-semibold">{simulationResult.rendimiento} kg/m²</p>
                                </div>
                                <div className="col-span-2 bg-green-800/50 p-4 rounded-lg text-center">
                                    <p className="text-sm text-green-300">Rentabilidad Neta Estimada</p>
                                    <p className="text-3xl font-bold text-green-400">S/ {simulationResult.rentabilidadNeta}</p>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button onClick={generateCultivationPlan} disabled={isPlanLoading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-gray-500">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    {isPlanLoading ? 'Generando Plan...' : 'Generar Plan de Cultivo con IA'}
                                </button>
                            </div>
                            {isPlanLoading && <div className="text-center mt-4">Generando plan detallado...</div>}
                            {cultivationPlan && (
                                <div className="mt-6 p-4 bg-gray-900/50 rounded-lg prose prose-invert prose-p:text-gray-300 prose-headings:text-white">
                                    {/* El texto de Markdown se puede renderizar con una librería como react-markdown */}
                                    <pre className="whitespace-pre-wrap font-sans text-sm">{cultivationPlan}</pre>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- APLICACIÓN PRINCIPAL ---

const LoginScreen = ({ onLogin }) => (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
            <div className="flex justify-center items-center mb-6">
                <Leaf className="h-16 w-16 text-green-500" />
                <h1 className="text-5xl font-bold text-white ml-4">GDT-360</h1>
            </div>
            <p className="text-gray-400 mb-8">La agricultura del futuro, hoy.</p>
            <button onClick={onLogin} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center mx-auto">
                <LogIn className="mr-2" /> Ingresar al Sistema
            </button>
        </div>
    </div>
);

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-500" />
              <h1 className="text-xl font-bold ml-3">Greenhouse Digital Twin 360</h1>
            </div>
            <nav className="flex items-center space-x-2 bg-gray-700/50 p-1 rounded-lg">
              <button onClick={() => setActiveModule('dashboard')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeModule === 'dashboard' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                <Building className="inline-block mr-2 h-4 w-4" />Mi Invernadero
              </button>
              <button onClick={() => setActiveModule('simulator')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeModule === 'simulator' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}>
                <Sprout className="inline-block mr-2 h-4 w-4" />Simulador Tycoon
              </button>
            </nav>
            <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white"><Bell /></button>
                <button className="text-gray-400 hover:text-white"><Settings /></button>
                <button onClick={() => setIsLoggedIn(false)} className="text-gray-400 hover:text-white flex items-center">
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
          </div>
        </header>
        <main>
          {activeModule === 'dashboard' ? <DashboardModule /> : <SimulatorModule />}
        </main>
      </div>
    </DataProvider>
  );
}