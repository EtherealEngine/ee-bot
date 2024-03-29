import { useEffect } from 'react'
import { isDev } from '@etherealengine/common/src/config'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { getState } from '@etherealengine/hyperflux'

import { BotHookFunctions } from './botHookFunctions'
import { sendXRInputData, simulateXR } from './xrBotHookFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@etherealengine/ecs/src/SystemGroups'
import { BotUserAgent } from '@etherealengine/common/src/constants/BotUserAgent'

const setupBotKey = 'ee.bot.setupBotKey'

const isBot = navigator.userAgent === BotUserAgent

const execute = () => {
  if (isBot && getState(XRState).session) {
    sendXRInputData()
  }
}

const reactor = () => {
  useEffect(() => {
    globalThis.botHooks = BotHookFunctions
    if (isDev) {
      // AvatarInputSchema.inputMap.set('Semicolon', setupBotKey)
      // AvatarInputSchema.behaviorMap.set(setupBotKey, (entity, inputKey, inputValue) => {
      //   if (inputValue.lifecycleState !== LifecycleValue.Started) return
      //   if (!EngineRenderer.instance.xrSession) simulateXR()
      // })
    }
    return () => {
      delete globalThis.botHooks

      // if (AvatarInputSchema.inputMap.get('Semicolon') === setupBotKey) AvatarInputSchema.inputMap.delete('Semicolon')
      // AvatarInputSchema.behaviorMap.delete('setupBotKey')
    }
  }, [])
  return null
}

export const BotHookSystem = defineSystem({
  uuid: 'ee.bot.BotHookSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
