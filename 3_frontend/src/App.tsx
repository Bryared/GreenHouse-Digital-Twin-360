import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef,
} from "react";
// --- IMPORTS PARA EL VISOR 3D ---
import { Color } from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer';
// --- IMPORTS PARA GRÁFICOS ---
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
// --- CORRECCIÓN: Se añadieron todos los íconos que faltaban ---
import {
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  Bot,
  Leaf,
  Sprout,
  Building,
  LogIn,
  LogOut,
  Settings,
  Bell,
  Sparkles,
  TestTube2,
  Microscope,
  BrainCircuit,
  Globe,
  Tractor,
  Rocket,
  AlertTriangle,
  CheckCircle,
  Power,
  HelpCircle,
  Sun,
  Fan,
  Pipette,
  Camera,
  Box,
  Map,
  Cpu,
  Factory,
  DollarSign,
  Pause,
  Play,
  Bug,
  Rewind,
  ChevronsRight,
  MessageSquare,
  Send,
  Scan,
  Book,
  Trees,
  Recycle,
  Zap,
} from "lucide-react";



// ===================================================================================
// SECCIÓN 1: CONFIGURACIÓN GLOBAL Y DATOS ESTÁTICOS
// Todo lo que define la aplicación pero no cambia: datos de cultivos, usuarios, etc.
// ===================================================================================

// --- BASE DE DATOS SIMULADA ---
const CROP_DATA = {
  tomato: {
    name: "Tomate",
    icon: "🍅",
    varieties: {
      cherry: {
        name: "Cherry",
        params: {
          temperatura: { min: 21, max: 24, optimo: 22.5, critical: 32 },
          humedadAire: { min: 65, max: 85, critical: 90 },
          phSuelo: { min: 6.0, max: 6.8, optimo: 6.4, critical: 5.5 },
        },
      },
      roma: {
        name: "Roma (Italiano)",
        params: {
          temperatura: { min: 20, max: 25, optimo: 23, critical: 33 },
          humedadAire: { min: 60, max: 80, critical: 92 },
          phSuelo: { min: 6.2, max: 6.8, optimo: 6.5, critical: 5.8 },
        },
      },
    },
  },
  potato: {
    name: "Papa",
    icon: "🥔",
    varieties: {
      yungay: {
        name: "Yungay",
        params: {
          temperatura: { min: 15, max: 20, optimo: 17, critical: 25 },
          humedadAire: { min: 70, max: 80, critical: 85 },
          phSuelo: { min: 5.0, max: 6.0, optimo: 5.5, critical: 4.8 },
        },
      },
    },
  },
  lettuce: {
    name: "Lechuga",
    icon: "🥬",
    varieties: {
      iceberg: {
        name: "Iceberg",
        params: {
          temperatura: { min: 16, max: 18, optimo: 17, critical: 24 },
          humedadAire: { min: 60, max: 70, critical: 80 },
          phSuelo: { min: 6.0, max: 6.8, optimo: 6.4, critical: 5.5 },
        },
      },
    },
  },
};
const LOCATIONS = {
  lima: { name: "Lima (La Molina)", icon: "🏙️" },
  arequipa: { name: "Arequipa (Sachaca)", icon: "🌋" },
  huanuco: { name: "Huánuco (Huánuco)", icon: "⛰️" },
};
const USERS_DB = {
  "user1": { password: "123", name: "Ana", customCrops: {} },
  "user2": { password: "456", name: "Carlos", customCrops: {} }
};

// --- TIPOS DE DATOS (OPCIONAL PERO RECOMENDADO) ---
// Es una buena práctica mantener esto, aunque JavaScript funcione sin ello.
interface SensorData {
  name: string;
  temperatura: string;
  humedadAire: string;
  humedadSuelo: string;
  luz: number;
  co2: number;
  phSuelo: string;
  consumoEnergia: string;
  nivelAguaTanque: string;
  timestamp: number;
}


// ===================================================================================
// SECCIÓN 2: LÓGICA DE DATOS Y ESTADO (CONTEXTOS Y PROVIDERS)
// El cerebro de la aplicación: cómo se maneja y distribuye la información.
// ===================================================================================

// --- PROVEEDORES DE CONTEXTO Y HOOKS ---

// 1. Definimos los contextos con un valor inicial de 'null' para TypeScript.
const ConfigContext = createContext(null);
const DataContext = createContext(null);

// 2. Definimos el hook para usar el contexto de configuración.
const useConfig = () => useContext(ConfigContext);

// 3. Definimos el hook para usar el contexto de datos.
const useData = () => useContext(DataContext);


const mockDataGenerator = (params: any) => {
  if (!params) return { temperatura: '22.0', humedadAire: '70.0', humedadSuelo: '60.0', luz: 850, co2: 450, phSuelo: '6.5', consumoEnergia: '150.0', nivelAguaTanque: '85.0', timestamp: Date.now() };
  const { temperatura: tempParams, phSuelo: phParams } = params;
  return {
    temperatura: (tempParams.optimo + (Math.random() - 0.5) * 5).toFixed(1),
    humedadAire: (65 + Math.random() * 10).toFixed(1),
    humedadSuelo: (55 + Math.random() * 15).toFixed(1),
    luz: Math.floor(800 + Math.random() * 400),
    co2: Math.floor(400 + Math.random() * 150),
    phSuelo: (phParams.optimo + (Math.random() - 0.5) * 0.5).toFixed(2),
    consumoEnergia: (150 + Math.random() * 50).toFixed(2),
    nivelAguaTanque: (85 + Math.random() * 15).toFixed(1),
    timestamp: Date.now(),
  };
};

