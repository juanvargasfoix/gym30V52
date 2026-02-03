import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser } from '../src/lib/supabase-auth';
import { handleAuthError } from '../src/lib/error-handler';

interface LandingProps {
  onLogin: (user: User) => void;
}

export const Landing: React.FC<LandingProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Intentar login con Supabase (email + password)
      const result = await loginUser(username, password);

      if (result.success) {
        onLogin(result.user as unknown as User);
        return;
      }

      // Si falló Supabase, mostrar error de Supabase
      setError(handleAuthError(result.error));
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Error al procesar login.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 relative overflow-hidden font-sans flex items-center justify-center">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-30px) translateX(15px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Background Decor (Subtle & Zen) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />

        {/* Floating Shapes */}
        <div className="absolute top-20 left-[10%] w-12 h-12 bg-yellow-400/20 rounded-xl transform rotate-12 animate-float" />
        <div className="absolute bottom-20 left-[40%] w-8 h-8 bg-purple-400/20 rounded-full animate-float-delayed" />
        <div className="absolute top-1/2 right-[10%] w-16 h-16 bg-pink-400/10 rounded-full blur-xl animate-pulse" />
      </div>

      {/* Main Container: Split Layout */}
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">

          {/* LEFT BLOCK: Branding & Characters */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 animate-fade-in-up">
            <div>
              <div className="inline-block relative">
                <h1 className="text-7xl lg:text-9xl font-black bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tighter drop-shadow-sm mb-2 pr-4">
                  GYM 3.0
                </h1>
                <div className="h-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full w-full opacity-20 blur-lg absolute bottom-4 left-0"></div>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-slate-800 mb-6 tracking-tight">
                Entrena Habilidades Blandas
              </h2>

              <p className="text-lg text-slate-600 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Desarrolla competencias de liderazgo, comunicación y negociación en un entorno gamificado y colaborativo 🚀
              </p>
            </div>

            {/* Bouncing Characters Row */}
            <div className="flex gap-6 lg:gap-8 pt-4">
              <div className="text-6xl lg:text-7xl transform hover:scale-110 transition duration-300 animate-bounce cursor-default" style={{ animationDelay: '0s' }}>🧑‍💼</div>
              <div className="text-6xl lg:text-7xl transform hover:scale-110 transition duration-300 animate-bounce cursor-default" style={{ animationDelay: '0.15s' }}>👩‍💻</div>
              <div className="text-6xl lg:text-7xl transform hover:scale-110 transition duration-300 animate-bounce cursor-default" style={{ animationDelay: '0.3s' }}>🧑‍🎓</div>
              <div className="text-6xl lg:text-7xl transform hover:scale-110 transition duration-300 animate-bounce cursor-default" style={{ animationDelay: '0.45s' }}>👨‍🏫</div>
              <div className="text-6xl lg:text-7xl transform hover:scale-110 transition duration-300 animate-bounce cursor-default" style={{ animationDelay: '0.6s' }}>👩‍⚕️</div>
            </div>
          </div>

          {/* RIGHT BLOCK: Login Form */}
          <div className="flex justify-center lg:justify-end animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white/60 ring-1 ring-slate-100 relative">

              {/* Decorative Top Bar */}
              <div className="absolute top-0 left-10 right-10 h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-b-xl opacity-80"></div>

              <div className="text-center mb-8 mt-4">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Bienvenido/a</h3>
                <p className="text-slate-500 mt-2 font-medium">Ingresa tus credenciales para comenzar</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2 tracking-wider flex items-center gap-1">
                    <UserIcon className="w-3 h-3" /> Usuario
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder-slate-300 group-hover:border-purple-200"
                      placeholder="Ej: juan"
                      autoFocus
                    />
                    <div className="absolute left-4 top-4 text-slate-400 group-hover:text-purple-500 transition-colors">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-2 tracking-wider flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Contraseña
                  </label>
                  <div className="relative group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all font-semibold text-slate-800 placeholder-slate-300 group-hover:border-purple-200"
                      placeholder="••••••••"
                    />
                    <div className="absolute left-4 top-4 text-slate-400 group-hover:text-purple-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-bounce border border-red-100">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-purple-200/50 hover:shadow-xl hover:shadow-purple-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                >
                  {loading ? (
                    <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Ingresar <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-xs text-slate-400 font-medium hover:text-purple-500 transition-colors cursor-pointer">
                  ¿Olvidaste tu contraseña? Contacta a tu Admin.
                </p>
              </div>

              {/* Footer decoration inside card */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent"></div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer message bottom fixed */}
      <div className="absolute bottom-6 w-full text-center opacity-60 pointer-events-none">
        <p className="text-slate-600 font-medium text-xs tracking-wide">
          Powered by Vargas Foix - Agencia
        </p>
      </div>
    </div>
  );
};