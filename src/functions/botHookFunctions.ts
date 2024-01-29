import { MathUtils, Quaternion, Vector3 } from 'three'

import { iterativeMapToObject } from '@etherealengine/common/src/utils/mapToObject'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '@etherealengine/engine/src/EngineState'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getState } from '@etherealengine/hyperflux'

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
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { SceneState } from '@etherealengine/engine/src/scene/Scene'

export const BotHookFunctions = {
  [BotHooks.IsBot]:isBot,
  [BotHooks.LocationReady]: worldNetworkReady,
  [BotHooks.SceneLoaded]: sceneLoaded,
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
  [BotHooks.GetPlayerRotation]: getPlayerRotation,
  [BotHooks.GetPlayerScale]: getPlayerScale,
  [BotHooks.GetPlayerTransform]: getPlayerTransform,
  [BotHooks.RotatePlayer]: rotatePlayer,
  [BotHooks.GetSceneMetadata]: getSceneMetadata,
  [BotHooks.GetWorldNetworkPeers]: getPeers,
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

export function isBot(){
  return getState(EngineState).isBot
}

export function worldNetworkReady() {
  return NetworkState.worldNetwork?.ready
}

export function sceneLoaded() {
  return getState(SceneState).sceneLoaded
}

export function getPlayerPosition() {
  return getComponent(Engine.instance.localClientEntity, TransformComponent)?.position
}
export function getPlayerRotation() {
  return getComponent(Engine.instance.localClientEntity, TransformComponent)?.rotation
}
export function getPlayerScale() {
  return getComponent(Engine.instance.localClientEntity, TransformComponent)?.scale
}
export function getPlayerTransform() {
  return getComponent(Engine.instance.localClientEntity, TransformComponent)?.matrix
}
/**
 * @param {object} args
 * @param {number} args.angle in degrees
 */
export function rotatePlayer({ angle }) {
  const transform = getComponent(Engine.instance.localClientEntity, TransformComponent)
  transform.rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(angle)))
}

export function getPeers() {
  return Object.entries(NetworkState.worldNetwork.peers)
}

export function getSceneMetadata() {
  return Engine.instance.scene.toJSON()
}

export function getWorldMetadata() {}

export function serializeEngine() {
  const engine = {
    userId: Engine.instance.userID,
    store: Engine.instance.store,
    engineTimer: Engine.instance.engineTimer,
    isBot: getState(EngineState).isBot,
    publicPath: getState(EngineState).publicPath,
    xrFrame: getState(XRState).xrFrame,
    isEditor: getState(EngineState).isEditor
  }

  console.log(JSON.stringify(iterativeMapToObject(engine)))
  return JSON.stringify(iterativeMapToObject(engine))
}
