import { World } from '@xrengine/engine/src/ecs/classes/World'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'

export default async function injectBotModule(world: World) {
  await initSystems(world, [
    {
      type: SystemUpdateType.FIXED,
      systemModulePromise: import('./src/systems/BotHookSystem')
    }
  ])
}
