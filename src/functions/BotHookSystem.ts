import { isDev } from '@etherealengine/common/src/config'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { getState } from '@etherealengine/hyperflux'

import { BotHookFunctions } from './botHookFunctions'
import { sendXRInputData, simulateXR } from './xrBotHookFunctions'

const setupBotKey = 'xre.bot.setupBotKey'

export default async function BotHookSystem() {
  globalThis.botHooks = BotHookFunctions

  if (isDev) {
    // AvatarInputSchema.inputMap.set('Semicolon', setupBotKey)
    // AvatarInputSchema.behaviorMap.set(setupBotKey, (entity, inputKey, inputValue) => {
    //   if (inputValue.lifecycleState !== LifecycleValue.Started) return
    //   if (!EngineRenderer.instance.xrSession) simulateXR()
    // })
  }

  const execute = () => {
    const xrSession = getState(XRState).session.value
    if (getState(EngineState).isBot.value && Boolean(xrSession)) {
      sendXRInputData()
    }
  }

  const cleanup = async () => {
    delete globalThis.botHooks
    // if (AvatarInputSchema.inputMap.get('Semicolon') === setupBotKey) AvatarInputSchema.inputMap.delete('Semicolon')
    // AvatarInputSchema.behaviorMap.delete('setupBotKey')
  }

  return { execute, cleanup }
}
