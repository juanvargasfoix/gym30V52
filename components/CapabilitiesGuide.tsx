import React from 'react';
import { Cpu, Image as ImageIcon, Mic, BarChart3, CheckCircle2, ArrowDown } from 'lucide-react';

export const CapabilitiesGuide: React.FC = () => {
  const capabilities = [
    {
      icon: <Cpu className="w-6 h-6 text-blue-600" />,
      title: "Lógica y Código (Estándar)",
      model: "Gemini Flash / Pro",
      description: "Es el 'cerebro' por defecto. Se encarga de escribir el código React, la lógica de negocio y los estilos Tailwind. No necesitas activar nada.",
      important: true
    },
    {
      icon: <ImageIcon className="w-6 h-6 text-pink-600" />,
      title: "Generación de Imágenes",
      model: "Nano Banana / Imagen",
      description: "¿Tu app necesita crear logos, arte o editar fotos? Si es así, asegúrate de pedirlo en tu TXT. Yo configuraré el modelo adecuado.",
      important: false
    },
    {
      icon: <Mic className="w-6 h-6 text-amber-600" />,
      title: "Voz y Conversación",
      model: "Live API / Audio",
      description: "Necesario solo si quieres que tu app hable o escuche al usuario. Yo añadiré los permisos de micrófono automáticamente si lo pides.",
      important: false
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-600" />,
      title: "Análisis y Datos",
      model: "Reasoning",
      description: "Para apps que requieren cálculos complejos o dashboards. Mi capacidad de razonamiento ya incluye esto por defecto.",
      important: false
    }
  ];

  return (
    <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-900 p-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          ¿Necesitas activar "Superpoderes"?
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Respuesta corta: <strong>No te preocupes</strong>. Yo detectaré qué necesita tu app basándome en tu prompt.
        </p>
      </div>

      <div className="p-8 bg-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap, index) => (
            <div key={index} className={`relative p-6 rounded-xl border transition-all duration-200 hover:shadow-md ${cap.important ? 'bg-white border-blue-200 shadow-sm' : 'bg-white border-slate-200'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  {cap.icon}
                </div>
                {cap.important && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    SIEMPRE ACTIVO
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{cap.title}</h3>
              <div className="text-xs font-mono text-slate-500 mb-3 bg-slate-100 inline-block px-2 py-1 rounded">
                {cap.model}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {cap.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6 text-center">
          <h3 className="text-indigo-900 font-semibold text-lg mb-2">
            ¡Estoy listo para tu TXT!
          </h3>
          <p className="text-indigo-700 mb-4">
            Simplemente pega el contenido de tu archivo a continuación. <br/>
            Analizaré si tu app requiere imágenes, audio o lógica compleja y escribiré el código perfecto.
          </p>
          <div className="animate-bounce inline-flex justify-center items-center w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};