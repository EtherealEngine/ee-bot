import { KeyInput } from 'puppeteer'

//Bot Settings Actions
const SettingsGeneralActionType = {
  ChangeTheme:'changeTheme', // two inputs , first whose theme to change( client , admin , studio) , second themetype 
}

const SettingsAudioActionType = {
    SetSpatialAudioVideo:'setSpatialAudioVideo',
    ChangeVolume:'changeVolume', // two inputs, volume type ( user, microphone , scene, etc) and volume value 
}

const SettingsGraphicsActionType = {
   ChangeResolution:'changeResolution',
   SetPostProcessing:'setPostProcessing',
   SetShadows:'setShadows',
   SetAutomatic:'setAutomatic',
}

const SettingsActionType = {
  General:SettingsGeneralActionType, 
  Audio:SettingsAudioActionType,
  Graphics:SettingsGraphicsActionType,
  Return:'return'
}

const AvatarActionType = {
    SearchAvatar:'searchAvatar', // search by perfix 
    SelectAvatar:'selectAvatar', // select by index or prefix, to be used after Search avatar 
    CreateReadyPlayerMeAvatar:'createReadyPlayerMeAvatar', // will use the API to be implemented later
    CreateCustomAvatar:'createCustomAvatar', // upload with name , avatar url , thumbnail url (only url version to be implemented) 
    Return:'return'
}

//Bot Group Actions
const PartyActionType = {
    PartyCreate:'partyCreate',
    PartyDelete:'partyDelete',
    PartyLeave:'partyLeave',
    PartyInvite:'partyInvite',
}

const FriendActionType = {
    FindFriend:'findFriend',
    SelectFriend:'SelectFriend',
    SelectBlockedFriend:'selectBlockedFriend',
    BlockFriend:'blockFreind', // need to check how to implement this later
    UnblockFriend:'unblockFreind' // need to check how to implement this later
}

const GroupActionType = {
    ShareToQuest:'shareToQuest', // share as spectator or invite based on boolean
    ShareToDirect:'shareToDirect', // share via mail or phone , share as spectator or invite based on boolean
    PartySettings:PartyActionType,
    FriendSettings:FriendActionType,
}

//Bot All Actions
export const BotActionType = {
  None: 'none',

  // connection
  Connect: 'connect',
  Disconnect: 'disconnect',

  // room
  EnterRoom: 'enterRoom',
  LeaveRoom: 'leaveRoom',

  // key
  KeyPress: 'keyPress',

  // audio
  SendAudio: 'sendAudio',
  StopAudio: 'stopAudio',
  ReceiveAudio: 'receiveAudio',

  // video
  SendVideo: 'sendVideo',
  StopVideo: 'stopVideo',
  ReceiveVideo: 'receiveVideo',

  // interact
  InteractObject: 'interactObject',

  // send message
  SendMessage: 'sendMessage',

  // flow control
  OpIf: 'opIf',
  Delay: 'delay',

  //Change Settings
  ChangeUserSettings:SettingsActionType,
  ChangeUserAvatar:AvatarActionType,
  
  //Animations
  AnimateCharacter:'animateCharacter',

  //Screenshot 
  TakeScreenshot:'takeScreenshot',

  //Group
  Group:GroupActionType,
}

//Bot Actions
export class BotAction {
  /**
   *
   * @param {*} type is type of BotActionType.
   * @param {*} data is type of MessageData | KeyEventData | EnterRoomData | OperatorData | ...
   */

  type: typeof BotActionType
  data: any

  constructor(type, data = {}) {
    this.type = type
    this.data = data
  }

  static connect() {
    return new BotAction(BotActionType.Connect, {})
  }

  static sendMessage(message) {
    return new BotAction(BotActionType.SendMessage, { message })
  }

  static sendAudio(duration:number) {
    return new BotAction(BotActionType.SendAudio, { duration })
  }

  static stopAudio() {
    return new BotAction(BotActionType.StopAudio, {})
  }

  static receiveAudio() {
    return new BotAction(BotActionType.ReceiveAudio, {})
  }

  static sendVideo(duration:number) {
    return new BotAction(BotActionType.SendVideo, { duration })
  }

  static stopVideo() {
    return new BotAction(BotActionType.StopVideo, {})
  }

  static receiveVideo() {
    return new BotAction(BotActionType.ReceiveVideo, {})
  }

  static keyPress(key: KeyInput, pressedTime: number) {
    return new BotAction(BotActionType.KeyPress, { key, pressedTime })
  }

  static interactObject() {
    return new BotAction(BotActionType.InteractObject)
  }

