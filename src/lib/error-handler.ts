export function handleAuthError(error: any) {
    if (!error) return 'Algo salió mal'

    const message = error.message || ''

    if (message.includes('Invalid login credentials')) {
        return 'Usuario o contraseña incorrectos'
    }
    if (message.includes('Email not confirmed')) {
        return 'Por favor confirma tu email antes de ingresar'
    }
    if (message.includes('User already registered')) {
        return 'El correo electrónico ya está registrado'
    }

    return 'Error de autenticación. Intenta nuevamente.'
}
