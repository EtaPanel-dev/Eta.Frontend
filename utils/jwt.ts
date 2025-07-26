export interface JWTPayload {
    username?: string
    exp?: number
    iat?: number
    [key: string]: any
}

/**
 * 解析JWT token
 */
export const parseJWT = (token: string): JWTPayload | null => {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) {
            return null
        }

        // 解码payload部分
        const payload = JSON.parse(atob(parts[1]))
        return payload
    } catch (error) {
        console.error('JWT解析失败:', error)
        return null
    }
}

/**
 * 检查JWT token是否过期
 */
export const isJWTExpired = (token: string): boolean => {
    const payload = parseJWT(token)
    if (!payload || !payload.exp) {
        return true
    }

    const now = Math.floor(Date.now() / 1000)
    return payload.exp < now
}

/**
 * 获取JWT token的过期时间
 */
export const getJWTExpiry = (token: string): Date | null => {
    const payload = parseJWT(token)
    if (!payload || !payload.exp) {
        return null
    }

    return new Date(payload.exp * 1000)
}

/**
 * 获取JWT token的剩余有效时间（秒）
 */
export const getJWTTimeRemaining = (token: string): number => {
    const expiry = getJWTExpiry(token)
    if (!expiry) {
        return 0
    }

    return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000))
}

/**
 * 从JWT token中提取用户信息
 */
export const getUserFromJWT = (token: string): { username: string } | null => {
    const payload = parseJWT(token)
    if (!payload || !payload.username) {
        return null
    }

    return { username: payload.username }
}