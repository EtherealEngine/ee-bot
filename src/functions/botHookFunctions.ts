import { MathUtils, Quaternion, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { BotHooks, XRBotHooks } from '../enums/BotHooks'
import {
  getXRInputPosition,
  moveControllerStick,
  overrideXR,
  pressControllerButton,
  setXRInputPosition,
  startXR,
  tweenXRInputSource,
  updateController,
  updateHead,
  xrInitialized,
  xrSupported
} from './xrBotHookFunctions'
import { iterativeMapToObject } from '@xrengine/common/src/utils/mapToObject'
import type { Network } from '@xrengine/engine/src/networking/classes/Network'

export const BotHookFunctions = {
  [BotHooks.LocationLoaded]: locationLoaded,
  [BotHooks.SceneLoaded]: sceneLoaded,
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
  [BotHooks.GetSceneMetadata]: getSceneMetadata,
  [BotHooks.RotatePlayer]: rotatePlayer,
  [BotHooks.GetClients]: getClients,
  [BotHooks.SerializeEngine]: serializeEngine,
  [XRBotHooks.OverrideXR]: overrideXR,
  [XRBotHooks.XRSupported]: xrSupported,
  [XRBotHooks.XRInitialized]: xrInitialized,
  [XRBotHooks.StartXR]: startXR,
  [XRBotHooks.UpdateHead]: updateHead,
  [XRBotHooks.UpdateController]: updateController,
  [XRBotHooks.PressControllerButton]: pressControllerButton,
  [XRBotHooks.MoveControllerStick]: moveControllerStick,
  [XRBotHooks.GetXRInputPosition]: getXRInputPosition,
  [XRBotHooks.SetXRInputPosition]: setXRInputPosition,
  [XRBotHooks.TweenXRInputSource]: tweenXRInputSource
}

// === ENGINE === //

export function locationLoaded() {
  return getEngineState().joinedWorld.value
}

export function sceneLoaded() {
  return getEngineState().sceneLoaded.value
}

export function getPlayerPosition() {
  return getComponent(Engine.instance.currentWorld.localClientEntity, TransformComponent)?.position
}

export function getSceneMetadata() {
  return useWorld().sceneMetadata
}

/**
 * @param {object} args
 * @param {number} args.angle in degrees
 */
export function rotatePlayer({ angle }) {
  const transform = getComponent(useWorld().localClientEntity, TransformComponent)
  transform.rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(angle)))
}

export function getClients() {
  return Array.from(useWorld().clients)
}

export function serializeEngine() {
  const engine = {
    tickRate: Engine.instance.tickRate,
    injectedSystems: Engine.instance.injectedSystems,
    userId: Engine.instance.userId,
    store: Engine.instance.store,
    frameTime: Engine.instance.frameTime,
    engineTimer: Engine.instance.engineTimer,
    isBot: Engine.instance.isBot,
    isHMD: Engine.instance.isHMD,
    // currentWorld: Engine.instance.currentWorld,
    // worlds: Engine.instance.worlds,
    publicPath: Engine.instance.publicPath,
    simpleMaterials: Engine.instance.simpleMaterials,
    xrFrame: Engine.instance.xrFrame,
    isEditor: Engine.instance.isEditor
  } as Engine

  console.log(JSON.stringify(iterativeMapToObject(engine)))
  return JSON.stringify(iterativeMapToObject(engine))
}
