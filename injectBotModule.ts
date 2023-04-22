import { startSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SimulationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { BotHookSystem } from './src/functions/BotHookSystem'

export default async function injectBotModule() {
  startSystem(BotHookSystem, { with: SimulationSystemGroup })
}
