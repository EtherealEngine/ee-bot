/* eslint-disable @typescript-eslint/ban-types */
import fs from 'fs'
import * as path from 'path'
import * as puppeteer from 'puppeteer'
import { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page } from 'puppeteer'
import { URL } from 'url'

import { BotUserAgent } from '@etherealengine/common/src/constants/BotUserAgent'

import { getOS } from './utils/getOS'
import { makeAdmin } from './utils/make-user-admin'
import { PageUtils } from './utils/pageUtils'
import { error } from 'cli'
type BotProps = {
  verbose?: Boolean
  headless?: Boolean
  gpu?: Boolean
  name?: string
  fakeMediaPath?: string
  windowSize?: { width: number; height: number }
}

/**
 * Main class for creating a bot.
 */
export class EtherealEngineBot {
  activeChannel
  headless: Boolean
  ci: Boolean
  verbose: Boolean
  name: string
  fakeMediaPath: string
  windowSize: {
    width: number
    height: number
  }
  browser: Browser
  page: Page
  pageUtils: PageUtils

  constructor(args: BotProps = {}) {
    this.verbose = args.verbose!
    this.headless = args.headless ?? true
    this.ci = typeof process.env.CI === 'string' && process.env.CI === 'true'
    this.name = args.name ?? 'Bot'
    this.fakeMediaPath = args.fakeMediaPath ?? ''
    this.windowSize = args.windowSize ?? { width: 640, height: 480 }

    // for (let method of Object.getOwnPropertyNames(InBrowserBot.prototype))
    // {
    //     if (method in this) continue;

    //     this[method] = (...args) => this.evaluate(InBrowserBot.prototype[method], ...args)
    // }

    // const channelState = chatState.get('channels');
    // const channels = channelState.get('channels');
    // const activeChannelMatch = [...channels].find(([, channel]) => channel.channelType === 'instance');
    // if (activeChannelMatch && activeChannelMatch.length > 0) {
    //     this.activeChannel = activeChannelMatch[1];
    // }
  }
  async clickAllButtons() {
    const trigger1 = await this.page.waitForSelector('[aria-label="Emote"]')
    if (trigger1) {
      await trigger1.click()
      await this.delay(5000)
      await trigger1.click()
    }
    const trigger2 = await this.page.waitForSelector('[aria-label="Friends"]')
    if (trigger2) {
      await trigger2.click()
      await this.delay(5000)
      await trigger2.click
    }
    const trigger3 = await this.page.waitForSelector('[aria-label="Profile"]')
    if (trigger3) {
      await trigger3.click()
      await this.delay(5000)
      await trigger3.click()
    }
    const trigger4 = await this.page.waitForSelector('#UserPoseTracking', { timeout: 5000 }).catch(() => null)
    if (trigger4) {
      await trigger4.click()
      await this.delay(2000)
    }
    const trigger5 = await this.page.waitForSelector('[aria-label="Enter FullScreen"]')
    if (trigger5) {
      await trigger5.click()
      await this.delay(5000)
    }
    const trigger6 = await this.page.waitForSelector('[aria-label="Exit FullScreen"]')
    if (trigger6) {
      await trigger6.click()
      await this.delay(5000)
    }
    const trigger7 = await this.page.waitForSelector('[aria-label="Microphone"]')
    if (trigger7) {
      await trigger7.click()
      await this.delay(1000)
    }
    const trigger8 = await this.page.waitForSelector('[aria-label="Camera"]')
    if (trigger8) {
      await trigger8.click()
      await this.delay(1000)
    }
    const trigger9 = await this.page.waitForSelector('[aria-label="Screenshare"]')
    if (trigger9) {
      await trigger9.click()
      await this.delay(1000)
    }
    const trigger10 = await this.page.waitForSelector('[aria-label="Share"]')
    if (trigger10) {
      await trigger10.click()
      await this.delay(1000)
      await this.pressKey('Escape')
    }
    const trigger11 = await this.page.waitForSelector('#openMessagesButton')
    if (trigger11) {
      await trigger11.click()
      console.log('Clicked the "openMessagesButton"')
      await this.delay(1000)
    }
  }
  async moveBot(direction, duration) {
    const validDirections = ['left', 'right', 'forward', 'backward', 'jump', 'up', 'down', 'arrowleft', 'arrowright']
    if (!validDirections.includes(direction)) {
      throw new error('Invalid direction')
    }
    switch (direction) {
      case 'left':
        await this.pressKey('A')
        await this.delay(1000)
        await this.releaseKey('A')
        break
      case 'right':
        await this.pressKey('D')
        await this.delay(1000)
        await this.releaseKey('D')
        break
      case 'forward':
        await this.pressKey('W')
        await this.delay(1000)
        await this.releaseKey('W')
        break
      case 'backward':
        await this.pressKey('S')
        await this.delay(1000)
        await this.releaseKey('S')
        break
      case 'jump':
        await this.pressKey('Space')
        await this.delay(1000)
        await this.releaseKey('Space')
        break
      case 'up':
        await this.pressKey('ArrowUp')
        await this.delay(1000)
        await this.releaseKey('ArrowUp')
        break
      case 'down':
        await this.pressKey('ArrowDown')
        await this.delay(1000)
        await this.releaseKey('ArrowDown')
        break
      case 'arrowleft':
        await this.pressKey('ArrowLeft')
        await this.delay(1000)
        await this.releaseKey('ArrowLeft')
        break
      case 'arrowright':
        await this.pressKey('ArrowRight')
        await this.delay(1000)
        await this.releaseKey('ArrowRight')
        break
    }
    await this.delay(duration)
  }
  async startAudio() {
    const clickmicrophone = await this.page.waitForSelector('[aria-label="Microphone"]')
    if (clickmicrophone) {
      await clickmicrophone.click()
      await this.delay(1000)
    }
  }
  async startVideo() {
    const clickcamera = await this.page.waitForSelector('[aria-label="Camera"]')
    if (clickcamera) {
      await clickcamera.click()
      await this.delay(1000)
    }
  }
  async clickEmoteButtonAndSelectEmote() {
    const emoteButton = await this.page.waitForSelector('[aria-label="Emote"]')
    if (emoteButton) {
      await emoteButton.click().catch(err => {
        console.error('Error clicking emoteButton:', err);
      })
      await this.delay(6000)

      const imgElement = await this.page.waitForSelector('button.MuiButtonBase-root-IIrwk.ispAN.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-root-gwFoGh.hLKZiD._menuItem_fba7b_146:nth-child(0)')
      if (imgElement) {
        imgElement.click()
        console.log('Button clicked successfully.', imgElement)
        await this.delay(5000)
      }
    }
  }
  async physics_triggers() {
    const menu = await this.page.waitForSelector('#menu')
    if (menu) {
      await menu.click()
      await this.delay(6000)
    }
    const savebutton = await this.page.waitForSelector('li[tabindex="-1"][role="menuitem"]')
    if (savebutton) {
      await savebutton.click()
      console.log("savebutton clicked")
      await this.delay(4000)
    }
    const submitbutton = await this.page.waitForSelector('button[type="submit"]')
    if (submitbutton){
      await submitbutton.click()
      console.log('submitbutton clicked')
      await this.delay(10000)
    }
  }

