import { supabase } from './supabase'

/**
 * CRUD for PROFILES
 */
export const getProfile = async (userId: string) => {
    // TODO: Implement with Supabase
    console.log('Stub: getProfile', userId)
    return null
}

export const updateProfile = async (userId: string, data: any) => {
    // TODO: Implement with Supabase
    console.log('Stub: updateProfile', userId, data)
    return null
}

/**
 * CRUD for COMPANIES
 */
export const getCompanies = async () => {
    // TODO: Implement with Supabase
    console.log('Stub: getCompanies')
    return []
}

export const createCompany = async (data: any) => {
    // TODO: Implement with Supabase
    console.log('Stub: createCompany', data)
    return null
}

/**
 * CRUD for SKILLS
 */
export const getSkills = async (empresaId?: string) => {
    // TODO: Implement with Supabase
    console.log('Stub: getSkills', empresaId)
    return []
}

export const createCustomSkill = async (data: any) => {
    // TODO: Implement with Supabase
    console.log('Stub: createCustomSkill', data)
    return null
}

/**
 * CRUD for USER_PROGRESS
 */
export const getUserProgress = async (userId: string) => {
    // TODO: Implement with Supabase
    console.log('Stub: getUserProgress', userId)
    return {}
}

export const updateSkillProgress = async (userId: string, skillId: string, status: string) => {
    // TODO: Implement with Supabase
    console.log('Stub: updateSkillProgress', userId, skillId, status)
    return null
}

/**
 * CRUD for KUDOS
 */
export const sendKudo = async (fromId: string, toId: string, message: string) => {
    // TODO: Implement with Supabase
    console.log('Stub: sendKudo', fromId, toId, message)
    return null
}

export const getKudos = async (userId: string) => {
    // TODO: Implement with Supabase
    console.log('Stub: getKudos', userId)
    return []
}
