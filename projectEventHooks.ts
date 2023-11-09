import { ProjectEventHooks } from '@etherealengine/projects/ProjectConfigInterface'
import { Application } from '@etherealengine/server-core/declarations'

import { createScenes } from '@etherealengine/server-core/src/util/createScenes'
import packageJson from './package.json'

const config = {
  onUpdate: async (app: Application) => {
    await createScenes(app, packageJson.name)
  },
} as ProjectEventHooks

export default config
