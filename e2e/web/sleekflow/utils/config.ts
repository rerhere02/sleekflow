export interface Config {
  baseUrl: string;
  ssoUrl: string;
  auth0ClientId: string;
  headless: boolean;
  authStatePath: string;
  defaultTimeout: number;
}

export function getConfig(): Config {
  const env = process.env.ENV ?? 'stg';

  const shared = {
    ssoUrl: process.env.SSO_URL ?? 'https://sso.sleekflow.io',
    auth0ClientId: process.env.AUTH0_CLIENT_ID ?? 'JF6HeS1ExhYR8zig8L4TquIo1XKMVSiC',
    headless: process.env.HEADLESS !== 'false',
    defaultTimeout: 30_000,
  };

  const configs: Record<string, Config> = {
    stg: {
      ...shared,
      baseUrl: process.env.BASE_URL ?? 'https://app.sleekflow.io',
      authStatePath: process.env.AUTH_STATE_PATH ?? '.auth/sleekflow-stg.json',
    },
    prod: {
      ...shared,
      baseUrl: process.env.BASE_URL ?? 'https://app.sleekflow.io',
      authStatePath: process.env.AUTH_STATE_PATH ?? '.auth/sleekflow-prod.json',
    },
  };

  return configs[env] ?? configs['stg'];
}
