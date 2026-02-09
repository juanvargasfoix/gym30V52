import { supabase } from './supabase'

// ==================== PROFILES ====================
export const getProfile = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error getting profile:', error)
        return null
    }
}

export const updateProfile = async (userId: string, updates: any) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating profile:', error)
        return null
    }
}

export const getAllProfiles = async (empresaId?: string) => {
    try {
        let query = supabase.from('profiles').select('*')

        if (empresaId) {
            query = query.eq('empresa_id', empresaId)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting profiles:', error)
        return []
    }
}

// ==================== COMPANIES ====================
export const getCompanies = async () => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .order('nombre')

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting companies:', error)
        return []
    }
}

export const getCompany = async (companyId: string) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error getting company:', error)
        return null
    }
}

export const createCompany = async (companyData: {
    nombre: string
    areas_activas?: string[]
    area_flex?: string
}) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .insert({
                ...companyData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error creating company:', error)
        return null
    }
}

export const updateCompany = async (companyId: string, updates: any) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', companyId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating company:', error)
        return null
    }
}

// ==================== SKILLS ====================
export const getSkills = async (empresaId?: string) => {
    try {
        let query = supabase.from('skills').select('*').order('area').order('nivel')

        // Si hay empresaId, traer skills core (empresa_id = null) + custom de esa empresa
        if (empresaId) {
            query = query.or(`empresa_id.is.null,empresa_id.eq.${empresaId}`)
        } else {
            // Si no hay empresaId, solo traer skills core
            query = query.is('empresa_id', null)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting skills:', error)
        return []
    }
}

export const getSkill = async (skillId: string) => {
    try {
        const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('id', skillId)
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error getting skill:', error)
        return null
    }
}

export const createCustomSkill = async (skillData: {
    nombre: string
    tipo: 'quiz' | 'chat' | 'roleplay' | 'reflexion'
    nivel: number
    area: string
    descripcion?: string
    prerequisitos?: string[]
    empresa_id: string
}) => {
    try {
        const { data, error } = await supabase
            .from('skills')
            .insert({
                ...skillData,
                is_custom: true,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error creating custom skill:', error)
        return null
    }
}

// ==================== USER_PROGRESS ====================
export const getUserProgress = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)

        if (error) throw error

        // Convertir array a objeto con skillId como key (como lo espera la app)
        const progressObj: Record<string, any> = {}
        data?.forEach(progress => {
            progressObj[progress.skill_id] = progress
        })

        return progressObj
    } catch (error) {
        console.error('Error getting user progress:', error)
        return {}
    }
}

export const updateSkillProgress = async (
    userId: string,
    skillId: string,
    status: 'bloqueada' | 'disponible' | 'en-progreso' | 'conquered',
    ejerciciosCompletados?: number
) => {
    try {
        // Buscar si ya existe el progreso
        const { data: existing } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('skill_id', skillId)
            .single()

        if (existing) {
            // Update
            const { data, error } = await supabase
                .from('user_progress')
                .update({
                    status,
                    ejercicios_completados: ejerciciosCompletados,
                    completed_at: status === 'conquered' ? new Date().toISOString() : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            // Insert
            const { data, error } = await supabase
                .from('user_progress')
                .insert({
                    user_id: userId,
                    skill_id: skillId,
                    status,
                    ejercicios_completados: ejerciciosCompletados || 0,
                    completed_at: status === 'conquered' ? new Date().toISOString() : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error
            return data
        }
    } catch (error) {
        console.error('Error updating skill progress:', error)
        return null
    }
}

export const getCompanyProgress = async (empresaId: string) => {
    try {
        // Obtener todos los usuarios de la empresa
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id')
            .eq('empresa_id', empresaId)

        if (profilesError) throw profilesError

        const userIds = profiles?.map(p => p.id) || []

        if (userIds.length === 0) return []

        // Obtener el progreso de todos esos usuarios
        const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .in('user_id', userIds)

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting company progress:', error)
        return []
    }
}

// ==================== KUDOS ====================
export const sendKudo = async (fromUserId: string, toUserId: string, message: string, xpAwarded: number = 10) => {
    try {
        const { data, error } = await supabase
            .from('kudos')
            .insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                message,
                xp_awarded: xpAwarded,
                created_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error

        // Actualizar XP del usuario que recibe el kudo
        const { data: profile } = await supabase
            .from('profiles')
            .select('xp')
            .eq('id', toUserId)
            .single()

        if (profile) {
            await supabase
                .from('profiles')
                .update({
                    xp: profile.xp + xpAwarded,
                    updated_at: new Date().toISOString()
                })
                .eq('id', toUserId)
        }

        return data
    } catch (error) {
        console.error('Error sending kudo:', error)
        return null
    }
}

export const getKudos = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('kudos')
            .select('*')
            .eq('to_user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting kudos:', error)
        return []
    }
}

export const getAllKudos = async (empresaId?: string) => {
    try {
        let query = supabase
            .from('kudos')
            .select(`
        *,
        from_user:profiles!kudos_from_user_id_fkey(username),
        to_user:profiles!kudos_to_user_id_fkey(username)
      `)
            .order('created_at', { ascending: false })

        const { data, error } = await query
        if (error) throw error
        return data || []
    } catch (error) {
        console.error('Error getting all kudos:', error)
        return []
    }
}

// ==================== GYM CONFIG ====================
export const getGymConfig = async () => {
    try {
        const { data, error } = await supabase
            .from('gym_config')
            .select('*')
            .limit(1)
            .single()

        if (error) throw error
        return data?.config || null
    } catch (error) {
        console.error('Error getting gym config:', error)
        return null
    }
}

export const updateGymConfig = async (config: any) => {
    try {
        // Obtener el id del registro existente
        const { data: existing } = await supabase
            .from('gym_config')
            .select('id')
            .limit(1)
            .single()

        if (existing) {
            const { data, error } = await supabase
                .from('gym_config')
                .update({
                    config,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (error) throw error
            return data
        } else {
            const { data, error } = await supabase
                .from('gym_config')
                .insert({
                    config,
                    updated_at: new Date().toISOString()
                })
                .select()
                .single()

            if (error) throw error
            return data
        }
    } catch (error) {
        console.error('Error updating gym config:', error)
        return null
    }
}

// ==================== FLEX AREA CONFIG (per company) ====================
export const getCompanyFlexConfig = async (companyId: string) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .select('flex_area_config')
            .eq('id', companyId)
            .single()

        if (error) throw error
        return data?.flex_area_config || null
    } catch (error) {
        console.error('Error getting company flex config:', error)
        return null
    }
}

export const updateCompanyFlexConfig = async (companyId: string, flexConfig: any) => {
    try {
        const { data, error } = await supabase
            .from('companies')
            .update({
                flex_area_config: flexConfig,
                updated_at: new Date().toISOString()
            })
            .eq('id', companyId)
            .select()
            .single()

        if (error) throw error
        return data
    } catch (error) {
        console.error('Error updating company flex config:', error)
        return null
    }
}