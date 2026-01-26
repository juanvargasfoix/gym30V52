import React from 'react';
import { FileText, Code2, Sparkles, ArrowDown } from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  return (
    <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-indigo-600 p-8 text-center">
        <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          ¡Hola! Estoy listo.
        </h1>
        <p className="text-indigo-100 text-lg">
          Ingeniero Senior React & Gemini API a tu servicio.
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-50 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Sí, puedes usar tu archivo TXT</h3>
              <p className="text-slate-600 mt-1">
                No necesitas subir el archivo físico necesariamente. Lo más rápido y efectivo es que <strong>copies el contenido del texto</strong> y lo pegues directamente en el chat.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Code2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Generación Inmediata</h3>
              <p className="text-slate-600 mt-1">
                En cuanto envíes tu mensaje con los requerimientos, analizaré el contenido y generaré una aplicación React completa, moderna y estilizada con Tailwind CSS.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-500 mb-4 font-medium">
            Por favor, pega tu prompt abajo 👇
          </p>
          <div className="animate-bounce inline-flex justify-center items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600">
            <ArrowDown className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};