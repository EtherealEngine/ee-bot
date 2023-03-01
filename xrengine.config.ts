import type { ProjectConfigInterface } from '@etherealengine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: undefined,
  thumbnail: '/static/xrengine_thumbnail.jpg',
  routes: {},
  worldInjection: () => import('./injectBotModule'),
  services: undefined,
  databaseSeed: undefined
}

export default config
