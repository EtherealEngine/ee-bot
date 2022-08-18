import { isDev } from '@xrengine/common/src/utils/isDev'
import { AvatarInputSchema } from '@xrengine/engine/src/avatar/AvatarInputSchema'
import { LifecycleValue } from '@xrengine/engine/src/common/enums/LifecycleValue'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { EngineRenderer } from '@xrengine/engine/src/renderer/WebGLRendererSystem'

import { BotHookFunctions } from '../functions/botHookFunctions'
import { sendXRInputData, simulateXR } from '../functions/xrBotHookFunctions'

export default async function BotHookSystem(world: World) {
  globalThis.botHooks = BotHookFunctions

  if (isDev) {
    const setupBotKey = 'setupBotKey'
    AvatarInputSchema.inputMap.set('Semicolon', setupBotKey)
    AvatarInputSchema.behaviorMap.set(setupBotKey, (entity, inputKey, inputValue) => {
      if (inputValue.lifecycleState !== LifecycleValue.Started) return
      if (!EngineRenderer.instance.xrSession) simulateXR()
    })
  }

  return () => {
    if (Engine.instance.isBot && Boolean(EngineRenderer.instance.xrSession)) {
      sendXRInputData()
    }
  }
}
