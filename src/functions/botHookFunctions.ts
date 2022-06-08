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
  const engine = iterativeMapToObject(Engine.instance) as Engine
  // delete extremelty large objects
  [...engine.worlds, engine.currentWorld].forEach((world) => {
    world.scene = null!
    world.camera = null!
    world.audioListener = null!
    world.networks && (Object.values(world.networks as any as Record<string, Network>)).forEach((network: any) => {
      return {
        // dataProducers: mapToObject(network.dataProducers),
        // dataConsumers: mapToObject(network.dataConsumers),
        hostId: network.hostId,
        type: network.type,
        leaving: network.leaving,
        left: network.left,
        reconnecting: network.reconnecting,
        // recvTransport: network.recvTransport,
        // sendTransport: network.sendTransport,
        dataProducer: network.left,
      }
    })
  })
  return  JSON.stringify(engine)
}
