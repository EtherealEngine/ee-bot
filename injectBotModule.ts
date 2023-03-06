import { World } from '@etherealengine/engine/src/ecs/classes/World'
import { initSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import BotHookSystem from './src/functions/BotHookSystem'

export default async function injectBotModule() {
  await initSystems([
    {
      uuid: 'xre.bot.BotHookSystem',
      type: SystemUpdateType.FIXED,
      systemLoader: () => Promise.resolve({ default: BotHookSystem })
    }
  ])
}
