import config from './config'
declare global {
  const G_CONFIG: typeof config
}
export {}