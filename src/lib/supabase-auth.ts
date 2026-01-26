import { supabase } from './supabase'

export async function loginUser(email: string, password: string) {
    try {
        // Intentar login con Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (authError) throw authError

        // Obtener perfil del usuario desde tabla profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single()

        if (profileError) throw profileError

        return { success: true, user: profile }
    } catch (error) {
        console.error('Login error:', error)
        return { success: false, error }
    }
}

export async function registerUser(userData: {
    username: string
    email: string
    password: string
    role: string
    empresa: string
}) {
    try {
        // 1. Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password
        })

        if (authError || !authData.user) throw authError || new Error('User creation failed')

        // 2. Crear perfil en tabla profiles
        // Note: In a real scenario, we might need a way to map 'empresa' name to UUID
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: authData.user.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                empresa_id: userData.empresa,
                xp: 0,
                nivel: 'Aprendiz'
            })
            .select()
            .single()

        if (profileError) throw profileError

        return { success: true, user: profile }
    } catch (error) {
        console.error('Register error:', error)
        return { success: false, error }
    }
}

export async function logoutUser() {
    const { error } = await supabase.auth.signOut()
    return { success: !error, error }
}

export async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) return null

    // Obtener perfil completo
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

    return profile
}