  async keyPress(key, numMilliSeconds: number) {
    console.log('Running with key ' + key)
    const interval = setInterval(() => {
      console.log('Pressing', key)
      this.pressKey(key)
    }, 100)
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        console.log('Clearing button press for ' + key, numMilliSeconds)
        this.releaseKey(key)
        clearInterval(interval)
        resolve()
      }, numMilliSeconds)
    )
  }

  async sendMessage(message: string) {
    console.log('send message: ' + message)
    await this.clickElementByClass('button', 'openChat')
    await this.pageUtils.clickSelectorId('input', 'newMessage')
    await this.typeMessage(message)
    await this.clickElementByClass('button', 'sendMessage')
  }

  async getInstanceMessages() {
    console.log('Getting messages from instance channel: ', this.activeChannel)
    return this.activeChannel && this.activeChannel.chatState
  }

  async sendAudio(duration: number) {
    console.log('Sending audio...')
    await this.pageUtils.clickSelectorId('button', 'UserAudio')
    await this.waitForTimeout(duration)
  }

  async stopAudio(bot) {
    console.log('Stop audio...')
    await this.pageUtils.clickSelectorId('button', 'UserAudio')
  }

  async recvAudio(duration: number) {
    console.log('Receiving audio...')
    await this.waitForSelector('[class*=PartyParticipantWindow]', duration)
  }

  async sendVideo(duration: number) {
    console.log('Sending video...')
    await this.pageUtils.clickSelectorId('button', 'UserVideo')
    await this.waitForTimeout(duration)
  }

  async stopVideo(bot) {
    console.log('Stop video...')
    await this.pageUtils.clickSelectorId('button', 'UserVideo')
  }

  async recvVideo(duration: number) {
    console.log('Receiving video...')
    await this.waitForSelector('[class*=PartyParticipantWindow]', duration)
  }

  async delay(timeout: number) {
    console.log(`Waiting for ${timeout} ms... `)
    await this.waitForTimeout(timeout)
  }

  async interactObject() {}

  /** Runs a function and takes a screenshot if it fails
   * @param {Function} fn Function to execut _in the node context._
   */
  async catchAndScreenShot(fn, path = 'botError.png') {
    try {
      await fn()
    } catch (e) {
      if (this.page) {
        console.warn('Caught error. Trying to screenshot')
        this.page.screenshot({ path })
      }
      throw e
    }
  }

  async addScript(path) {
    this.page.on('framenavigated', async (frame) => {
      if (frame !== this.page.mainFrame()) {
        return
      } else {
        const el = await this.page.addScriptTag({ path })
        console.log(el)
      }
    })
  }

  /**
   * Runs a funciton in the browser context
   * @param {Function} fn Function to evaluate in the browser context
   * @param args The arguments to be passed to fn. These will be serailized when passed through puppeteer
   */
  async evaluate(fn, ...args) {
    return await this.page.evaluate(fn, ...args)
  }

  async runHook(hook, ...args) {
    return await this.page.evaluate(
      async (hook, ...args) => {
        console.log('[XR-BOT]:', hook, ...args)
        if (!globalThis.botHooks) {
          return
        }
        return globalThis.botHooks[hook](...args)
      },
      hook,
      ...args
    )
  }

  async awaitPromise(fn, period = 100, ...args) {
    return await new Promise<any>((resolve) => {
      const interval = setInterval(async () => {
        const response = await this.page.evaluate(fn, ...args)
        if (response) {
          resolve(response)
          clearInterval(interval)
        }
      }, period)
    })
  }

  async awaitHookPromise(hook, period = 100, ...args) {
    console.log('[XR-BOT]: awaiting', hook, ...args)
    return await new Promise<any>((resolve) => {
      const interval = setInterval(async () => {
        const response = await this.page.evaluate(
          async (hook, ...args) => {
            if (!globalThis.botHooks) {
              return
            }
            return globalThis.botHooks[hook](...args)
          },
          hook,
          ...args
        )
        if (response) {
          resolve(response)
          clearInterval(interval)
        }
      }, period)
    })
  }
  /**
   * A main-program type wrapper. Runs a function and quits the bot with a
   * screenshot if the function throws an exception
   * @param {Function} fn Function to evaluate in the node context
   */
  exec(fn) {
    this.catchAndScreenShot(() => fn(this)).catch((e) => {
      console.error('Failed to run. Check botError.png if it exists. Error:', e)
      process.exit(-1)
    })
  }

  /**
   * Detect OS platform and set google chrome path.
   */
  detectOsOption() {
    const os = getOS()
    const options: any = {}
    let chromePath = ''
    switch (os) {
      case 'macOS':
        chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        break
      case 'Windows':
        chromePath = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
        break
      case 'Linux':
        chromePath = '/usr/bin/google-chrome'
        break
      default:
        break
    }

    if (chromePath) {
      if (fs.existsSync(chromePath)) {
        options.executablePath = chromePath
      } else {
        console.warn('Warning! Please install Google Chrome to make bot work correctly in headless mode.\n')
      }
    }
    return options
  }

  /** Launches the puppeteer browser instance. It is not necessary to call this
   *  directly in most cases. It will be done automatically when needed.
   */
  async launchBrowser() {
    const options = {
      // dumpio: this.verbose,
      headless: this.headless,
      devtools: !this.headless,
      ignoreHTTPSErrors: true,
      defaultViewport: this.windowSize,
      ignoreDefaultArgs: [],
      args: [
        this.headless ? '--headless' : '--enable-webgl',
        this.headless ? '--disable-gpu' : undefined,
        //this.headless ? '--disable-3d-apis':undefined,
        '--enable-features=NetworkService',
        '--ignore-certificate-errors',
        `--no-sandbox`,
        `--disable-dev-shm-usage`,
        '--shm-size=4gb',
        `--window-size=${this.windowSize.width},${this.windowSize.height}`,
        '--use-fake-ui-for-media-stream=1',
        '--use-fake-device-for-media-stream',
        '--disable-web-security=1',
        //'--no-first-run',
        '--allow-file-access=1',
        //'--mute-audio',
      ].filter(Boolean),
      ...this.detectOsOption()
    } as LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions

    this.browser = await puppeteer.launch(options)

    this.page = await this.browser.newPage()
    await this.page.setUserAgent(BotUserAgent)

    this.page.on('close', () => {
      console.log('[ETHEREAL BOT]: page closed')
      this.page = undefined!
    })

    if (this.verbose) {
      this.page.on('console', (consoleObj) => console.log(`>> [${this.name}]: ${consoleObj.text()}`))
      // console.log(consoleObj.type())
      // console.log(consoleObj.text())
      // Promise.all(consoleObj.args().map((val) => {
      //   val.jsonValue()
      // })).then((...args) => console.log(...args))
      // console.log(consoleObj.location())
      // })
    }

    this.pageUtils = new PageUtils(this)
  }

  async pressKey(keycode) {
    await this.page.keyboard.down(keycode)
  }

  async releaseKey(keycode) {
    await this.page.keyboard.up(keycode)
  }

  async navigate(url) {
    if (!this.browser) {
      throw Error('Cannot navigate without a browser!')
    }

    const parsedUrl = new URL(url)
    const context = this.browser.defaultBrowserContext()
    console.log('permission allow for ', parsedUrl.origin)
    context.overridePermissions(parsedUrl.origin, ['microphone', 'camera'])

    console.log('Going to ' + url)
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 1600 * 10000 })

    const granted = await this.page.evaluate(async () => {
      // @ts-ignore
      return (await navigator.permissions.query({ name: 'camera' })).state
    })
    console.log('Granted:', granted)
  }

  /** Enters the room specified, enabling the first microphone and speaker found
   * @param {string} roomUrl The url of the room to join
   * @param {Object} opts
   * @param {string} opts.name Name to set as the bot name when joining the room
   */
  async enterRoom(roomUrl) {
    await this.navigate(roomUrl)
    await this.page.waitForSelector('div[class*="instance-chat-container"]', { timeout: 100000 })

    if (this.headless) {
      // Disable rendering for headless, otherwise chromium uses a LOT of CPU
    }

    await this.page.mouse.click(0, 0)
    // await new Promise(resolve => {setTimeout(async() => {
    //     // await this.pu.clickSelectorClassRegex("button", /join_world/);
    //     setTimeout(async() => {
    //         // await this.page.waitForSelector('button.openChat');
    //         resolve();
    //     }, 30000)
    // }, 2000) });
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  /** Enters the room specified, enabling the first microphone and speaker found
   * @param {string} roomUrl The url of the room to join
   * @param {Object} opts
   * @param {string} opts.name Name to set as the bot name when joining the room
   */
  async enterLocation(roomUrl) {
    await this.navigate(roomUrl)
    await this.page.waitForFunction("document.querySelector('canvas')", { timeout: 1000000 })
    console.log('selected sucessfully')
    await this.page.mouse.click(0, 0)
    await this.setFocus('canvas')
    await this.pageUtils.clickSelectorId('canvas', 'engine-renderer-canvas')
  }

  async clickCanvas() {
    await this.page.mouse.click(0, 0)
    await this.setFocus('canvas')
    await this.pageUtils.clickSelectorId('canvas', 'engine-renderer-canvas')
  }

  /** Enters the editor scene specified
   * @param {string} sceneUrl The url of the scene to load
   */
  async enterEditor(sceneUrl, loginUrl) {
    await this.navigate(loginUrl)
    let userBtn = await this.page.waitForSelector('#show-user-id')
    await userBtn?.click()
    await this.page.waitForSelector('#user-id')
    const userId = await this.page.evaluate(() => document.querySelector('#user-id')!.getAttribute('value'))
    console.log(userId)
    //TODO: We should change this from making admin to registered user.
    await makeAdmin(userId)
    await this.navigate(sceneUrl)
    await this.delay(5000)
  }

  async waitForTimeout(timeout: number) {
    return await new Promise<void>((resolve) => setTimeout(() => resolve(), timeout))
  }

  async waitForSelector(selector, timeout: number) {
    return this.page.waitForSelector(selector, { timeout })
  }

  async clickElementByClass(elemType, classSelector) {
    await this.pageUtils.clickSelectorClassRegex(elemType || 'button', classSelector)
  }

  async clickElementById(id: string) {
    console.log('waiting for', id)
    await this.page.waitForFunction(`document.getElementById('${id}')`)
    console.log('clicking', id)
    await this.page.evaluate((id: string) => {
      const el = document.getElementById(id)
      console.log(`found element is ${el}`)
      // @ts-ignore
      el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      console.log(`dispatched mouse event`)
    }, id)
  }

  async typeMessage(message) {
    console.log('typing using keyboard')
    await this.page.keyboard.type(message)
  }

  async setFocus(selector) {
    await this.page.focus(selector)
  }

  async openUserInfo() {
    console.log('opening user info')
    const userInfoPath: any = 'div[class*="buttonsContainer"] > button.MuiIconButton-root:nth-of-type(1)'
    await this.pageUtils.clickSelectorFirstMatch(userInfoPath) // bcz user info is the first button, again must fall back to nth of type for the others, ids prefered
    await this.delay(1000)
  }

  async openSettings(settingsType: string) {
    const settingsButton: any = "div[class*='profileContainer'] > button"
    const settingsHeaderPath: any = "[id^=':r']> span > div > div > div"
    console.log('opening settings')
    await this.page.waitForSelector(settingsButton)
    await this.pageUtils.clickSelectorFirstMatch(settingsButton)
    const settingsContainer: any = await this.waitForSelector(settingsHeaderPath, 10000)
    await this.delay(1000)
    console.log('selectors ' + settingsContainer)
    // sadly hardcoded tried to scrape the text within button using xpath and eval but all return null
    let button
    switch (settingsType.toLowerCase()) {
      case 'general':
        button = await settingsContainer?.$('button:nth-child(1)')
        break
      case 'audio':
        button = await settingsContainer?.$('button:nth-child(2)')
        break
      case 'graphics':
        button = await settingsContainer?.$('button:nth-child(3)')
        break
      default:
        console.log('settings type not avaialble')
    }
    console.log('button ' + button)
    await button.click()
    await this.delay(1000)
  }

  async openAvatarSettings() {
    const avatarSettingsButton: any = "div[class*='profileContainer'] > div[class*='avatar'] > button"
    await this.page.waitForSelector(avatarSettingsButton)
    await this.pageUtils.clickSelectorFirstMatch(avatarSettingsButton)
  }

  async closeInterface() {
    // generic method for closing canvas based interfaces
    // add ids for everything else later
    console.log('closing interface')
    await this.delay(300)
    await this.pageUtils.clickSelectorFirstMatch(this.pageUtils.uiCanvas)
  }

  async simulateSlider(selector: string, value: number) {
    console.log('slider path is ' + selector)
    const sliderElement: any = await this.page.$(selector)
    const sliderBoundingBox = await sliderElement.boundingBox()
    const sliderHandle = await sliderElement!.evaluateHandle((el) => {
      const sliderHandle = el.querySelector('.MuiSlider-thumb') as HTMLElement
      return sliderHandle
    })
    const sliderWidth = sliderBoundingBox!.width
    const sliderMin = 0
    const sliderMax = 100
    value = Math.min(Math.max(value, sliderMin + 10), sliderMax - 10) // for some reason these are the visual min and max of slider, needs investigation
    const handlePosition = sliderBoundingBox!.x + sliderWidth * ((value - sliderMin) / (sliderMax - sliderMin))
    await sliderHandle.hover()
    await sliderHandle.click({ button: 'left' })
    await this.page.mouse.move(handlePosition, sliderBoundingBox!.y)
    await this.page.mouse.down()
    await this.page.mouse.up()
    await this.delay(200)
  }

  async updateUsername(name: string) {
    const usernameInputBox = "input[placeholder*='username' i][name = 'username'][type = 'text']"
    await this.openUserInfo()
    const inputbox = await this.page.waitForSelector(usernameInputBox)
    await inputbox!.click({ clickCount: 3 }) // Select all the text
    await inputbox!.press('Backspace')
    await inputbox!.type(name)
    await this.pressKey('Enter')
    await this.closeInterface()
  }

  async simulateCheckbox(selector: string, value: Boolean) {
    console.log('check box path is ' + selector)
    const checkbox: any = await this.page.$(selector)
    console.log('check box is ' + checkbox)
    const isCheckbox = await checkbox.evaluate(
      (element: HTMLElement) =>
        element.tagName.toLowerCase() === 'input' && (element as HTMLInputElement).type.toLowerCase() === 'checkbox'
    )
    if (!isCheckbox) {
      return
    }
    const isDisabled = await checkbox.evaluate((element: HTMLInputElement) => element.disabled)
    if (isDisabled) {
      return
    }
    const isChecked: Boolean = await checkbox.evaluate((element: HTMLInputElement) => element.checked)
    if (isChecked == value) {
      return
    }
    await checkbox.click()
    await this.delay(200)
  }

  async changeTheme(uiType: string, theme: string) {
    // uses lowercase string for now, will change to engine enums later
    // add ids for everything else later
    const uiTypeContainer: any = "div[class*='menuContent'] > div"
    const uiTypeId: any = '#mui-component-select-' + uiType
    const themeContainer: any = `#menu-${uiType}` + '> div > ul'

    await this.openUserInfo()
    await this.openSettings('General')

    console.log('changing theme')
    await this.delay(1000)
    // TODO: add guard conditions scrape for existing uis and themes and validate
    await this.waitForSelector(uiTypeContainer, 10000)
    await this.waitForSelector(uiTypeId, 10000)
    const selectTheme: any = await this.page.$(uiTypeId)
    await selectTheme.click()
    await this.waitForSelector(themeContainer + `>li[data-value=${theme}]`, 10000)
    const option: any = await this.page.$(themeContainer + `>li[data-value=${theme}]`)
    await option.click()
    await this.delay(1000)
    await this.closeInterface()
  }

  async setSpatialAudioVideo(value: Boolean) {
    const checkbox: any = "div[class*='menuContent'] > div > span > input[type='checkbox']"
    await this.openUserInfo()
    await this.openSettings('Audio')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
  }

  async changeVolume(audioType: string, value: number) {
    //if the relative ordering of the sliders in UI changes the code breaks will look at better options later
    //for any changes the map must change here , the beast way would be to bind the volume sliders to Ids and map function inputs to the IDs
    const audiotypemap: { [id: string]: string } = {
      music: '7',
      scene: '6',
      notification: '5',
      user: '4',
      microphone: '3',
      master: '2'
    }
    const audiotypes = []

    const slider: any =
      "div[class*='menuContent']" + `> div.MuiBox-root:nth-of-type(${audiotypemap[audioType.toLowerCase()]}) > span`
    await this.openUserInfo()
    await this.openSettings('Audio')
    await this.delay(1000)
    await this.simulateSlider(slider, value)
    await this.closeInterface()
  }

  async changeResolution(value: number) {
    const slider: any = "div[class*='menuContent'] > div > span"
    await this.openUserInfo()
    await this.openSettings('Graphics')
    await this.delay(1000)
    await this.simulateSlider(slider, value)
    await this.closeInterface()
  }

  // might be able to combine these functions worth checking later

  async setPostProcessing(value: Boolean) {
    const checkbox: any = "div[class*='menuContent'] > div > div:nth-of-type(1) > label > span > input[type='checkbox']"

    await this.openUserInfo()
    await this.openSettings('Graphics')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
  }

  async setShadows(value: Boolean) {
    const checkbox: any = "div[class*='menuContent'] > div > div:nth-of-type(2) > label > span > input[type='checkbox']"

    await this.openUserInfo()
    await this.openSettings('Graphics')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
  }

  async setAutomatic(value: Boolean) {
    const checkbox: any = "div[class*='menuContent'] > div > div:nth-of-type(3) > label > span > input[type='checkbox']"

    await this.openUserInfo()
    await this.openSettings('Graphics')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
  }
  // this is an idempotent funciton assuming avatas have unique names
  async selectAvatar(name: string) {
    const avatarSelector = `div[title = '${name}']`
    const confirmButton = `button[title = 'Confirm']`
    await this.openUserInfo()
    await this.openAvatarSettings()
    await this.page.waitForSelector(avatarSelector)
    await this.pageUtils.clickSelectorFirstMatch(avatarSelector)
    await this.pageUtils.clickSelectorFirstMatch(confirmButton)
    await this.delay(10000)
  }
  //returns a list of avatar names found from the query , can be upgraded to json object later
  async searchAvatar(query: string): Promise<string[]> {
    const avatarSearchbox = "input[placeholder*='Avatar'][type = 'text']"
    await this.openUserInfo()
    await this.openAvatarSettings()
    const inputbox = await this.page.waitForSelector(avatarSearchbox)
    await inputbox!.type(query)
    await this.delay(5000) //wait for the actual query to filter things out
    // extract the values of the "title" (avatar names) attributes into an array
    const avatarlist: string[] = (await this.page.$$eval('div[title]', (avatarElements) =>
      avatarElements.map((avatar) => avatar.getAttribute('title') as string)
    )) as string[]
    return avatarlist
  }

  async animateCharacter(animation) {
    const animWheelButtonPath: any = 'div[class*="buttonsContainer"] > button.MuiIconButton-root:nth-of-type(3)'
    await this.pageUtils.clickSelectorFirstMatch(animWheelButtonPath)
    await this.delay(3000)
    const animWheelPath: any = "div[class*='itemContainer']"
    const animWheelRightPath: any = "svg[data-testid*='Next']"
    const animWheelRightButton = await this.pageUtils.getParentElement(await this.page.$(animWheelRightPath))
    const animWheelTargetAnimPath: any = `img[alt*='${animation}' i]`
    let isDisabled = await animWheelRightButton.evaluate((element: HTMLInputElement) => element.disabled)
    while (!isDisabled) {
      const animImage = await this.page.$$(animWheelTargetAnimPath)
      if ((await animImage).length === 0) {
        await animWheelRightButton.click()
        isDisabled = await animWheelRightButton.evaluate((element: HTMLInputElement) => element.disabled)
        if (isDisabled) {
          console.log('ERR:animation not found')
          break
        }
        await this.delay(1000)
        continue
      }
      const animButton = await this.pageUtils.getParentElement(animImage[0])
      await animButton.click()
      break
    }

    await this.delay(5000)
    // closing not needed
    // all the anims have an alt name for thier icons we leverage that
    // input anim name and search in the wheel if doesnt exist we press the right wheel button to move the next page
    // continue till right wheel button is disabled
    // if not found return animation not avaialble notif
  }

  async takeScreenshot(storagePath = '../XREngine_Bot_screenshots') {
    const timestamp = new Date().toISOString().replace(/[:.-]/g, '_')
    const filename = `XRengine_Bot_screenshot_${timestamp}`
    const filepath = path.join(__dirname, storagePath)
    if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath)
    }
    console.warn(`Trying to screenshot and store at path ${filepath}/${filename}.png`)
    await this.page.screenshot({ path: `${filepath}/${filename}.png` })
  }
  /**
   * Leaves the room and closes the browser instance without exiting node
   */
  quit() {
    if (this.page) {
      this.page.close()
    }
    if (this.browser) {
      this.browser.close()
    }
  }
}
