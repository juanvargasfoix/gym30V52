import React, { useState, useEffect } from 'react';
import { User, Company, Skill, AreaType, GymConfig, FlexArea, FlexSkill, Role } from '../types';
import { Users, Building2, Brain, LogOut, Plus, Trash2, Edit2, Settings, Briefcase, Layers, Save, X, CheckSquare, Square, FolderPlus, Library, UserPlus, Lock as LockIcon, Mail, User as UserIconSVG, Briefcase as BriefcaseIcon, Star, PenTool } from 'lucide-react';
import { registerUser } from '../src/lib/supabase-auth';
import {
    getAllProfiles,
    updateProfile,
    getCompanies,
    createCompany,
    updateCompany,
    getSkills,
    createCustomSkill,
    getGymConfig,
    updateGymConfig,
    updateCompanyFlexConfig
} from '../src/lib/supabase-helpers';

interface AdminPanelProps {
    currentUser: User;
    onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onLogout }) => {
    const [section, setSection] = useState<'empresas' | 'usuarios' | 'habilidades' | 'areas_empresa' | 'configuracion' | 'area_flex'>('empresas');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);

    // Data for New Features
    const [gymConfig, setGymConfig] = useState<GymConfig>({
        areas: {
            comunicacion: { enabled: true, description: 'Domina el arte de la comunicación' },
            liderazgo: { enabled: true, description: 'Lidera con empatía y visión' },
            autoliderazgo: { enabled: true, description: 'Gestiona tus propias emociones' },
            negociacion: { enabled: true, description: 'Crea acuerdos de valor' }
        },
        points: { xpPerSkill: 50, xpNextLevel: 500 },
        badges: { enabled: true, list: ['Pionero', 'Comunicador', 'Estratega'] }
    });

    // Saving state for visual feedback
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // FLEX LIBRARY STATE (New)
    const [flexLibrary, setFlexLibrary] = useState<FlexArea[]>([]);

    // FORM STATE for current template (New)
    const [currentTemplate, setCurrentTemplate] = useState<FlexArea>({
        id: '',
        name: '',
        description: '',
        color: 'purple',
        emoji: '🚀',
        skills: []
    });
    const [isEditing, setIsEditing] = useState(false);

    // State for Modals
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
    const [tempActiveAreas, setTempActiveAreas] = useState<AreaType[]>([]);
    const [tempFlexAreaId, setTempFlexAreaId] = useState(''); // Changed from tempCustomAreaName to ID

    // States for new entries (Original)
    const [newCompany, setNewCompany] = useState({ name: '', activeAreas: [] as AreaType[] });

    // --- USER MODAL STATE ---
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUserUsername, setEditingUserUsername] = useState<string | null>(null); // Track if editing
    const [newUserForm, setNewUserForm] = useState({
        fullName: '',
        username: '', // Will serve as email
        password: '',
        role: 'participante' as Role,
        company: ''
    });
    const [userFormError, setUserFormError] = useState('');

    // --- SKILL MODAL STATE ---
    const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
    const [editingSkillId, setEditingSkillId] = useState<string | null>(null); // Track if editing skill
    const [newSkillForm, setNewSkillForm] = useState({
        name: '',
        area: 'liderazgo',
        description: '',
        level: 'Básico'
    });
    const [skillFormError, setSkillFormError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('🔧 INICIALIZANDO PANEL DE CONTROL ADMIN SUPABASE');

                // 1. Fetch Companies
                const dbCompanies = await getCompanies();
                const mappedCompanies: Company[] = dbCompanies.map((c: any) => ({
                    id: c.id,
                    name: c.nombre,
                    activeAreas: c.areas_activas || [],
                    createdAt: c.created_at
                }));
                setCompanies(mappedCompanies);

                // 2. Fetch Users (Profiles)
                const dbProfiles = await getAllProfiles();
                const mappedUsers: User[] = dbProfiles.map((p: any) => ({
                    id: p.id,
                    username: p.email,
                    fullName: p.username,
                    role: p.role,
                    company: p.empresa_id,
                    xp: p.xp,
                    rank: p.nivel,
                    onboardingCompleted: p.onboarding_completed
                }));
                setUsers(mappedUsers);

                // 3. Fetch Skills from Supabase
                const dbSkills = await getSkills();
                const mappedSkills: Skill[] = dbSkills.map((s: any) => ({
                    id: s.id,
                    area: s.area,
                    name: s.nombre,
                    description: s.descripcion || '',
                    order: s.nivel || 0,
                    isCustom: s.is_custom || false,
                    contentKey: s.content_key || ''
                }));
                setSkills(mappedSkills);

                // Load Gym Config from Supabase
                const savedConfig = await getGymConfig();
                if (savedConfig) setGymConfig(savedConfig);

                // Load Flex Library - ahora se almacena por empresa en flex_area_config
                // Mantenemos flexLibrary como array local construido desde las companies
                const flexFromCompanies = dbCompanies
                    .filter((c: any) => c.flex_area_config)
                    .map((c: any) => c.flex_area_config);
                setFlexLibrary(flexFromCompanies);

                console.log('✅ PANEL ADMIN CARGADO DESDE SUPABASE');

            } catch (error) {
                console.error('❌ Error cargando datos en Admin:', error);
            }
        };

        loadData();
    }, []);

    // --- SAVE HANDLERS ---

    const saveGymConfig = async () => {
        console.log('💾 GUARDANDO CONFIGURACIÓN GYM 3.0 EN SUPABASE');
        console.log('📊 Datos guardados:', gymConfig);

        await updateGymConfig(gymConfig);

        console.log('✅ Configuración guardada en Supabase');

        setIsSavingConfig(true);
        setTimeout(() => setIsSavingConfig(false), 2000);
    };

    const saveFlexTemplate = () => {
        console.log('📚 Guardando plantilla FLEX en estado local');

        if (!currentTemplate.name) {
            alert('El nombre del área es obligatorio');
            return;
        }

        let updatedLibrary: FlexArea[];

        if (isEditing) {
            updatedLibrary = flexLibrary.map(t => t.id === currentTemplate.id ? currentTemplate : t);
        } else {
            const newTemplate = {
                ...currentTemplate,
                id: `flex-${Date.now()}`
            };
            updatedLibrary = [...flexLibrary, newTemplate];
        }

        setFlexLibrary(updatedLibrary);
        // Nota: las flex areas se guardan en Supabase cuando se asignan a una empresa (updateCompanyFlexConfig)

        console.log('✅ Área FLEX creada como plantilla:', currentTemplate.name);
        console.log('📋 Total plantillas FLEX:', updatedLibrary.length);

        setCurrentTemplate({
            id: '',
            name: '',
            description: '',
            color: 'purple',
            emoji: '🚀',
            skills: []
        });
        setIsEditing(false);
    };

    const deleteFlexTemplate = (id: string) => {
        const updatedLibrary = flexLibrary.filter(t => t.id !== id);
        setFlexLibrary(updatedLibrary);
    };

    const editFlexTemplate = (template: FlexArea) => {
        setCurrentTemplate(template);
        setIsEditing(true);
        // Scroll to top of form
        const formElement = document.getElementById('flexFormTop');
        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
    };

    const handleCompanyAreaSave = async () => {
        if (!editingCompanyId) return;

        console.log('📋 PASO 2/3: Integrando dropdown FLEX');

        const result = await updateCompany(editingCompanyId, {
            areas_activas: tempActiveAreas,
            area_flex: tempActiveAreas.includes('custom') ? tempFlexAreaId : null
        });

        if (result) {
            const updatedCompanies = companies.map(c => {
                if (c.id === editingCompanyId) {
                    return {
                        ...c,
                        activeAreas: result.areas_activas || []
                    };
                }
                return c;
            });
            setCompanies(updatedCompanies);
            setEditingCompanyId(null);
            console.log('✅ Empresa actualizada en Supabase');
        } else {
            alert("Error al actualizar la empresa en Supabase");
        }
    };

    // --- ORIGINAL HANDLERS ---
    const saveCompanies = (newC: Company[]) => {
        try {
            setCompanies(newC);
            // localStorage.setItem('companies', JSON.stringify(newC)); // REMOVED
        } catch (e) { console.error(e); }
    };
    const saveUsers = (newU: User[]) => {
        try {
            setUsers(newU);
            // localStorage.setItem('users', JSON.stringify(newU)); // REMOVED
        } catch (e) { console.error(e); }
    };
    const saveSkills = (newS: Skill[]) => {
        try { setSkills(newS); } catch (e) { console.error(e); }
    };

    const handleCreateCompany = async () => {
        if (!newCompany.name || newCompany.name.trim().length < 3) {
            alert("El nombre de la empresa debe tener al menos 3 caracteres.");
            return;
        }

        const result = await createCompany({
            nombre: newCompany.name.trim(),
            areas_activas: newCompany.activeAreas
        });

        if (result) {
            const mapped: Company = {
                id: result.id,
                name: result.nombre,
                activeAreas: result.areas_activas || [],
                createdAt: result.created_at
            };
            setCompanies([...companies, mapped]);
            setNewCompany({ name: '', activeAreas: [] });
            console.log('✅ Empresa creada en Supabase');
        } else {
            alert("Error al crear la empresa en Supabase");
        }
    };

    // --- USER CREATION HANDLER ---
    const handleCreateUser = async () => {
        setUserFormError('');

        // Validations
        if (!newUserForm.fullName.trim()) return setUserFormError('El nombre es obligatorio');
        if (!newUserForm.username.trim()) return setUserFormError('El email/usuario es obligatorio');
        if (!newUserForm.password.trim()) return setUserFormError('La contraseña es obligatoria');
        if (!newUserForm.company) return setUserFormError('Debes seleccionar una empresa');

        const result = await registerUser({
            username: newUserForm.fullName,
            email: newUserForm.username,
            password: newUserForm.password,
            role: newUserForm.role,
            empresa: newUserForm.company
        });

        if (result.success && result.user) {
            const p = result.user;
            const newUser: User = {
                id: p.id,
                username: p.email,
                fullName: p.username,
                role: p.role,
                company: p.empresa_id,
                onboardingCompleted: false,
                xp: 0,
                rank: 'aprendiz',
                leaderProfile: null
            };

            setUsers([...users, newUser]);
            setIsUserModalOpen(false);
            setNewUserForm({
                fullName: '',
                username: '',
                password: '',
                role: 'participante',
                company: ''
            });
            console.log('✅ Usuario registrado en Supabase');
        } else {
            setUserFormError(result.error?.message || 'Error al registrar usuario');
        }
    };

    // --- USER EDIT HANDLERS ---
    const openEditUserModal = (user: User) => {
        setEditingUserUsername(user.username);
        setNewUserForm({
            fullName: user.fullName,
            username: user.username,
            password: '', // Leave empty to indicate "no change"
            role: user.role,
            company: user.company || ''
        });
        setUserFormError('');
        setIsUserModalOpen(true);
    };

    const handleUpdateUser = async () => {
        setUserFormError('');

        // Validations
        if (!newUserForm.fullName.trim()) return setUserFormError('El nombre es obligatorio');
        if (!newUserForm.username.trim()) return setUserFormError('El email/usuario es obligatorio');
        if (!newUserForm.company) return setUserFormError('Debes seleccionar una empresa');

        const targetUser = users.find(u => u.username === editingUserUsername);
        if (!targetUser || !targetUser.id) return setUserFormError('Error: ID de usuario no encontrado');

        const result = await updateProfile(targetUser.id, {
            username: newUserForm.fullName,
            email: newUserForm.username,
            role: newUserForm.role,
            empresa_id: newUserForm.company
        });

        if (result) {
            const updatedUsers = users.map(u => {
                if (u.id === result.id) {
                    return {
                        ...u,
                        username: result.email,
                        fullName: result.username,
                        role: result.role,
                        company: result.empresa_id
                    };
                }
                return u;
            });

            setUsers(updatedUsers);
            setIsUserModalOpen(false);
            setEditingUserUsername(null);
            setNewUserForm({
                fullName: '',
                username: '',
                password: '',
                role: 'participante',
                company: ''
            });
            console.log('✅ Perfil actualizado en Supabase');
        } else {
            setUserFormError('Error al actualizar perfil en Supabase');
        }
    };

    // --- SKILL CREATION/EDIT HANDLER ---
    const handleSaveSkill = () => {
        setSkillFormError('');

        if (!newSkillForm.name.trim()) return setSkillFormError('El nombre es obligatorio');
        if (!newSkillForm.description.trim()) return setSkillFormError('La descripción es obligatoria');

        // Map Level to Order (Básico=1, Intermedio=2, Avanzado=3)
        let order = 1;
        if (newSkillForm.level === 'Intermedio') order = 2;
        if (newSkillForm.level === 'Avanzado') order = 3;

        if (editingSkillId) {
            // UPDATE EXISTING
            const updatedSkills = skills.map(s => {
                if (s.id === editingSkillId) {
                    return {
                        ...s,
                        name: newSkillForm.name,
                        area: newSkillForm.area as AreaType,
                        description: newSkillForm.description,
                        order: order
                    };
                }
                return s;
            });
            saveSkills(updatedSkills);
        } else {
            // CREATE NEW
            const newSkill: Skill = {
                id: `custom_${Date.now()}`,
                name: newSkillForm.name,
                area: newSkillForm.area as AreaType, // Type casting since Productividad is technically string
                description: newSkillForm.description,
                order: order,
                isCustom: true
            };
            saveSkills([...skills, newSkill]);
        }

        // Close & Reset
        setIsSkillModalOpen(false);
        setEditingSkillId(null);
        setNewSkillForm({
            name: '',
            area: 'liderazgo',
            description: '',
            level: 'Básico'
        });
    };

    const openEditSkillModal = (skill: Skill) => {
        if (!skill.isCustom) return; // Security check

        setEditingSkillId(skill.id);

        let level = 'Básico';
        if (skill.order === 2) level = 'Intermedio';
        if (skill.order >= 3) level = 'Avanzado';

        setNewSkillForm({
            name: skill.name,
            area: skill.area as string,
            description: skill.description,
            level: level
        });
        setSkillFormError('');
        setIsSkillModalOpen(true);
    };

    const toggleArea = (area: AreaType) => {
        if (newCompany.activeAreas.includes(area)) {
            setNewCompany({ ...newCompany, activeAreas: newCompany.activeAreas.filter(a => a !== area) });
        } else {
            setNewCompany({ ...newCompany, activeAreas: [...newCompany.activeAreas, area] });
        }
    };

    const getAreaColor = (area: AreaType) => {
        switch (area) {
            case 'comunicacion': return 'cyan';
            case 'liderazgo': return 'orange';
            case 'autoliderazgo': return 'pink';
            case 'negociacion': return 'purple';
            case 'Productividad': return 'blue';
            default: return 'gray';
        }
    };

    const getAreaEmoji = (area: AreaType) => {
        switch (area) {
            case 'comunicacion': return '🗣️';
            case 'liderazgo': return '🦁';
            case 'autoliderazgo': return '🧠';
            case 'negociacion': return '🤝';
            case 'Productividad': return '⚡';
            default: return '✨';
        }
    };

    return (
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* SIDEBAR */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => onLogout()}
                            className="flex items-center justify-center w-8 h-8 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                        >
                            ←
                        </button>
                        <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">GYM 3.0</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">PANEL ADMIN</p>
                </div>
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 mt-2 px-2">Gestión Base</div>
                    <button onClick={() => setSection('empresas')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === 'empresas' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Building2 className="w-5 h-5" /> Empresas
                    </button>
                    <button onClick={() => setSection('usuarios')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === 'usuarios' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Users className="w-5 h-5" /> Usuarios
                    </button>
                    <button onClick={() => setSection('habilidades')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === 'habilidades' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Brain className="w-5 h-5" /> Habilidades
                    </button>

                    <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 mt-6 px-2">Configuración</div>

                    <button onClick={() => setSection('areas_empresa')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === 'areas_empresa' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Briefcase className="w-5 h-5" /> Áreas x Empresa
                    </button>

                    <button onClick={() => setSection('configuracion')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === 'configuracion' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Settings className="w-5 h-5" /> Config GYM 3.0
                    </button>

                    <button onClick={() => setSection('area_flex')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${section === 'area_flex' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
                        <Layers className="w-5 h-5" /> Área FLEX
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={onLogout} className="w-full flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2">
                        <LogOut className="w-5 h-5" /> Cerrar Sesión
                    </button>
                </div>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-6xl mx-auto">

                    {/* SECCIÓN 1: ÁREAS POR EMPRESA */}
                    {section === 'areas_empresa' && (
                        <div className="space-y-6 animate-fade-in">
                            <h1 className="text-3xl font-bold text-slate-900">Personalización de Áreas por Empresa</h1>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-600">Empresa</th>
                                            <th className="p-4 font-semibold text-slate-600">Áreas Activas</th>
                                            <th className="p-4 font-semibold text-slate-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map(c => (
                                            <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {c.activeAreas.map(a => (
                                                            <span key={a} className={`px-2 py-1 text-xs rounded-full font-bold uppercase bg-${getAreaColor(a)}-100 text-${getAreaColor(a)}-700`}>{a}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCompanyId(c.id);
                                                            setTempActiveAreas(c.activeAreas);

                                                            // Load specific company flex config from Supabase data
                                                            // flex_area_config ya viene cargado desde companies
                                                            const companyData = companies.find(co => co.id === c.id);
                                                            setTempFlexAreaId((companyData as any)?.flexAreaId || '');
                                                        }}
                                                        className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium transition-colors"
                                                    >
                                                        Personalizar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MODAL PERSONALIZACIÓN */}
                            {editingCompanyId && (
                                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in">
                                        <h3 className="text-xl font-bold text-slate-900 mb-4">Configurar Áreas</h3>
                                        <p className="text-sm text-slate-500 mb-6">Selecciona las áreas visibles para {companies.find(c => c.id === editingCompanyId)?.name}</p>

                                        <div className="space-y-3 mb-6">
                                            {['comunicacion', 'liderazgo', 'autoliderazgo', 'negociacion'].map(area => (
                                                <div
                                                    key={area}
                                                    onClick={() => {
                                                        if (tempActiveAreas.includes(area as AreaType)) {
                                                            setTempActiveAreas(tempActiveAreas.filter(a => a !== area));
                                                        } else {
                                                            setTempActiveAreas([...tempActiveAreas, area as AreaType]);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${tempActiveAreas.includes(area as AreaType) ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    {tempActiveAreas.includes(area as AreaType) ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                                                    <span className="capitalize font-medium text-slate-700">{area}</span>
                                                </div>
                                            ))}

                                            {/* CUSTOM / FLEX OPTION (MODIFIED PASO 2) */}
                                            <div
                                                onClick={() => {
                                                    if (flexLibrary.length === 0) return; // Prevent if no templates

                                                    if (tempActiveAreas.includes('custom')) {
                                                        setTempActiveAreas(tempActiveAreas.filter(a => a !== 'custom'));
                                                        setTempFlexAreaId('');
                                                    } else {
                                                        setTempActiveAreas([...tempActiveAreas, 'custom']);
                                                        // Auto-select first if available
                                                        if (flexLibrary.length > 0 && !tempFlexAreaId) {
                                                            setTempFlexAreaId(flexLibrary[0].id);
                                                        }
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${flexLibrary.length === 0 ? 'bg-slate-100 cursor-not-allowed opacity-60' :
                                                    tempActiveAreas.includes('custom') ? 'bg-purple-50 border-purple-500' : 'bg-white border-slate-200 hover:border-purple-300'
                                                    }`}
                                            >
                                                {tempActiveAreas.includes('custom') ? <CheckSquare className="w-5 h-5 text-purple-600" /> : <Square className="w-5 h-5 text-slate-400" />}
                                                <div className="flex-1">
                                                    <span className="font-medium text-slate-700">Área Custom / Flex</span>
                                                    {flexLibrary.length === 0 && (
                                                        <p className="text-xs text-red-500 font-medium mt-1">No hay áreas FLEX creadas. Créalas primero.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {tempActiveAreas.includes('custom') && flexLibrary.length > 0 && (
                                                <div className="pl-8 animate-fade-in">
                                                    <label className="text-xs font-bold text-slate-500 block mb-1">Selecciona Área FLEX</label>
                                                    <select
                                                        value={tempFlexAreaId}
                                                        onChange={(e) => setTempFlexAreaId(e.target.value)}
                                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 ring-purple-500 outline-none"
                                                    >
                                                        {flexLibrary.map(area => (
                                                            <option key={area.id} value={area.id}>
                                                                {area.emoji} {area.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-3">
                                            <button onClick={() => setEditingCompanyId(null)} className="flex-1 py-2 bg-slate-100 text-slate-600 font-bold rounded-lg hover:bg-slate-200">Cancelar</button>
                                            <button onClick={handleCompanyAreaSave} className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Guardar Cambios</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECCIÓN 2: CONFIGURACIÓN GENERAL */}
                    {section === 'configuracion' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-bold text-slate-900">Configuración GYM 3.0</h1>
                                <button
                                    onClick={saveGymConfig}
                                    disabled={isSavingConfig}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${isSavingConfig
                                        ? 'bg-green-600 text-white cursor-default shadow-green-300'
                                        : 'bg-green-500 text-white hover:bg-green-600 shadow-green-200'
                                        }`}
                                >
                                    {isSavingConfig ? (
                                        <>✅ Guardado</>
                                    ) : (
                                        <><Save className="w-5 h-5" /> Guardar Configuración</>
                                    )}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* A) ÁREAS GENERALES */}
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">A) Áreas Generales</h3>
                                    <div className="space-y-4">
                                        {Object.entries(gymConfig.areas).map(([key, val]) => {
                                            const config = val as { enabled: boolean; description: string };
                                            return (
                                                <div key={key} className="bg-slate-50 p-4 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold capitalize text-slate-700">{key}</span>
                                                        <button
                                                            onClick={() => setGymConfig({ ...gymConfig, areas: { ...gymConfig.areas, [key]: { ...config, enabled: !config.enabled } } })}
                                                            className={`w-12 h-6 rounded-full transition-colors relative ${config.enabled ? 'bg-green-500' : 'bg-slate-300'}`}
                                                        >
                                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${config.enabled ? 'left-7' : 'left-1'}`}></div>
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        value={config.description}
                                                        onChange={(e) => setGymConfig({ ...gymConfig, areas: { ...gymConfig.areas, [key]: { ...config, description: e.target.value } } })}
                                                        className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:ring-2 ring-indigo-500 outline-none"
                                                        rows={2}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* C) SISTEMA DE PUNTOS */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <h3 className="text-xl font-bold text-slate-800 mb-4 border-b pb-2">C) Sistema de Puntos (XP)</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">XP por Habilidad</label>
                                                <input
                                                    type="number"
                                                    value={gymConfig.points.xpPerSkill}
                                                    onChange={(e) => setGymConfig({ ...gymConfig, points: { ...gymConfig.points, xpPerSkill: parseInt(e.target.value) } })}
                                                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-slate-500">XP Siguiente Nivel</label>
                                                <input
                                                    type="number"
                                                    value={gymConfig.points.xpNextLevel}
                                                    onChange={(e) => setGymConfig({ ...gymConfig, points: { ...gymConfig.points, xpNextLevel: parseInt(e.target.value) } })}
                                                    className="w-full mt-1 p-2 border border-slate-300 rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* D) BADGES */}
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                                            <h3 className="text-xl font-bold text-slate-800">D) Badges</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500">Activar</span>
                                                <button
                                                    onClick={() => setGymConfig({ ...gymConfig, badges: { ...gymConfig.badges, enabled: !gymConfig.badges.enabled } })}
                                                    className={`w-10 h-5 rounded-full transition-colors relative ${gymConfig.badges.enabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
                                                >
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${gymConfig.badges.enabled ? 'left-6' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {gymConfig.badges.list.map((badge, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                                    <span className="text-sm font-medium">{badge}</span>
                                                    <button
                                                        onClick={() => setGymConfig({ ...gymConfig, badges: { ...gymConfig.badges, list: gymConfig.badges.list.filter((_, i) => i !== idx) } })}
                                                        className="text-red-400 hover:text-red-600"
                                                    ><X className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                            <div className="flex gap-2 mt-2">
                                                <input type="text" placeholder="Nuevo badge..." id="newBadgeInput" className="flex-1 p-2 text-sm border border-slate-300 rounded-lg" />
                                                <button
                                                    onClick={() => {
                                                        const input = document.getElementById('newBadgeInput') as HTMLInputElement;
                                                        if (input.value) {
                                                            setGymConfig({ ...gymConfig, badges: { ...gymConfig.badges, list: [...gymConfig.badges.list, input.value] } });
                                                            input.value = '';
                                                        }
                                                    }}
                                                    className="bg-indigo-50 text-indigo-600 p-2 rounded-lg"
                                                ><Plus className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECCIÓN 3: ÁREA FLEX (MODIFICADA: BIBLIOTECA DE PLANTILLAS) */}
                    {section === 'area_flex' && (
                        <div className="space-y-8 animate-fade-in" id="flexFormTop">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">🎯 Biblioteca de Áreas FLEX - Plantillas Reutilizables</h1>
                                    <p className="text-slate-500 mt-1">Crea áreas que podrás asignar a múltiples empresas</p>
                                </div>
                                <button onClick={saveFlexTemplate} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all">
                                    <Save className="w-5 h-5" /> {isEditing ? 'Actualizar Plantilla' : 'Guardar Nueva Plantilla'}
                                </button>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-purple-100">
                                <div className="flex items-center gap-3 mb-6 border-b border-purple-50 pb-4">
                                    <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                        <Layers className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Editando Plantilla' : 'Nueva Plantilla'}</h2>
                                        <p className="text-sm text-slate-500">Define la estructura del área</p>
                                    </div>
                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setCurrentTemplate({
                                                    id: '',
                                                    name: '',
                                                    description: '',
                                                    color: 'purple',
                                                    emoji: '🚀',
                                                    skills: []
                                                });
                                            }}
                                            className="ml-auto text-sm text-red-500 hover:text-red-700 underline"
                                        >
                                            Cancelar Edición
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Área</label>
                                        <input
                                            type="text"
                                            value={currentTemplate.name}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 ring-purple-500 outline-none"
                                            placeholder="Ej: Ventas, Innovación..."
                                        />
                                    </div>
                                    {/* Eliminado Select de Empresa Asignada */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Color Base</label>
                                        <select
                                            value={currentTemplate.color}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, color: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 ring-purple-500 outline-none bg-white"
                                        >
                                            <option value="purple">Morado</option>
                                            <option value="blue">Azul</option>
                                            <option value="pink">Rosa</option>
                                            <option value="yellow">Amarillo</option>
                                            <option value="green">Verde</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                                        <textarea
                                            value={currentTemplate.description}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 ring-purple-500 outline-none"
                                            rows={2}
                                            placeholder="Describe el propósito de esta área..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Emoji</label>
                                        <input
                                            type="text"
                                            value={currentTemplate.emoji}
                                            onChange={(e) => setCurrentTemplate({ ...currentTemplate, emoji: e.target.value })}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 ring-purple-500 outline-none text-center text-2xl"
                                            placeholder="🚀"
                                        />
                                    </div>
                                </div>

                                {/* SKILLS LIST */}
                                <div className="border-t pt-6">
                                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-600" /> Habilidades del Área
                                    </h3>

                                    <div className="bg-slate-50 rounded-xl overflow-hidden mb-4">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-slate-100 text-slate-500">
                                                <tr>
                                                    <th className="p-3">Nombre Habilidad</th>
                                                    <th className="p-3">Nivel/Orden</th>
                                                    <th className="p-3">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentTemplate.skills.length === 0 && (
                                                    <tr><td colSpan={3} className="p-4 text-center text-slate-400">No hay habilidades creadas aún.</td></tr>
                                                )}
                                                {currentTemplate.skills.map((skill, idx) => (
                                                    <tr key={idx} className="border-b border-slate-200 last:border-0">
                                                        <td className="p-3 font-medium">{skill.name}</td>
                                                        <td className="p-3">{skill.level}</td>
                                                        <td className="p-3">
                                                            <button
                                                                onClick={() => setCurrentTemplate({ ...currentTemplate, skills: currentTemplate.skills.filter((_, i) => i !== idx) })}
                                                                className="text-red-500 hover:text-red-700"
                                                            ><Trash2 className="w-4 h-4" /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="flex gap-2">
                                        <input id="newFlexSkillName" type="text" placeholder="Nombre de la habilidad" className="flex-[2] p-2 border border-slate-300 rounded-lg text-sm" />
                                        <input id="newFlexSkillLevel" type="text" placeholder="Nivel (1-6)" className="flex-1 p-2 border border-slate-300 rounded-lg text-sm" />
                                        <button
                                            onClick={() => {
                                                const nameInput = document.getElementById('newFlexSkillName') as HTMLInputElement;
                                                const levelInput = document.getElementById('newFlexSkillLevel') as HTMLInputElement;
                                                if (nameInput.value && levelInput.value) {
                                                    const newSkill: FlexSkill = {
                                                        id: `f${Date.now()}`,
                                                        name: nameInput.value,
                                                        level: levelInput.value
                                                    };
                                                    setCurrentTemplate({ ...currentTemplate, skills: [...currentTemplate.skills, newSkill] });
                                                    nameInput.value = '';
                                                    levelInput.value = '';
                                                }
                                            }}
                                            className="bg-purple-600 text-white px-4 rounded-lg font-bold hover:bg-purple-700"
                                        >+ Agregar Habilidad</button>
                                    </div>
                                </div>
                            </div>

                            {/* TEMPLATE LIST TABLE */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8">
                                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center gap-2">
                                    <Library className="w-5 h-5 text-slate-500" />
                                    <h3 className="font-bold text-slate-700">Plantillas Creadas</h3>
                                    <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full font-bold">{flexLibrary.length}</span>
                                </div>
                                <table className="w-full text-left">
                                    <thead className="bg-slate-100 border-b border-slate-200 text-slate-500 text-sm">
                                        <tr>
                                            <th className="p-4 font-semibold">Área</th>
                                            <th className="p-4 font-semibold">Habilidades</th>
                                            <th className="p-4 font-semibold">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {flexLibrary.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="p-8 text-center text-slate-400 italic">
                                                    No hay plantillas guardadas en la biblioteca.
                                                </td>
                                            </tr>
                                        ) : (
                                            flexLibrary.map(template => (
                                                <tr key={template.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl">
                                                                {template.emoji}
                                                            </div>
                                                            <div>
                                                                <div className={`font-bold text-lg capitalize text-${template.color}-600`}>{template.name}</div>
                                                                <div className="text-xs text-slate-400 truncate max-w-[200px]">{template.description}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                                                            <Brain className="w-3 h-3" /> {template.skills.length}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => editFlexTemplate(template)}
                                                                className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium text-sm flex items-center gap-1 transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" /> Editar
                                                            </button>
                                                            <button
                                                                onClick={() => deleteFlexTemplate(template.id)}
                                                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center gap-1 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" /> Eliminar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Existing Sections (empresas, usuarios, habilidades) preserved below... */}
                    {section === 'empresas' && (
                        <div className="space-y-6 animate-fade-in">
                            <h1 className="text-3xl font-bold text-slate-900">Gestión de Empresas</h1>

                            {/* Create Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-500" /> Nueva Empresa</h3>
                                <div className="flex gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre de la empresa"
                                        className="flex-1 p-3 border rounded-xl bg-slate-50 focus:ring-2 ring-indigo-500 outline-none"
                                        value={newCompany.name}
                                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {[
                                        { id: 'comunicacion', color: 'cyan', label: 'Comunicación' },
                                        { id: 'liderazgo', color: 'orange', label: 'Liderazgo' },
                                        { id: 'autoliderazgo', color: 'pink', label: 'Autoliderazgo' },
                                        { id: 'negociacion', color: 'purple', label: 'Negociación' }
                                    ].map((area) => (
                                        <div key={area.id}
                                            onClick={() => toggleArea(area.id as AreaType)}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${newCompany.activeAreas.includes(area.id as AreaType) ? `bg-${area.color}-50 border-${area.color}-500` : 'bg-slate-50 border-transparent hover:border-slate-200'}`}>
                                            <div className={`font-bold capitalize text-${area.color}-600 mb-1`}>{area.label}</div>
                                            <div className="text-xs text-slate-500">6 Habilidades</div>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleCreateCompany} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700">Crear Empresa</button>
                            </div>

                            {/* List */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-600">Nombre</th>
                                            <th className="p-4 font-semibold text-slate-600">Áreas Activas</th>
                                            <th className="p-4 font-semibold text-slate-600">Usuarios</th>
                                            <th className="p-4 font-semibold text-slate-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companies.map(c => (
                                            <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                                <td className="p-4 font-bold text-slate-800">{c.name}</td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {c.activeAreas.map((a, index) => (
                                                            <div key={`${c.id}-${a}-${index}`} className={`w-3 h-3 rounded-full bg-${getAreaColor(a as AreaType)}-500`} title={a}></div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">{users.filter(u => u.company === c.id).length}</td>
                                                <td className="p-4">
                                                    <button onClick={() => {
                                                        const newC = companies.filter(co => co.id !== c.id);
                                                        saveCompanies(newC);
                                                    }} className="text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {section === 'usuarios' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
                                <button
                                    onClick={() => {
                                        setEditingUserUsername(null); // Ensure create mode
                                        setNewUserForm({ fullName: '', username: '', password: '', role: 'participante', company: '' });
                                        setIsUserModalOpen(true);
                                    }}
                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-medium flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Nuevo Usuario
                                </button>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                                        <tr>
                                            <th className="text-left p-4 font-semibold text-slate-600">Username</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Nombre</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Rol</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Empresa</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Supervisor</th>
                                            <th className="text-left p-4 font-semibold text-slate-600">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.username} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                                <td className="p-4 font-mono text-sm text-slate-500 font-bold">{user.username}</td>
                                                <td className="p-4 font-medium text-slate-800">{user.fullName}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.role === 'admin' ? 'bg-red-100 text-red-700' :
                                                        user.role === 'supervisor' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-600">
                                                    {user.company ? (companies.find(c => c.id === user.company)?.name || '-') : '-'}
                                                </td>
                                                <td className="p-4 text-slate-600">{user.supervisor || '-'}</td>
                                                <td className="p-4 flex gap-2">
                                                    <button
                                                        onClick={() => openEditUserModal(user)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        onClick={() => saveUsers(users.filter(u => u.username !== user.username))}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* CREATE/EDIT USER MODAL */}
                            {isUserModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
                                        <div className="bg-slate-50 p-6 border-b border-slate-200">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                                {editingUserUsername ? (
                                                    <><Edit2 className="w-6 h-6 text-blue-600" /> Editar Usuario</>
                                                ) : (
                                                    <><UserPlus className="w-6 h-6 text-green-600" /> Crear Nuevo Usuario</>
                                                )}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {editingUserUsername ? 'Modifica los datos del usuario.' : 'Completa los datos para dar de alta.'}
                                            </p>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            {userFormError && (
                                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-600 rounded-full" /> {userFormError}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre Completo</label>
                                                <div className="relative">
                                                    <UserIconSVG className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                                        placeholder="Ej: Juan Pérez"
                                                        value={newUserForm.fullName}
                                                        onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email / Usuario</label>
                                                <div className="relative">
                                                    <Mail className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                                        placeholder="juan@empresa.com"
                                                        value={newUserForm.username}
                                                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                                    {editingUserUsername ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                                </label>
                                                <div className="relative">
                                                    <LockIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                                                    <input
                                                        type="password"
                                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                                        placeholder={editingUserUsername ? "Dejar vacío para mantener actual" : "••••••••"}
                                                        value={newUserForm.password}
                                                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol</label>
                                                    <select
                                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                                        value={newUserForm.role}
                                                        onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                                                    >
                                                        <option value="participante">Participante</option>
                                                        <option value="supervisor">Supervisor</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Empresa</label>
                                                    <div className="relative">
                                                        <BriefcaseIcon className="w-4 h-4 absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
                                                        <select
                                                            className="w-full pl-9 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-white"
                                                            value={newUserForm.company}
                                                            onChange={(e) => setNewUserForm({ ...newUserForm, company: e.target.value })}
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            {companies.map(c => (
                                                                <option key={c.id} value={c.id}>{c.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 border-t border-slate-100 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setIsUserModalOpen(false);
                                                    setUserFormError('');
                                                    setNewUserForm({ fullName: '', username: '', password: '', role: 'participante', company: '' });
                                                    setEditingUserUsername(null);
                                                }}
                                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={editingUserUsername ? handleUpdateUser : handleCreateUser}
                                                className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-colors ${editingUserUsername
                                                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                                    : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                                                    }`}
                                            >
                                                {editingUserUsername ? 'Guardar Cambios' : 'Crear Usuario'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {section === 'habilidades' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-bold text-slate-900">Gestión de Habilidades</h1>
                                <button
                                    onClick={() => {
                                        setEditingSkillId(null);
                                        setNewSkillForm({ name: '', area: 'liderazgo', description: '', level: 'Básico' });
                                        setIsSkillModalOpen(true);
                                    }}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                                >
                                    <Plus className="w-5 h-5" /> Nueva Habilidad
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {skills.map(skill => {
                                    const color = getAreaColor(skill.area as AreaType);
                                    const emoji = getAreaEmoji(skill.area as AreaType);

                                    return (
                                        <div key={skill.id} className="bg-white p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-200 hover:shadow-xl transition-all group">
                                            <div className="text-5xl text-center mb-4 group-hover:scale-110 transition-transform">{emoji}</div>
                                            <h4 className="font-bold text-lg text-center mb-2 text-slate-800 leading-tight min-h-[3rem] flex items-center justify-center">
                                                {skill.name}
                                            </h4>
                                            <div className="text-center mb-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-${color}-50 text-${color}-600`}>
                                                    {skill.area}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 text-center mb-4 min-h-[2.5rem]">{skill.description}</p>
                                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                                <button
                                                    className={`flex-1 text-sm py-2 rounded-lg font-medium transition-colors ${skill.isCustom
                                                        ? 'bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                        }`}
                                                    onClick={() => skill.isCustom && openEditSkillModal(skill)}
                                                    title={skill.isCustom ? "Editar habilidad" : "Solo habilidades custom pueden editarse"}
                                                >
                                                    ✏️ Editar
                                                </button>
                                                <button
                                                    className="flex-1 bg-slate-50 text-slate-600 text-sm py-2 rounded-lg hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
                                                    onClick={() => saveSkills(skills.filter(s => s.id !== skill.id))}
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div
                                    onClick={() => {
                                        setEditingSkillId(null);
                                        setNewSkillForm({ name: '', area: 'liderazgo', description: '', level: 'Básico' });
                                        setIsSkillModalOpen(true);
                                    }}
                                    className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer min-h-[300px]"
                                >
                                    <Plus className="w-12 h-12 mb-2" />
                                    <span className="font-bold">Agregar Habilidad Custom</span>
                                </div>
                            </div>

                            {/* CREATE/EDIT SKILL MODAL */}
                            {isSkillModalOpen && (
                                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
                                        <div className="bg-slate-50 p-6 border-b border-slate-200">
                                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                                {editingSkillId ? (
                                                    <><Edit2 className="w-6 h-6 text-indigo-600" /> Editar Habilidad Custom</>
                                                ) : (
                                                    <><Star className="w-6 h-6 text-indigo-600" /> Crear Habilidad Custom</>
                                                )}
                                            </h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                {editingSkillId ? 'Modifica los detalles de la habilidad.' : 'Define una nueva competencia para el entrenamiento.'}
                                            </p>
                                        </div>

                                        <div className="p-6 space-y-4">
                                            {skillFormError && (
                                                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-600 rounded-full" /> {skillFormError}
                                                </div>
                                            )}

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de la Habilidad</label>
                                                <div className="relative">
                                                    <PenTool className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        className="w-full pl-10 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                                        placeholder="Ej: Gestión del Tiempo"
                                                        value={newSkillForm.name}
                                                        onChange={(e) => setNewSkillForm({ ...newSkillForm, name: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo / Área</label>
                                                    <select
                                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                        value={newSkillForm.area}
                                                        onChange={(e) => setNewSkillForm({ ...newSkillForm, area: e.target.value })}
                                                    >
                                                        <option value="liderazgo">Liderazgo</option>
                                                        <option value="comunicacion">Comunicación</option>
                                                        <option value="negociacion">Negociación</option>
                                                        <option value="autoliderazgo">Autoliderazgo</option>
                                                        <option value="Productividad">Productividad</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nivel</label>
                                                    <select
                                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                                        value={newSkillForm.level}
                                                        onChange={(e) => setNewSkillForm({ ...newSkillForm, level: e.target.value })}
                                                    >
                                                        <option value="Básico">Básico</option>
                                                        <option value="Intermedio">Intermedio</option>
                                                        <option value="Avanzado">Avanzado</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                                                <textarea
                                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none"
                                                    placeholder="Describe brevemente en qué consiste esta habilidad..."
                                                    value={newSkillForm.description}
                                                    onChange={(e) => setNewSkillForm({ ...newSkillForm, description: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 border-t border-slate-100 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setIsSkillModalOpen(false);
                                                    setEditingSkillId(null);
                                                    setSkillFormError('');
                                                    setNewSkillForm({ name: '', area: 'liderazgo', description: '', level: 'Básico' });
                                                }}
                                                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSaveSkill}
                                                className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
                                            >
                                                {editingSkillId ? 'Guardar Cambios' : 'Crear Habilidad'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};