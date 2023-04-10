import { EtherealEngineBot } from '.'
import { BotActionType } from './bot-action'

export class BotManager {
  bots: {
    [x: string]: EtherealEngineBot
  }
  actions: any
  options: any
  /**
   * BotManager constructor
   * @param options:
   *      - headless
   *      - verbose
   *      - onError
   */
  constructor(options = {}) {
    this.bots = {}
    this.actions = []
    this.options = options
  }

  findBotById(id) {
    return this.bots[id]
  }

  addBot(id,name) {
    const foundBot = this.findBotById(id)
    if (foundBot) {
      return foundBot
    }

    const bot = new EtherealEngineBot({
      name,
      ...this.options
    })

    this.bots[id] = bot

    return bot
  }

  addAction(botId, action) {
    this.actions.push({ botId, action })
  }

  async run() {
    console.log(this.bots)
    for (const botAction of this.actions) {
      const { botId, action } = botAction
      const bot = this.findBotById(botId)

      if (!bot) {
        console.error('Invalid bot Id', botId)
        continue
      }

      switch (action.type) {
        case BotActionType.Connect:
          await bot.launchBrowser()
          break

        case BotActionType.Disconnect:
          bot.quit()
          break

        case BotActionType.EnterRoom:
          // action.data is type of EnterRoomData.
          await bot.enterRoom(`https://${action.data.domain}/location/${action.data.locationName}`)
          break

        case BotActionType.LeaveRoom:
          // action.data is type of EnterRoomData.
          await bot.navigate(`https://${action.data.domain}/location/${action.data.locationName}`)
          break

        case BotActionType.KeyPress:
          // action.data is type of KeyEventData
          await bot.keyPress(action.data.key, action.data.pressedTime)
          break

        case BotActionType.SendAudio:
          await bot.sendAudio(action.data.duration)
          break

        case BotActionType.StopAudio:
          await bot.stopAudio(bot)
          break

        case BotActionType.ReceiveAudio:
          await bot.recvAudio(action.data.duration)
          break

        case BotActionType.SendVideo:
          await bot.sendVideo(action.data.duration)
          break

        case BotActionType.StopVideo:
          await bot.stopVideo(bot)
          break

        case BotActionType.ReceiveVideo:
          await bot.recvVideo(action.data.duration)
          break

        case BotActionType.InteractObject:
          await bot.interactObject()
          break

        case BotActionType.SendMessage:
          // action.data is type of MessageData
          await bot.sendMessage(action.data.message)
          break

        case BotActionType.Delay:
          await bot.delay(action.data.timeout)
          break
        //settings
        case BotActionType.ChangeUserSettings.UpdateUsername:
          await bot.updateUsername(action.data.name)
          break
        case BotActionType.ChangeUserSettings.General.ChangeTheme:
          await bot.changeTheme(action.data.uiType, action.data.theme)
          break
        case BotActionType.ChangeUserSettings.Audio.SetSpatialAudioVideo:
          await bot.setSpatialAudioVideo(action.data.value)
          break
        case BotActionType.ChangeUserSettings.Audio.ChangeVolume:
          await bot.changeVolume(action.data.audioType, action.data.value)
          break
        case BotActionType.ChangeUserSettings.Graphics.ChangeResolution:
          await bot.changeResolution(action.data.value)
          break
        case BotActionType.ChangeUserSettings.Graphics.SetAutomatic:
          await bot.setAutomatic(action.data.value)
          break
        case BotActionType.ChangeUserSettings.Graphics.SetPostProcessing:
          await bot.setPostProcessing(action.data.value)
          break
        case BotActionType.ChangeUserSettings.Graphics.SetShadows:
          await bot.setShadows(action.data.value)
          break
        case BotActionType.CloseInterface:
          await bot.closeInterface()
          break
        case BotActionType.ChangeUserAvatar.SearchAvatar:
          await bot.searchAvatar(action.data.query)
          break
        case BotActionType.ChangeUserAvatar.SelectAvatar:
          await bot.selectAvatar(action.data.name)
          break
        case BotActionType.ChangeUserAvatar.CreateCustomAvatar:
          break
        case BotActionType.ChangeUserAvatar.CreateReadyPlayerMeAvatar:
          break
        case BotActionType.AnimateCharacter:
          await bot.animateCharacter(action.data.animation)
          break
        case BotActionType.TakeScreenshot:
          await bot.takeScreenshot(action.data.storagePath)
          break
        default:
          console.error('Unknown bot action')
          break
      }
    }
  }

  async clear() {
    const bots = Object.values(this.bots)
    for (const bot of bots) {
      bot.quit()
    }

    this.bots = {}
  }
}
