export enum EnvironmentType {
    PRODUCTION = 'production',
    SANDBOX = 'sandbox',
    DEVELOPMENT = 'development',
}

export function getCurrentEnvironment(): EnvironmentType {
    const env = process.env.CREEM_ENVIRONMENT || process.env.NODE_ENV;
    if (env === EnvironmentType.PRODUCTION) {
        return EnvironmentType.PRODUCTION;
    }
    if (env === EnvironmentType.SANDBOX) {
        return EnvironmentType.SANDBOX;
    }
    return EnvironmentType.DEVELOPMENT;
}