// 4. Creamos el ConfigProvider, añadiendo tipos a las props.
const ConfigProvider = ({ children, initialConfig, customCrops, addCustomCrop }: { children: React.ReactNode, initialConfig: any, customCrops: any, addCustomCrop: any }) => {
  const [location, setLocation] = useState(initialConfig.location);
  const [crop, setCrop] = useState(initialConfig.crop);
  const [variety, setVariety] = useState(initialConfig.variety);

  const availableCrops = { ...CROP_DATA, ...customCrops };

  // Verificación de seguridad para evitar que la app se rompa.
  if (!availableCrops[crop] || !availableCrops[crop].varieties[variety]) {
    const defaultCrop = Object.keys(CROP_DATA)[0];
    const defaultVariety = Object.keys(CROP_DATA[defaultCrop].varieties)[0];
    setCrop(defaultCrop);
    setVariety(defaultVariety);
    return <div>Recargando configuración...</div>;
  }
  
  const value = {
    location: LOCATIONS[location],
    crop: availableCrops[crop],
    variety: availableCrops[crop].varieties[variety],
    params: availableCrops[crop].varieties[variety].params,
    setLocation, setCrop, setVariety, availableCrops, addCustomCrop
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

// 5. Creamos el DataProvider, también con tipos y la lógica unificada.
const DataProvider = ({ children, isSimulationMode }: { children: React.ReactNode, isSimulationMode: boolean }) => {
  const config = useConfig();
  const [liveData, setLiveData] = useState(() => mockDataGenerator(config.params));
  const [history, setHistory] = useState<SensorData[]>([]);

  useEffect(() => {
    if (isSimulationMode) {
        const initialHistory = Array.from({ length: 30 }).map(() => ({
            ...mockDataGenerator(config.params),
            name: new Date(Date.now() - (Math.random() * 30) * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }));
        setHistory(initialHistory);
      
      const interval = setInterval(() => {
        const newData = mockDataGenerator(config.params);
        setLiveData(newData);
        setHistory(prev => [...prev.slice(-29), { ...newData, name: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      console.log("Modo Conectado: Lógica de conexión real no implementada.");
      setLiveData(mockDataGenerator(config.params));
      setHistory([]);
    }
  }, [isSimulationMode, config.params]);

  const value = { liveData, history };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// ===================================================================================
// SECCIÓN 3: COMPONENTES DE UI REUTILIZABLES (PEQUEÑOS)
// Piezas de Lego para construir la interfaz: tarjetas, botones, etc.
// ===================================================================================

// --- COMPONENTE PARA CAMBIAR ENTRE MODO SIMULADO Y CONECTADO ---
const ModeSwitcher = ({ isSimulation, onToggle }: { isSimulation: boolean; onToggle: () => void }) => (
  <div className="flex items-center space-x-2 bg-gray-700 p-1 rounded-lg">
    <span className="text-xs font-bold text-gray-300">
      {isSimulation ? "SIMULADO" : "CONECTADO"}
    </span>
    <button
      onClick={onToggle}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-300 ${
        isSimulation ? "bg-yellow-500" : "bg-green-500"
      }`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${
          isSimulation ? "translate-x-1" : "translate-x-6"
        }`}
      />
    </button>
  </div>
);


// --- COMPONENTES DE UI REUTILIZABLES ---
const Card = ({ children, className = "" }) => (
    <div className={`bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-4 backdrop-blur-sm ${className}`}>
        {children}
    </div>
);

const KpiCard = ({ icon, title, value, unit, color }: { icon: React.ReactNode; title: string; value: string | number; unit: string; color: string }) => (
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
        <button onClick={onToggle} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${isActive ? "bg-green-500" : "bg-gray-600"}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-1"}`} />
        </button>
    </div>
);

// ===================================================================================
// SECCIÓN 4: COMPONENTES DE MÓDULOS (GRANDES)
// Componentes complejos que forman las distintas vistas del dashboard.
// ===================================================================================

// --- CAPA 1: EL INVERNADERO CONECTADO ---
const HistoryChart = () => {
  const { history } = useData();
  return (
    <Card className="h-full">
      <h3 className="text-lg font-semibold text-white mb-4">
        Historial Ambiental
      </h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={history}
          margin={{ top: 5, right: 20, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
          <XAxis dataKey="name" stroke="#a0aec0" tick={{ fontSize: 12 }} />
          <YAxis stroke="#a0aec0" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a202c",
              border: "1px solid #4a5568",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} />
          <Area
            type="monotone"
            dataKey="temperatura"
            stroke="#f87171"
            fillOpacity={1}
            fill="url(#colorTemp)"
            name="Temp (°C)"
          />
          <Area
            type="monotone"
            dataKey="humedadAire"
            stroke="#60a5fa"
            fillOpacity={1}
            fill="url(#colorHum)"
            name="Hum. Aire (%)"
          />
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
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Camera className="mr-2" />
        Monitor Visual
      </h3>
      <div className="flex-grow bg-black rounded-lg relative overflow-hidden">
        <img
          src={`https://placehold.co/600x400/000000/FFFFFF?text=Planta+Tomate\\n(Feed+en+Vivo)&random=${lastUpdated.getTime()}`}
          alt="Live feed from greenhouse"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          EN VIVO
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Última captura: {lastUpdated.toLocaleTimeString()}
      </p>
    </Card>
  );
};

const BimViewer = () => {
  // El ancla para el div sigue siendo la misma.
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    const viewer = new IfcViewerAPI({
      container,
      backgroundColor: new Color(0x1a202c),
    });

    viewer.grid.setGrid(100000, 100000);
    viewer.axes.setAxes();

    async function loadIfcModel() {
      // ✅ 1. MANEJO DE ERRORES
      // Envolvemos todo en un try...catch. Si algo falla, lo veremos en la consola.
      try {
        await viewer.IFC.setWasmPath('/');
        const model = await viewer.IFC.loadIfcUrl('/mini_invernadero_BIM_IFC.ifc');

        // Activamos el post-procesamiento para mejores efectos visuales.
        viewer.context.renderer.postProduction.active = true;
        
        // La generación de sombras es más fiable si creamos un "subconjunto" del modelo.
        await viewer.shadowDropper.renderShadow(model.modelID);

        // ✅ 2. AJUSTE DE CÁMARA (¡EL PASO MÁS IMPORTANTE!)
        // Esta línea centra la cámara y hace zoom para que el modelo se vea perfectamente.
        await viewer.context.fitToFrame();

      } catch (error) {
        console.error("❌ ¡Error al cargar el modelo IFC!", error);
      }
    }

    loadIfcModel();
    
    // ✅ 3. MANEJO DE REDIMENSIONAMIENTO DE VENTANA (BONUS)
    // Esto asegura que el visor 3D se ajuste si el tamaño de la ventana cambia.
    const handleResize = () => {
        viewer.context.updateAspect();
    }
    window.addEventListener("resize", handleResize);

    // Limpieza de memoria (tu código ya lo hacía bien).
    return () => {
      viewer.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, []); 

  return (
    <Card className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Box className="mr-2" />
        Gemelo Digital BIM
      </h3>
      
      {/* El div contenedor no cambia. */}
      <div ref={containerRef} className="flex-grow rounded-lg w-full h-full" />
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        Interactúa con la réplica 1:1 de tu invernadero.
      </p>
    </Card>
  );
};

const ControlPanel = () => {
  const [controls, setControls] = useState({
    ventilacion: false,
    riego: true,
    luces: true,
  });
  const toggleControl = (control) =>
    setControls((prev) => ({ ...prev, [control]: !prev[control] }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">
        Panel de Control
      </h3>
      <div className="space-y-4">
        <ToggleButton
          icon={<Fan className="h-5 w-5 text-gray-400" />}
          label="Ventilación"
          isActive={controls.ventilacion}
          onToggle={() => toggleControl("ventilacion")}
        />
        <ToggleButton
          icon={<Pipette className="h-5 w-5 text-gray-400" />}
          label="Sistema de Riego"
          isActive={controls.riego}
          onToggle={() => toggleControl("riego")}
        />
        <ToggleButton
          icon={<Sun className="h-5 w-5 text-gray-400" />}
          label="Luces de Crecimiento"
          isActive={controls.luces}
          onToggle={() => toggleControl("luces")}
        />
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
      const apiKey = "AIzaSyAp3C7EUc5HmsmBXxBQC_IhohUNyLOpfWU"; // Recuerda poner tu clave de API de Google aquí
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) throw new Error(`API request failed`);
      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      const probableCauseMatch = text.match(/Causa Probable: (.*?)\./);
      const actionMatch = text.match(/Acción Sugerida: (.*)/);
      setAnalysis({
        probableCause: probableCauseMatch
          ? probableCauseMatch[1]
          : "Análisis no concluyente.",
        action: actionMatch ? actionMatch[1] : "Revisar sistemas manualmente.",
      });
    } catch (error) {
      console.error("Error fetching Gemini API:", error);
      setAnalysis({
        probableCause: "Error de conexión con la IA.",
        action: "Verificar la conexión a internet y la clave API.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={!showAlert ? "opacity-50" : ""}>
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <HelpCircle className="mr-2" />
        Análisis de Causa Raíz (IA)
      </h3>
      {showAlert ? (
        <div className="bg-yellow-900/30 border border-yellow-500/50 p-3 rounded-lg flex items-center animate-pulse">
          <AlertTriangle className="h-6 w-6 text-yellow-400 mr-3" />
          <p className="font-bold text-yellow-300">
            Alerta Activa: Temperatura Alta
          </p>
        </div>
      ) : (
        <div className="bg-green-900/30 border border-green-500/50 p-3 rounded-lg flex items-center">
          <CheckCircle className="h-6 w-6 text-green-400 mr-3" />
          <p className="font-bold text-green-300">Sistemas en Parámetros</p>
        </div>
      )}
      <button
        onClick={getAnalysis}
        disabled={isLoading || !showAlert}
        className="w-full mt-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <BrainCircuit className="animate-spin mr-2" />
        ) : (
          <Sparkles className="mr-2" />
        )}
        {isLoading ? "IA Investigando..." : "Consultar IA"}
      </button>
      {analysis && (
        <div className="mt-4 space-y-2 animate-fade-in text-sm">
          <p>
            <strong className="text-yellow-400">Causa Probable:</strong>{" "}
            {analysis.probableCause}
          </p>
          <p>
            <strong className="text-yellow-400">Acción Sugerida:</strong>{" "}
            {analysis.action}
          </p>
        </div>
      )}
    </Card>
  );
};

const DashboardModule = () => {
  const { liveData } = useData();
  const [activeTab, setActiveTab] = useState("general");
  const tabs = {
    general: "Vista General",
    ambiental: "Análisis Ambiental",
    cultivo: "Salud del Cultivo",
    mapa: "Mapa Táctico",
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex space-x-2 border-b border-gray-700">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tabKey
                ? "border-b-2 border-green-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tabs[tabKey]}
          </button>
        ))}
      </div>
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
            <KpiCard
              icon={<Thermometer className="h-6 w-6" />}
              title="Temperatura"
              value={liveData.temperatura}
              unit="°C"
              color="text-red-400"
            />
            <KpiCard
              icon={<Droplets className="h-6 w-6" />}
              title="Humedad Aire"
              value={liveData.humedadAire}
              unit="%"
              color="text-blue-400"
            />
            <KpiCard
              icon={<Power className="h-6 w-6" />}
              title="Consumo"
              value={liveData.consumoEnergia}
              unit="W"
              color="text-green-400"
            />
            <KpiCard
              icon={<Leaf className="h-6 w-6" />}
              title="Humedad Suelo"
              value={liveData.humedadSuelo}
              unit="%"
              color="text-yellow-600"
            />
            <KpiCard
              icon={<TestTube2 className="h-6 w-6" />}
              title="pH Suelo"
              value={liveData.phSuelo}
              unit=""
              color="text-purple-400"
            />
            <KpiCard
              icon={<Pipette className="h-6 w-6" />}
              title="Tanque Agua"
              value={liveData.nivelAguaTanque}
              unit="%"
              color="text-cyan-400"
            />
          </div>
          <div className="space-y-6">
            <ControlPanel />
            <AiRootCauseAnalysis />
          </div>
        </div>
      )}
      {activeTab === "ambiental" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          <HistoryChart />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KpiCard
              icon={<Sun className="h-8 w-8" />}
              title="Luz (PAR)"
              value={liveData.luz}
              unit="µmol/m²"
              color="text-yellow-400"
            />
            <KpiCard
              icon={<Wind className="h-8 w-8" />}
              title="CO2"
              value={liveData.co2}
              unit="ppm"
              color="text-gray-300"
            />
          </div>
        </div>
      )}
      {activeTab === "cultivo" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in h-[500px]">
          <CameraFeed />
          <BimViewer /> 
        </div>
      )}

      {/* ▼▼▼ AÑADE ESTE BLOQUE NUEVO ▼▼▼ */}
      {activeTab === "mapa" && (
        <div className="animate-fade-in h-[600px] p-4"> {/* Un contenedor para darle espacio */}
          <GreenhouseMap2D />
        </div>
      )}

    </div>
  );
};

// --- CAPA 2: ORÁCULO ESTRATÉGICO (MÓDULO PERFECCIONADO) ---

// --- CORRECCIÓN: Se renombra el primer PlantVisualizer para evitar conflictos ---
const PlantVisualizerSimple = ({ day, totalDays }) => {
  const growthPercentage = day / totalDays;
  let stage = "Semilla";
  let PlantIcon = Sprout;
  let color = "text-yellow-400";
  let size = 24 + growthPercentage * 40;

  if (growthPercentage > 0.2) {
    stage = "Crecimiento Vegetativo";
    PlantIcon = Leaf;
    color = "text-green-400";
  }
  if (growthPercentage > 0.6) {
    stage = "Floración";
    PlantIcon = Sparkles;
    color = "text-pink-400";
  }
  if (growthPercentage > 0.8) {
    stage = "Fructificación";
    PlantIcon = Bot;
    color = "text-red-400";
  }
  if (growthPercentage >= 1) {
    stage = "Cosecha";
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 rounded-lg p-4">
      <PlantIcon
        size={size}
        className={`transition-all duration-500 ${color}`}
      />
      <p className="mt-4 text-lg font-semibold">{stage}</p>
      <p className="text-sm text-gray-400">
        Día {day} de {totalDays}
      </p>
    </div>
  );
};

// --- CORRECCIÓN: Se renombra el primer SimulatorModule para evitar conflictos ---
const SimulatorModuleSimple = () => {
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [marketPrice, setMarketPrice] = useState(null);
  const [simHistory, setSimHistory] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const prices = { Tomate: 3.5, Lechuga: 2.8, Arándano: 12.5 };
    setMarketPrice(prices);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentDay((prevDay) => {
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

      if (estrategia === "max_ganancia") {
        rendimiento *= 1.15;
        costo *= 1.2;
      } else if (estrategia === "ecologico") {
        rendimiento *= 0.9;
        costo *= 0.75;
      }

      const rentabilidadNeta = rendimiento * diasCosecha * precio - costo;

      const newSimResult = {
        cultivo,
        ubicacion,
        escenario,
        estrategia,
        diasCosecha,
        costoTotal: costo.toFixed(2),
        rendimientoFinal: rendimiento.toFixed(1),
        rentabilidadNeta: rentabilidadNeta.toFixed(2),
      };
      setSimulationResult(newSimResult);

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
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Rocket className="mr-2" />
              Oráculo Estratégico
            </h3>
            <p className="text-gray-400 mb-6">
              Define tus objetivos y descubre la estrategia óptima.
            </p>
            <form onSubmit={runSimulation} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Cultivo
                </label>
                <select
                  name="cultivo"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="Tomate">Tomate</option>
                  <option value="Lechuga">Lechuga</option>
                  <option value="Arándano">Arándano</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Ubicación
                </label>
                <select
                  name="ubicacion"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option>Arequipa</option>
                  <option>La Molina</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Escenario
                </label>
                <input
                  name="escenario"
                  defaultValue="Ola de calor extremo"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">
                  Estrategia
                </label>
                <select
                  name="estrategia"
                  className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="balanceado">Balanceado</option>
                  <option value="max_ganancia">Maximizar Ganancia</option>
                  <option value="ecologico">Modo Ecológico</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 flex items-center justify-center"
              >
                {isLoading ? (
                  <Bot className="animate-spin mr-2" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                {isLoading ? "Calculando..." : "Ejecutar Simulación"}
              </button>
            </form>
          </Card>
          {marketPrice && (
            <Card className="mt-4">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center">
                <DollarSign className="mr-2" />
                Mercado Hoy
              </h4>
              <div className="text-sm space-y-1">
                {Object.entries(marketPrice).map(([key, value]) => (
                  <p key={key}>
                    {key}:{" "}
                    <span className="font-bold text-green-400">
                      S/ {value.toFixed(2)}/kg
                    </span>
                  </p>
                ))}
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Bot className="h-16 w-16 text-green-500 animate-spin" />
              <p className="ml-4 text-xl">IA creando realidad virtual...</p>
            </div>
          )}
          {simulationResult && (
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Reporte de Simulación
                </h3>
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Tiempo a Cosecha</p>
                    <p className="text-2xl font-semibold">
                      {simulationResult.diasCosecha} días
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-400">Rendimiento Est.</p>
                    <p className="text-2xl font-semibold">
                      {simulationResult.rendimientoFinal} kg/m²
                    </p>
                  </div>
                  <div className="col-span-2 bg-green-800/50 p-4 rounded-lg text-center">
                    <p className="text-sm text-green-300">
                      Rentabilidad Neta Estimada
                    </p>
                    <p className="text-4xl font-bold text-green-400">
                      S/ {simulationResult.rentabilidadNeta}
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <Bot className="mr-2" />
                  Oráculo Temporal
                </h3>
                <div className="grid grid-cols-2 gap-4 h-64">
                  <PlantVisualizerSimple
                    day={currentDay}
                    totalDays={simulationResult.diasCosecha}
                  />
                  <div className="flex flex-col">
                    <p className="text-sm text-gray-400 mb-2">
                      Evolución del Crecimiento
                    </p>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simHistory}>
                        <XAxis
                          dataKey="day"
                          stroke="#a0aec0"
                          tick={{ fontSize: 10 }}
                          label={{
                            value: "Días",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis stroke="#a0aec0" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1a202c",
                            border: "1px solid #4a5568",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="growth"
                          stroke="#84e1bc"
                          strokeWidth={2}
                          dot={false}
                          name="% Crecimiento"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min="0"
                    max={simulationResult.diasCosecha}
                    value={currentDay}
                    onChange={(e) => setCurrentDay(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-center items-center space-x-4 mt-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-2 bg-gray-700 rounded-full hover:bg-green-600"
                    >
                      {isPlaying ? <Pause /> : <Play />}
                    </button>
                    <p className="text-lg font-bold">
                      {currentDay} / {simulationResult.diasCosecha} días
                    </p>
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

// --- CORRECCIÓN: Se renombra el segundo PlantVisualizer para evitar conflictos ---
const PlantVisualizerTycoon = ({ growth, hasPest, isSelected }) => {
  let PlantIcon = Sprout;
  let color = "text-yellow-500";
  let sizeClass = "w-6 h-6";

  if (growth > 0.15) {
    PlantIcon = Leaf;
    color = "text-green-500";
    sizeClass = "w-8 h-8";
  }
  if (growth > 0.6) {
    PlantIcon = Sparkles;
    color = "text-pink-400";
    sizeClass = "w-10 h-10";
  }
  if (growth > 0.8) {
    PlantIcon = Bot;
    color = "text-red-500";
    sizeClass = "w-12 h-12";
  }

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full rounded-md transition-all duration-300 ${
        isSelected ? "bg-green-500/30" : "bg-black/20"
      }`}
    >
      <PlantIcon
        className={`${sizeClass} ${color} transition-all duration-500`}
      />
      {hasPest && (
        <Bug className="absolute top-1 right-1 h-4 w-4 text-orange-400 animate-pulse" />
      )}
    </div>
  );
};

// --- CORRECCIÓN: Se renombra el segundo SimulatorModule para evitar conflictos ---
const SimulatorModuleTycoon = () => {
  const [simulationResult, setSimulationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [simHistory, setSimHistory] = useState([]);
  const [events, setEvents] = useState([]);
  const [currentDay, setCurrentDay] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentDay((prevDay) => {
          if (prevDay >= (simulationResult?.diasCosecha || 0)) {
            setIsPlaying(false);
            return prevDay;
          }
          return prevDay + 1;
        });
      }, 100);
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
    setEvents([]);
    setCurrentDay(0);
    setIsPlaying(false);

    const diasCosecha = 90;
    const gridPlants = 24;
    let newHistory = Array.from({ length: diasCosecha + 1 }, () => ({
      day: 0,
      plants: [],
    }));
    let newEvents = [];

    for (let i = 0; i < gridPlants; i++) {
      let hasPestEvent = Math.random() < 0.15;
      let pestDay = 0;
      if (hasPestEvent) {
        pestDay = Math.floor(30 + Math.random() * 30);
        newEvents.push({
          day: pestDay,
          plantId: i,
          type: "Plaga Detectada",
          icon: Bug,
        });
      }

      for (let day = 0; day <= diasCosecha; day++) {
        const growthVariation = 1 + (Math.random() - 0.5) * 0.1;
        let growth = (day / diasCosecha) * growthVariation;
        if (hasPestEvent && day > pestDay) {
          growth *= 0.7;
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
      setSimulationResult({
        diasCosecha,
        rentabilidadNeta: (2000 + Math.random() * 500).toFixed(2),
      });
      setSimHistory(newHistory);
      setEvents(newEvents);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Rocket className="mr-2" />
              Oráculo Estratégico
            </h3>
            <p className="text-gray-400 mb-6">
              Define tus objetivos y descubre la estrategia óptima.
            </p>
            <form onSubmit={runSimulation} className="space-y-4">
              {/* Un formulario simple solo para el botón de inicio */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500 flex items-center justify-center"
              >
                {isLoading ? (
                  <Bot className="animate-spin mr-2" />
                ) : (
                  <Sparkles className="mr-2" />
                )}
                {isLoading ? "Calculando..." : "Ejecutar Simulación Tycoon"}
              </button>
            </form>
          </Card>
          {events.length > 0 && (
            <Card className="mt-4">
              <h4 className="text-lg font-bold text-white mb-2">
                Registro de Eventos
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                {events
                  .sort((a, b) => a.day - b.day)
                  .map((event) => (
                    <div
                      key={`${event.day}-${event.plantId}`}
                      className={`flex items-center p-2 rounded-md ${
                        currentDay >= event.day
                          ? "bg-yellow-900/50"
                          : "bg-gray-700/50 opacity-50"
                      }`}
                    >
                      <event.icon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                      <p>
                        Día {event.day}: {event.type} en Planta #
                        {event.plantId + 1}
                      </p>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
        <div className="lg:col-span-2">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <Bot className="h-16 w-16 text-green-500 animate-spin" />
              <p className="ml-4 text-xl">IA creando realidad virtual...</p>
            </div>
          )}
          {simulationResult && (
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Invernadero Virtual 2D "Tycoon"
                </h3>
                <div className="grid grid-cols-6 gap-2 bg-stone-800 p-2 rounded-lg">
                  {simHistory[currentDay]?.plants.map((plant) => (
                    <PlantVisualizerTycoon
                      key={plant.id}
                      growth={plant.growth}
                      hasPest={plant.hasPest}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <h4 className="text-center font-bold text-2xl mb-2">
                    Día {currentDay} / {simulationResult.diasCosecha}
                  </h4>
                  <input
                    type="range"
                    min="0"
                    max={simulationResult.diasCosecha}
                    value={currentDay}
                    onChange={(e) => setCurrentDay(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-center items-center space-x-4 mt-2">
                    <button
                      onClick={() => setCurrentDay(0)}
                      className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
                    >
                      <Rewind />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-3 bg-gray-700 rounded-full hover:bg-green-600"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                      onClick={() =>
                        setCurrentDay(simulationResult.diasCosecha)
                      }
                      className="p-2 bg-gray-700 rounded-full hover:bg-gray-600"
                    >
                      <ChevronsRight />
                    </button>
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
const MultimodalDiagnosis = () => {
  const [imageDesc, setImageDesc] = useState(
    "Imagen de hoja de tomate con manchas amarillas y bordes necróticos."
  );
  const [sensorData, setSensorData] = useState({ ph: "5.2", humedad: "88%" });
  const [diagnosis, setDiagnosis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const setExampleCase = (caseData) => {
    setImageDesc(caseData.image);
    setSensorData(caseData.sensors);
  };

  const exampleCases = [
    {
      name: "Caso 1: Hojas Amarillas",
      image: "Imagen de hojas inferiores de tomate notablemente amarillas.",
      sensors: { ph: "6.5", humedad: "60%" },
    },
    {
      name: "Caso 2: Manchas Polvorientas",
      image: "Imagen de hojas con una capa de polvo blanco, similar al talco.",
      sensors: { ph: "6.8", humedad: "92%" },
    },
  ];

  const getDiagnosis = async () => {
    setIsLoading(true);
    setDiagnosis("");
    const prompt = `Actúa como un agrónomo experto y un sistema de IA avanzado (Diagnóstico Multimodal). Analiza el siguiente caso de un cultivo de tomate:\n\n**Evidencia Visual:** "${imageDesc}"\n**Datos de Sensores:**\n- pH del Suelo: ${sensorData.ph}\n- Humedad del Suelo: ${sensorData.humedad}%\n\nBasado en la SÍNTESIS de TODA esta información, proporciona un reporte estructurado:\n1. **Diagnóstico Principal:**\n2. **Diagnósticos Diferenciales (2 alternativas):**\n3. **Nivel de Confianza (ej. Alto, Medio, Bajo):**\n4. **Plan de Acción Sugerido (3 pasos cortos):**`;
    try {
      const apiKey = "AIzaSyAp3C7EUc5HmsmBXxBQC_IhohUNyLOpfWU"; // Recuerda poner tu clave de API de Google aquí
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) throw new Error(`API request failed`);
      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      setDiagnosis(text);
    } catch (error) {
      setDiagnosis("Error al contactar la IA. Por favor, intente de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
        <Microscope className="mr-2" />
        Diagnóstico Multimodal
      </h3>
      <p className="text-gray-400 mb-4">
        Combina evidencia visual y de sensores para un diagnóstico experto.
      </p>
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-300 mb-2">
          Selecciona un caso de ejemplo:
        </p>
        <div className="flex space-x-2">
          {exampleCases.map((c) => (
            <button
              key={c.name}
              onClick={() => setExampleCase(c)}
              className="text-xs bg-gray-700 hover:bg-purple-600 text-white font-bold py-1 px-2 rounded-md transition"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300">
            1. Descripción Visual
          </label>
          <textarea
            value={imageDesc}
            onChange={(e) => setImageDesc(e.target.value)}
            rows="3"
            className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          ></textarea>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            2. Datos de Sensores
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <input
              value={sensorData.ph}
              onChange={(e) =>
                setSensorData({ ...sensorData, ph: e.target.value })
              }
              className="p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="pH"
            />
            <input
              value={sensorData.humedad}
              onChange={(e) =>
                setSensorData({ ...sensorData, humedad: e.target.value })
              }
              className="p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="Humedad"
            />
          </div>
        </div>
      </div>
      <button
        onClick={getDiagnosis}
        disabled={isLoading}
        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
      >
        {isLoading ? (
          <BrainCircuit className="animate-spin mr-2" />
        ) : (
          <Sparkles className="mr-2" />
        )}
        {isLoading ? "IA Razonando..." : "Obtener Diagnóstico"}
      </button>
      {diagnosis && (
        <Card className="mt-4 bg-gray-900/50 animate-fade-in">
          <h4 className="font-bold text-purple-400">
            Reporte de Diagnóstico IA:
          </h4>
          <pre className="whitespace-pre-wrap font-sans text-gray-300 mt-2">
            {diagnosis}
          </pre>
        </Card>
      )}
    </Card>
  );
};

const AgroBotChat = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "¡Hola! Soy AgroBot. ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const prompt = `Eres AgroBot, un asistente de IA experto en agronomía para invernaderos de alta tecnología en Perú. Responde a la siguiente pregunta del usuario de forma concisa y amigable:\n\nUsuario: "${input}"`;
    try {
      const apiKey = "AIzaSyAp3C7EUc5HmsmBXxBQC_IhohUNyLOpfWU"; // Recuerda poner tu clave de API de Google aquí
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) throw new Error(`API request failed`);
      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      setMessages([...newMessages, { sender: "bot", text }]);
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "Lo siento, tengo problemas de conexión." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[32rem]">
      <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
        <MessageSquare className="mr-2" />
        Chat Agronómico
      </h3>
      <div className="flex-grow bg-gray-900/50 rounded-lg p-4 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 ${
              msg.sender === "bot" ? "" : "flex-row-reverse"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                msg.sender === "bot" ? "bg-green-800/50" : "bg-blue-800/50"
              }`}
            >
              {msg.sender === "bot" ? <Bot /> : <Leaf />}
            </div>
            <p
              className={`p-3 rounded-lg max-w-xs ${
                msg.sender === "bot" ? "bg-gray-700" : "bg-blue-600"
              }`}
            >
              {msg.text}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-green-800/50">
              <Bot className="animate-pulse" />
            </div>
            <p className="p-3 rounded-lg bg-gray-700 italic">Pensando...</p>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Pregúntale algo a la IA..."
          className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-green-600 hover:bg-green-700 rounded-md"
        >
          <Send />
        </button>
      </div>
    </Card>
  );
};

const AdvancedAnalysis = () => {
  const [log, setLog] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateLog = async () => {
    setIsLoading(true);
    setLog("");
    const prompt = `Eres la IA del invernadero GDT-360. Basado en esta lista de eventos simulados del día [Riego automático Z-1, Alerta de Humedad Alta, Corrección manual de nutrientes, Detección visual de posible estrés hídrico en planta C-4], redacta una entrada de bitácora concisa, profesional y en formato Markdown para el agricultor.`;
    try {
      const apiKey = "AIzaSyAp3C7EUc5HmsmBXxBQC_IhohUNyLOpfWU"; // Recuerda poner tu clave de API de Google aquí
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!response.ok) throw new Error(`API request failed`);
      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      setLog(text);
    } catch (error) {
      setLog("Error al generar la bitácora.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Scan className="mr-2" />
          Fenotipado Digital
        </h3>
        <p className="text-gray-400 mb-4">
          La IA extrae métricas de las imágenes para entender la planta.
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Índice de Área Foliar:</span>
            <span className="font-mono text-green-400">3.2</span>
          </div>
          <div className="flex justify-between">
            <span>Contenido de Clorofila (SPAD):</span>
            <span className="font-mono text-green-400">92.5%</span>
          </div>
          <div className="flex justify-between">
            <span>Estrés Hídrico (Turgencia):</span>
            <span className="font-mono text-green-400">Bajo</span>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
          <Book className="mr-2" />
          Bitácora Automática
        </h3>
        <p className="text-gray-400 mb-4">
          La IA analiza los eventos y escribe la bitácora por ti.
        </p>
        <button
          onClick={generateLog}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <BrainCircuit className="animate-spin mr-2" />
          ) : (
            <Sparkles className="mr-2" />
          )}
          {isLoading ? "Generando..." : "Generar Bitácora del Día"}
        </button>
        {log && (
          <Card className="mt-4 bg-gray-900/50 animate-fade-in">
            <pre className="whitespace-pre-wrap font-sans text-gray-300 text-sm">
              {log}
            </pre>
          </Card>
        )}
      </Card>
    </div>
  );
};

const CognitiveModule = () => {
  const [activeTab, setActiveTab] = useState("diagnosis");
  const tabs = {
    diagnosis: "Diagnóstico Multimodal",
    chat: "Chat Agronómico",
    analysis: "Análisis Avanzado",
  };
  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex space-x-2 border-b border-gray-700">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tabKey
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tabs[tabKey]}
          </button>
        ))}
      </div>
      {activeTab === "diagnosis" && <MultimodalDiagnosis />}
      {activeTab === "chat" && <AgroBotChat />}
      {activeTab === "analysis" && <AdvancedAnalysis />}
    </div>
  );
};

// --- CAPA 4: ECOSISTEMA AUTÓNOMO (MÓDULO PERFECCIONADO CON MMVs) ---
const RoboticsControlModule = () => {
  const [missionLog, setMissionLog] = useState([]);
  const [dronePosition, setDronePosition] = useState({ x: 1, y: 5 });
  const [missionActive, setMissionActive] = useState(false);
  const missionPath = [
    { x: 1, y: 5 },
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 3, y: 3 },
    { x: 5, y: 3 },
    { x: 5, y: 5 },
    { x: 1, y: 5 },
  ];

  const startMission = () => {
    if (missionActive) return;
    setMissionActive(true);
    setMissionLog([
      {
        time: new Date().toLocaleTimeString(),
        msg: "Iniciando misión de escaneo...",
      },
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < missionPath.length) {
        setDronePosition(missionPath[step]);
        setMissionLog((prev) => [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            msg: `Volando a Sector ${String.fromCharCode(
              65 + missionPath[step].y - 1
            )}${missionPath[step].x}...`,
          },
        ]);
      } else {
        setMissionLog((prev) => [
          ...prev,
          { time: new Date().toLocaleTimeString(), msg: "Misión completada." },
        ]);
        clearInterval(interval);
        setMissionActive(false);
      }
    }, 1500);
  };

  return (
    <Card className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Tractor className="mr-2" />
          Centro de Mando Robótico
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Planifica y monitorea misiones para la flota autónoma.
        </p>
        <button
          onClick={startMission}
          disabled={missionActive}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-600 flex items-center justify-center"
        >
          {missionActive ? (
            <Bot className="animate-spin mr-2" />
          ) : (
            <Play className="mr-2" />
          )}
          {missionActive ? "Misión en Progreso..." : "Lanzar Misión"}
        </button>
        <div className="mt-4 bg-gray-900/50 rounded-lg p-2 h-64 overflow-y-auto">
          <p className="font-mono text-xs text-green-400">
            -- REGISTRO DE MISIÓN --
          </p>
          {missionLog.map((log, i) => (
            <p key={i} className="font-mono text-xs text-gray-300">
              [{log.time}] {log.msg}
            </p>
          ))}
        </div>
      </div>
      <div className="md:col-span-2 h-96 bg-gray-900/50 rounded-lg p-2 grid grid-cols-6 grid-rows-6 gap-1 border-2 border-dashed border-gray-700">
        {Array.from({ length: 36 }).map((_, i) => {
          const x = (i % 6) + 1;
          const y = Math.floor(i / 6) + 1;
          const isDronePos = dronePosition.x === x && dronePosition.y === y;
          return (
            <div
              key={i}
              className={`flex items-center justify-center rounded-sm ${
                isDronePos ? "bg-blue-500/50" : ""
              }`}
            >
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
    { version: "v1.0", precision: 92.1 },
    { version: "v1.1", precision: 92.8 },
    { version: "v1.2", precision: 93.5 },
    { version: "v1.3", precision: 94.2 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setModelData((prevData) => {
        if (prevData.length >= 10) return prevData;
        const lastVersion = prevData[prevData.length - 1];
        const newVersionNum = parseFloat(lastVersion.version.slice(1)) + 0.1;
        const newVersion = `v${newVersionNum.toFixed(1)}`;
        const newPrecision = Math.min(
          99.9,
          lastVersion.precision + Math.random() * 0.8
        );
        return [
          ...prevData,
          { version: newVersion, precision: newPrecision.toFixed(1) },
        ];
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const lastModel = modelData[modelData.length - 1];
  const improvement =
    lastModel.precision - (modelData[modelData.length - 2]?.precision || 0);

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Cpu className="mr-2" />
        Monitor de Aprendizaje IA
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Nuestra IA aprende y mejora con cada ciclo de datos.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-4">
        <div className="bg-gray-700/50 p-2 rounded-lg">
          <p className="text-xs text-gray-400">Última Versión</p>
          <p className="font-bold text-xl">{lastModel.version}</p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-lg">
          <p className="text-xs text-gray-400">Precisión Actual</p>
          <p className="font-bold text-xl text-green-400">
            {lastModel.precision}%
          </p>
        </div>
        <div className="bg-gray-700/50 p-2 rounded-lg">
          <p className="text-xs text-gray-400">Mejora</p>
          <p className="font-bold text-xl text-green-400">
            +{improvement.toFixed(2)}%
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={modelData}>
          <XAxis dataKey="version" stroke="#a0aec0" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[90, 100]}
            stroke="#a0aec0"
            tick={{ fontSize: 12 }}
            unit="%"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a202c",
              border: "1px solid #4a5568",
            }}
          />
          <Bar dataKey="precision" name="Precisión (%)" fill="#48bb78" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

// --- CAPA 5: PLATAFORMA GLOBAL (MÓDULO PERFECCIONADO CON MMVs) ---
const GlobalNetworkMap = () => {
  const nodes = [
    { id: 1, x: "20%", y: "30%" },
    { id: 2, x: "50%", y: "25%" },
    { id: 3, x: "80%", y: "60%" },
    { id: 4, x: "45%", y: "75%" },
  ];
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeId = nodes[Math.floor(Math.random() * nodes.length)].id;
      setActiveNode(activeId);
      setTimeout(() => setActiveNode(null), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Globe className="mr-2" />
        Red de Aprendizaje Federado
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        Invernaderos colaboran para crear una IA más inteligente, sin compartir
        datos privados.
      </p>
      <div className="relative h-64 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
        {/* Placeholder for a map background */}
        <Map
          className="absolute w-full h-full text-gray-700 opacity-20"
          strokeWidth={1}
        />
        {nodes.map((node) => (
          <div
            key={node.id}
            className="absolute"
            style={{ left: node.x, top: node.y }}
          >
            <div
              className={`h-3 w-3 rounded-full bg-blue-500 transition-all duration-300 ${
                activeNode === node.id
                  ? "scale-150 bg-cyan-300 shadow-lg shadow-cyan-400/50"
                  : ""
              }`}
            ></div>
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
      setCo2((c) => c + Math.random() * 0.01);
      setCredits((c) => c + Math.random() * 0.2);
      setEnergy((e) => e + Math.random() * 0.05);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Factory className="mr-2" />
        Dashboard de Impacto Urbano
      </h3>
      <p className="text-gray-400 text-sm mb-4">
        El invernadero como un órgano activo en la ciudad.
      </p>
      <div className="space-y-4">
        <KpiCard
          icon={<Trees />}
          title="CO2 Capturado"
          value={co2.toFixed(2)}
          unit="Ton"
          color="text-green-400"
        />
        <KpiCard
          icon={<Recycle />}
          title="Créditos de Carbono"
          value={`S/ ${credits.toFixed(2)}`}
          unit=""
          color="text-yellow-400"
        />
        <KpiCard
          icon={<Zap />}
          title="Energía a la Red"
          value={energy.toFixed(2)}
          unit="kWh"
          color="text-cyan-400"
        />
      </div>
    </Card>
  );
};

const FutureModule = () => {
  const [activeTab, setActiveTab] = useState("robotics");
  const tabs = { robotics: "Ecosistema Autónomo", global: "Plataforma Global" };
  return (
    <div className="p-6 animate-fade-in space-y-6">
      <div className="flex space-x-2 border-b border-gray-700">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tabKey
                ? "border-b-2 border-blue-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tabs[tabKey]}
          </button>
        ))}
      </div>
      {activeTab === "robotics" && (
        <div className="space-y-8 animate-fade-in">
          <RoboticsControlModule />
          <MLOpsMonitor />
        </div>
      )}
      {activeTab === "global" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
          <GlobalNetworkMap />
          <UrbanImpactDashboard />
        </div>
      )}
    </div>
  );
};


// Reemplaza tu componente GreenhouseMap2D existente con este
const GreenhouseMap2D = () => {
  const { liveData } = useData();
  const [selectedItem, setSelectedItem] = useState(null);
  const [actuatorStates, setActuatorStates] = useState({ ventilador1: false, ventilador2: true, riego_z1: true, riego_z2: false, riego_z3: true, riego_z4: false, riego_z5: true, luces_z1: true, luces_z2: false, luces_z3: true, luces_z4: false, luces_z5: true });
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const mapItems = [
    // --- ZONA DE CONTROL (IZQUIERDA) ---
    { id: 'nivelAguaTanque', zone: 'control', name: 'Nivel Tanque de Agua', type: 'sensor', icon: <Pipette/>, top: '15%', left: '23%', unit: '%', description: 'Porcentaje de agua restante en el tanque de la caseta de bombeo.' },
    { id: 'consumoEnergia', zone: 'control', name: 'Medidor Eléctrico', type: 'sensor', icon: <Power/>, top: '30%', left: '15%', unit: 'W', description: 'Consumo energético en tiempo real de todo el invernadero.' },
    
    // --- SENSORES DE CULTIVO (Z1-Z5) ---
    { id: 'humedadSuelo', zone: 'z1', name: 'Humedad Suelo Z1', type: 'sensor', icon: <Leaf/>, top: '16%', left: '65%', unit: '%', description: 'Nivel de humedad en la cama de cultivo Z1.' },
    { id: 'humedadSuelo', zone: 'z2', name: 'Humedad Suelo Z2', type: 'sensor', icon: <Leaf/>, top: '33%', left: '75%', unit: '%', description: 'Nivel de humedad en la cama de cultivo Z2.' },
    { id: 'humedadSuelo', zone: 'z3', name: 'Humedad Suelo Z3', type: 'sensor', icon: <Leaf/>, top: '50%', left: '65%', unit: '%', description: 'Nivel de humedad en la cama de cultivo Z3.' },
    { id: 'humedadSuelo', zone: 'z4', name: 'Humedad Suelo Z4', type: 'sensor', icon: <Leaf/>, top: '67%', left: '75%', unit: '%', description: 'Nivel de humedad en la cama de cultivo Z4.' },
    { id: 'humedadSuelo', zone: 'z5', name: 'Humedad Suelo Z5', type: 'sensor', icon: <Leaf/>, top: '84%', left: '65%', unit: '%', description: 'Nivel de humedad en la cama de cultivo Z5.' },

    // --- SENSORES AMBIENTALES (CENTRALES) ---
    { id: 'temperatura', zone: 'ambiente', name: 'Sensor Ambiental', type: 'sensor', icon: <Thermometer/>, top: '50%', left: '42%', unit: '°C', description: 'Mide la temperatura y humedad general del aire.' },
    { id: 'luz', zone: 'ambiente', name: 'Sensor de Luz', type: 'sensor', icon: <Sun/>, top: '15%', left: '42%', unit: 'lux', description: 'Mide la intensidad lumínica general.'},
    
    // --- ACTUADORES (CONTROLABLES) ---
    { id: 'riego_z1', name: 'Riego Z1', type: 'actuator', icon: <Droplets/>, top: '16%', left: '50%', description: 'Controla el riego para la cama de cultivo Z1.' },
    { id: 'riego_z3', name: 'Riego Z3', type: 'actuator', icon: <Droplets/>, top: '50%', left: '50%', description: 'Controla el riego para la cama de cultivo Z3.' },
    { id: 'riego_z5', name: 'Riego Z5', type: 'actuator', icon: <Droplets/>, top: '84%', left: '50%', description: 'Controla el riego para la cama de cultivo Z5.' },
    { id: 'luces_z2', name: 'Luces Z2', type: 'actuator', icon: <Lightbulb/>, top: '33%', left: '85%', description: 'Controla las luces de crecimiento para la cama Z2.'},
    { id: 'luces_z4', name: 'Luces Z4', type: 'actuator', icon: <Lightbulb/>, top: '67%', left: '85%', description: 'Controla las luces de crecimiento para la cama Z4.'},
    { id: 'ventilador1', name: 'Ventilador Principal', type: 'actuator', icon: <Fan/>, top: '50%', left: '95%', description: 'Controla el ventilador principal en la zona de aireación.' },
  ];

  const handleItemClick = (item) => { setSelectedItem(item); setAiAnalysis(""); };
  const handleToggleActuator = (actuatorId) => { setActuatorStates(prev => ({ ...prev, [actuatorId]: !prev[actuatorId] })); };
  const handleAnalyzeWithAI = async (item, value) => {
    setIsLoadingAI(true);
    const apiKey = "AIzaSyAp3C7EUc5HmsmBXxBQC_IhohUNyLOpfWU";
    const prompt = `Actúa como ingeniero agrónomo. Para un cultivo de tomates, un valor de "${item.name}" de ${value} ${item.unit} ¿es bueno o malo? Describe qué significa, cuál es el rango óptimo y dame una recomendación clara y consisa, ser muy breve.`;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        if (!response.ok) throw new Error('API request failed');
        const result = await response.json();
        setAiAnalysis(result.candidates[0].content.parts[0].text);
    } catch (error) { setAiAnalysis("Error al conectar con la IA."); } finally { setIsLoadingAI(false); }
  };

  return (
    <Card className="h-full flex flex-col md:flex-row gap-4">
      {/* Columna del Mapa */}
      <div className="flex-grow h-64 md:h-full relative bg-black rounded-lg">
        <img src="/invernadero2D.png" alt="Mapa táctico del Invernadero" className="w-full h-full object-cover rounded-lg"/>
        {mapItems.map(item => (<button key={`${item.id}-${item.zone}`} onClick={() => handleItemClick(item)} className={`absolute w-10 h-10 rounded-full flex items-center justify-center border-2 backdrop-blur-sm transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 shadow-lg hover:scale-125 ${item.type === 'sensor' ? 'bg-sky-500/50 border-sky-300' : 'bg-green-500/50 border-green-300'} ${selectedItem?.id === item.id && selectedItem?.zone === item.zone ? 'scale-125 ring-4 ring-white' : ''}`} style={{ top: item.top, left: item.left }} title={item.name}>{item.icon}</button>))}
      </div>

      {/* Columna de Detalles */}
      <div className="w-full md:w-80 bg-gray-900/50 p-4 rounded-lg flex-shrink-0 flex flex-col">
        <h3 className="font-bold text-lg mb-4 text-white">Panel de Control e Información</h3>
        {!selectedItem ? (
          <div className="text-center text-gray-500 pt-10 flex-grow flex items-center justify-center"><p>Haz clic en un sensor o equipo para interactuar.</p></div>
        ) : (
          <div className="animate-fade-in space-y-4 flex-grow flex flex-col">
            <div className="flex items-center text-2xl font-bold"><span className={selectedItem.type === 'sensor' ? 'text-sky-300' : 'text-green-300'}>{selectedItem.icon}</span><span className="ml-3 text-white">{selectedItem.name}</span></div>
            <p className="text-sm text-gray-400">{selectedItem.description}</p>
            <hr className="border-gray-700"/>

            {selectedItem.type === 'sensor' && (() => {
                const value = liveData[selectedItem.zone]?.[selectedItem.id.split('_')[0]] || 'N/A';
                return (
                    <div className="space-y-4">
                        <p className="text-5xl font-light text-white">{value}<span className="text-xl ml-2 text-gray-400">{selectedItem.unit}</span></p>
                        <SensorVisualization item={selectedItem} value={value} />
                        <div className="bg-gray-900/70 p-3 rounded-lg space-y-3">
                            <button onClick={() => handleAnalyzeWithAI(selectedItem, value)} disabled={isLoadingAI} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center disabled:bg-gray-600">
                                {isLoadingAI ? <BrainCircuit className="animate-spin mr-2"/> : <Sparkles className="mr-2"/>} {isLoadingAI ? "IA Analizando..." : "Consultar IA"}
                            </button>
                            {aiAnalysis && <p className="text-xs text-gray-300 whitespace-pre-wrap">{aiAnalysis}</p>}
                        </div>
                    </div>
                );
            })()}

            {selectedItem.type === 'actuator' && (
              <div className="bg-gray-900/70 p-3 rounded-lg"><ToggleButton icon={actuatorStates[selectedItem.id] ? <CheckCircle className="text-green-400"/> : <Power className="text-gray-500"/>} label={actuatorStates[selectedItem.id] ? "Activado" : "Desactivado"} isActive={actuatorStates[selectedItem.id]} onToggle={() => handleToggleActuator(selectedItem.id)}/></div>
            )}
            
            <div className="flex-grow"></div>
            <p className="text-xs text-gray-500 text-center">Datos del "Modo Simulado".</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// En App.tsx, añade este nuevo componente de visualización
const SensorVisualization = ({ item, value }) => {
  // --- Opción 1: Gráfico tipo "Tanque" o "Medidor" ---
  if (item.id === 'nivelAguaTanque' || item.id === 'consumoEnergia' || item.id.includes('humedad')) {
    const percentage = parseFloat(value);
    let colorClass = 'bg-green-500';
    if (percentage < 50) colorClass = 'bg-yellow-500';
    if (percentage < 25) colorClass = 'bg-red-500';
    if (item.id === 'nivelAguaTanque') colorClass = 'bg-blue-500';

    return (
      <div className="w-full bg-gray-700 rounded-lg h-8 border border-gray-600 overflow-hidden">
        <div 
          className={`h-full rounded-lg transition-all duration-500 ${colorClass}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    );
  }

  // --- Opción 2: Gráfico Histórico ---
  if (item.type === 'sensor') {
    // Para la demo, generamos un historial rápido y creíble
    const mockHistory = [
      { name: '-30m', val: parseFloat(value) * (1 + (Math.random() - 0.5) * 0.1) },
      { name: '-15m', val: parseFloat(value) * (1 + (Math.random() - 0.5) * 0.1) },
      { name: '-5m', val: parseFloat(value) * (1 + (Math.random() - 0.5) * 0.1) },
      { name: 'Ahora', val: parseFloat(value) },
    ];

    return (
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockHistory} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis stroke="#a0aec0" tick={{ fontSize: 10 }} domain={['dataMin - 1', 'dataMax + 1']}/>
            <Tooltip contentStyle={{ backgroundColor: "#1a202c", border: "1px solid #4a5568" }}/>
            <Area type="monotone" dataKey="val" stroke="#38bdf8" fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Si no es un sensor (es un actuador), no muestra nada.
  return null; 
};

// ===================================================================================
// SECCIÓN 5: COMPONENTES DE FLUJO DE APLICACIÓN
// Pantallas que guían al usuario, como Login y Configuración.
// ===================================================================================

// --- PANTALLAS DE FLUJO DE INICIO ---

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault(); // Previene que la página se recargue al enviar el formulario
    const user = USERS_DB[username];
    if (user && user.password === password) {
      setError("");
      onLogin(user);
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900 p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <form onSubmit={handleLogin}>
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-2">
              <Leaf className="h-12 w-12 text-green-500" />
              <h1 className="text-4xl font-bold text-white ml-3">GDT-360</h1>
            </div>
            <p className="text-gray-400">Inicia sesión para monitorear tu ecosistema</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Usuario (prueba con 'user1')</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-1">Contraseña (prueba con '123')</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-green-500 focus:outline-none" />
            </div>
          </div>
          {error && <p className="mt-4 text-center text-red-400 text-sm">{error}</p>}
          <button type="submit" className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center">
            <LogIn className="inline-block mr-2 h-5 w-5" />
            Ingresar
          </button>
        </form>
      </Card>
    </div>
  );
};

const SetupScreen = ({ user, onConfigComplete, availableCrops, addCustomCrop }) => {
  const [selectedLocation, setSelectedLocation] = useState(Object.keys(LOCATIONS)[0]);
  const [selectedCrop, setSelectedCrop] = useState(Object.keys(availableCrops)[0]);
  const [selectedVariety, setSelectedVariety] = useState(Object.keys(availableCrops[Object.keys(availableCrops)[0]].varieties)[0]);
  const [isSimulation, setIsSimulation] = useState(true); // Nuevo estado para el modo de datos
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (availableCrops[selectedCrop]) {
      const newVarieties = Object.keys(availableCrops[selectedCrop].varieties);
      setSelectedVariety(newVarieties[0]);
    }
  }, [selectedCrop, availableCrops]);

  const handleConfirm = () => {
    onConfigComplete({
      location: selectedLocation,
      crop: selectedCrop,
      variety: selectedVariety,
      isSimulation: isSimulation, // Pasamos el modo seleccionado
    });
  };

  return (
    <>
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900 p-4">
        <Card className="w-full max-w-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-white text-center">¡Bienvenido, {user.name}!</h2>
          <p className="text-gray-400 text-center mb-8">Configura tu invernadero para esta sesión</p>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">1. Selecciona la Ubicación</label>
                    <select onChange={(e) => setSelectedLocation(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white">{Object.entries(LOCATIONS).map(([key, { name, icon }]) => (<option key={key} value={key}>{icon} {name}</option>))}</select>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">2. Elige el Tipo de Datos</label>
                    <div className="bg-gray-700 rounded-md p-2 flex items-center justify-around h-full">
                        <button onClick={() => setIsSimulation(true)} className={`px-4 py-1 rounded-md text-sm transition ${isSimulation ? 'bg-yellow-500 text-black font-bold' : 'text-gray-300'}`}>Datos Simulados</button>
                        <button onClick={() => setIsSimulation(false)} className={`px-4 py-1 rounded-md text-sm transition ${!isSimulation ? 'bg-green-500 text-white font-bold' : 'text-gray-300'}`}>Datos Conectados</button>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">3. Configura tu Cultivo</label>
                <div className="grid grid-cols-2 gap-4">
                    <select onChange={(e) => setSelectedCrop(e.target.value)} value={selectedCrop} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white">{Object.entries(availableCrops).map(([key, { name, icon }]) => (<option key={key} value={key}>{icon} {name}</option>))}</select>
                    {availableCrops[selectedCrop] && <select onChange={(e) => setSelectedVariety(e.target.value)} value={selectedVariety} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white">{Object.keys(availableCrops[selectedCrop].varieties).map((varietyKey) => (<option key={varietyKey} value={varietyKey}>{availableCrops[selectedCrop].varieties[varietyKey].name}</option>))}</select>}
                </div>
                 <button onClick={() => setIsModalOpen(true)} className="text-sm text-green-400 hover:text-green-300 mt-2 w-full text-left">+ Añadir nuevo tipo de cultivo</button>
            </div>
          </div>
          
          <button onClick={handleConfirm} className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center">
            <Rocket className="inline mr-2" /> Iniciar Monitoreo
          </button>
        </Card>
      </div>

      <CustomCropModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={(newCrop) => {
            const newId = newCrop.name.toLowerCase().replace(/\s/g, '');
            addCustomCrop(newId, newCrop);
            setSelectedCrop(newId); // Selecciona automáticamente el nuevo cultivo
        }}
      />
    </>
  );
};

// Componente Modal para crear cultivos personalizados (MEJOR UX)
const CustomCropModal = ({ isOpen, onClose, onSave }) => {
    const [form, setForm] = useState({ name: '', icon: '🌱', tempMin: 20, tempMax: 25, tempCrit: 30, phMin: 6.0, phMax: 6.8, phCrit: 5.5 });
    
    if (!isOpen) return null;

    const handleSave = () => {
        if (!form.name.trim()) {
            alert("El nombre del cultivo es obligatorio.");
            return;
        }
        onSave(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <Card className="w-full max-w-lg">
                <h3 className="text-2xl font-bold text-green-400 mb-4">Añadir Cultivo Personalizado</h3>
                <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-sm">Nombre del Cultivo</label><input type="text" placeholder="Ej: Fresa" onChange={e => setForm({...form, name: e.target.value})} className="w-full p-2 mt-1 bg-gray-700 rounded-md text-white"/></div>
                        <div><label className="text-sm">Ícono</label><input type="text" placeholder="Ej: 🍓" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full p-2 mt-1 bg-gray-700 rounded-md text-white"/></div>
                     </div>
                     <div>
                        <p className="text-sm text-gray-400">Parámetros de Temperatura (°C)</p>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <input type="number" placeholder="Mín" value={form.tempMin} onChange={e => setForm({...form, tempMin: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-gray-700 rounded-md text-white"/>
                            <input type="number" placeholder="Máx" value={form.tempMax} onChange={e => setForm({...form, tempMax: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-gray-700 rounded-md text-white"/>
                            <input type="number" placeholder="Crítico" value={form.tempCrit} onChange={e => setForm({...form, tempCrit: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-gray-700 rounded-md text-white"/>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Parámetros de pH del Suelo</p>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                            <input type="number" step="0.1" placeholder="Mín" value={form.phMin} onChange={e => setForm({...form, phMin: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-gray-700 rounded-md text-white"/>
                            <input type="number" step="0.1" placeholder="Máx" value={form.phMax} onChange={e => setForm({...form, phMax: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-gray-800 rounded-md text-white"/>
                            <input type="number" step="0.1" placeholder="Crítico" value={form.phCrit} onChange={e => setForm({...form, phCrit: parseFloat(e.target.value) || 0})} className="w-full p-2 bg-gray-700 rounded-md text-white"/>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg transition">Cancelar</button>
                    <button onClick={handleSave} className="py-2 px-6 bg-green-600 hover:bg-green-700 rounded-lg transition">Guardar</button>
                </div>
            </Card>
        </div>
    );
};

// --- VISTA PRINCIPAL DE LA APLICACIÓN (DESPUÉS DEL LOGIN Y SETUP) ---
const MainAppView = ({ user, config, setConfig, setUser }) => {
  // Estado para el módulo activo y el modo de simulación
  const [activeModule, setActiveModule] = useState("dashboard");
  const [isSimulationMode, setIsSimulationMode] = useState(true);

  // Definición de los módulos (como ya lo tenías)
  const modules = {
    dashboard: {
      label: "Invernadero",
      component: <DashboardModule />,
      icon: Building,
    },
    simulator: {
      label: "Oráculo",
      component: <SimulatorModuleTycoon />,
      icon: Rocket,
    },
    cognitive: {
      label: "Cognitivo",
      component: <CognitiveModule />,
      icon: BrainCircuit,
    },
    future: {
      label: "Visión Futura",
      component: <FutureModule />,
      icon: Globe,
    },
  };

  return (
    <DataProvider isSimulationMode={isSimulationMode}>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-6 py-3 flex justify-between items-center">
            
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-green-500" />
              <h1 className="text-xl font-bold ml-3 hidden md:block">GDT-360</h1>
            </div>
            
            <nav className="flex items-center space-x-1 bg-gray-700/50 p-1 rounded-lg">
              {Object.keys(modules).map((key) => {
                const Icon = modules[key].icon;
                return (
                  <button key={key} onClick={() => setActiveModule(key)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center ${activeModule === key ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-600"}`}>
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{modules[key].label}</span>
                  </button>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-4">
              <ModeSwitcher 
                isSimulation={isSimulationMode} 
                onToggle={() => setIsSimulationMode(!isSimulationMode)} 
              />
              <button onClick={() => setConfig(null)} className="text-sm bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">Cambiar Cultivo</button>
              <button onClick={() => { setUser(null); setConfig(null); }} className="text-gray-400 hover:text-white">
                <LogOut className="h-5 w-5" />
              </button>
            </div>

          </div>
        </header>
        
        <main>{modules[activeModule].component}</main>
        
      </div>
    </DataProvider>
  );
};

// --- APLICACIÓN PRINCIPAL (EL ORQUESTADOR) ---
export default function App() {
  // Estado centralizado para manejar el flujo de la aplicación
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState(null);
  const [customCrops, setCustomCrops] = useState({});

  // Función para añadir un cultivo personalizado a la sesión actual
  const addCustomCrop = (id, data) => {
    const newCrop = {
      [id]: {
        name: data.name,
        icon: data.icon,
        varieties: {
          default: {
            name: "Personalizada",
            params: {
              temperatura: { min: data.tempMin, max: data.tempMax, optimo: (data.tempMin + data.tempMax) / 2, critical: data.tempCrit },
              phSuelo: { min: data.phMin, max: data.phMax, optimo: (data.phMin + data.phMax) / 2, critical: data.phCrit },
            }
          }
        }
      }
    };
    setCustomCrops(prev => ({ ...prev, ...newCrop }));
    alert(`¡Cultivo "${data.name}" guardado para esta sesión!`);
  };

  // --- Lógica de Renderizado Condicional ---

  // 1. Si NO hay usuario, muestra la pantalla de Login.
  if (!user) {
    return <LoginScreen onLogin={(loggedInUser) => setUser(loggedInUser)} />;
  }

  // 2. Si HAY usuario pero NO ha configurado la sesión, muestra la pantalla de Setup.
  if (user && !config) {
    return <SetupScreen 
              user={user} 
              onConfigComplete={(selection) => setConfig(selection)} 
              availableCrops={{...CROP_DATA, ...customCrops}} 
              addCustomCrop={addCustomCrop} 
           />;
  }

  // 3. Si todo está listo, muestra la aplicación principal, envuelta en sus Providers.
  return (
    <ConfigProvider initialConfig={config} customCrops={customCrops} addCustomCrop={addCustomCrop}>
      <MainAppView 
        user={user}
        config={config}
        setConfig={setConfig}
        setUser={setUser}
      />
    </ConfigProvider>
  );
}