  static enterRoom(domain, locationName) {
    return new BotAction(BotActionType.EnterRoom, { domain, locationName })
  }

  static leaveRoom(domain, locationName) {
    return new BotAction(BotActionType.LeaveRoom, { domain, locationName })
  }

  static disconnect() {
    return new BotAction(BotActionType.Disconnect)
  }

  static opIf(expression, trueCallback, falseCallback) {
    return new BotAction(BotActionType.OpIf, { expression, trueCallback, falseCallback })
  }

  static delay(timeout:number) {
    return new BotAction(BotActionType.Delay, { timeout })
  }
  // we can move them to thier own set of actions later if needed

  //General 
  /**
   *
   * @param {*} uiType is type of UI Admin | Studio | Client ....
   * @param {*} theme is type of theme Dark | Light | VaporWare | Custom ....
   */
  static changeTheme(uiType,theme){ 
    return new BotAction(BotActionType.ChangeUserSettings.General.ChangeTheme, {uiType,theme})
  }

  //Audio
  /**
   *
   * @param {*} volumeType is type of Volume Master | Microphone | User | Scene ....
   * @param {*} value is type of theme Dark | Light | VaporWare | Custom ....
   */
  static changeVolume(volumeType,value:number){ 
    return new BotAction(BotActionType.ChangeUserSettings.Audio.ChangeVolume, {volumeType,value})
  }

  static setSpatialAudioVideo(value:Boolean){ 
    return new BotAction(BotActionType.ChangeUserSettings.Audio.SetSpatialAudioVideo, {value})
  }

  // Graphics
  static changeResolution(value:number){ 
    return new BotAction(BotActionType.ChangeUserSettings.Graphics.ChangeResolution, {value})
  }

  static setPostProcessing(value:Boolean){ 
    return new BotAction(BotActionType.ChangeUserSettings.Graphics.SetPostProcessing, {value})
  }

  static setShadows(value:Boolean){ 
    return new BotAction(BotActionType.ChangeUserSettings.Graphics.SetShadows, {value})
  }

  static setAutomatic(value:Boolean){ 
    return new BotAction(BotActionType.ChangeUserSettings.Graphics.SetAutomatic, {value})
  }

  // Avatar 
  static searchAvatar(query:string){ 
    return new BotAction(BotActionType.ChangeUserAvatar.SearchAvatar, {query})
  }

  static selectAvatar(avatarList){ // lis tof avatars from UI
    return new BotAction(BotActionType.ChangeUserAvatar.SelectAvatar, {avatarList})
  }

  static createReadyPlayerMeAvatar(){ 
    return new BotAction(BotActionType.ChangeUserAvatar.CreateReadyPlayerMeAvatar, {})
  }

  static createCustomAvatar(avatarName:string,avatarUrl:URL, thumbnailUrl:URL ){ 
    return new BotAction(BotActionType.ChangeUserAvatar.CreateCustomAvatar, {avatarName,avatarUrl,thumbnailUrl})
  }

  // Returns, need to think of a better way to implement this, like one return which returns as per arguement
  static UserSettingsReturn(){ 
    return new BotAction(BotActionType.ChangeUserSettings.Return, {})
  }

  static AvatarReturn(){ 
    return new BotAction(BotActionType.ChangeUserAvatar.Return, {})
  }
  //Sharing

  /**
   *
   * @param {*} value Spectator or Invite
   */ 
  static shareToQuest(value:Boolean){ 
    return new BotAction(BotActionType.Group.ShareToQuest, {value})
  }

  /**
   *
   * @param {*} value Spectator or Invite
   */
  static sharetoDirect(value:Boolean){ 
    return new BotAction(BotActionType.Group.ShareToDirect, {value})
  }

  //Party
  static partyCreate(){
    return new BotAction(BotActionType.Group.PartySettings.PartyCreate)
  }

  static partyDelete(){
    return new BotAction(BotActionType.Group.PartySettings.PartyDelete)
  }

  static partyLeave(){
    return new BotAction(BotActionType.Group.PartySettings.PartyLeave,)
  }

  static partyInvite(EmailorPhone:string){
    return new BotAction(BotActionType.Group.PartySettings.PartyInvite, {EmailorPhone})
  }
  //Animate
  static animateCharacter(animation){ // index/name of animation in the wheel
    return new BotAction(BotActionType.AnimateCharacter, {animation})
  } 
  //Screenshot
  static takeScreenshot(){
    return new BotAction(BotActionType.TakeScreenshot, {})
  } 
  //Friend (need to implement this later)


}
