import fs from 'fs'
import { P } from 'pino'
import { Input } from 'postcss'
import puppeteer, { Browser, BrowserConnectOptions, BrowserLaunchArgumentOptions, LaunchOptions, Page } from 'puppeteer'
import { URL } from 'url'

import { BotUserAgent } from '@xrengine/common/src/constants/BotUserAgent'

import { getOS } from './utils/getOS'
import { makeAdmin } from './utils/make-user-admin'

class PageUtils {
  bot: XREngineBot
  uiCanvas: string
  constructor(bot) {
    this.bot = bot
    this.uiCanvas = 'body > div.MuiDialog-root.MuiModal-root > div.MuiDialog-container.MuiDialog-scrollPaper'
  }
  async clickSelectorClassRegex(selector, classRegex) {
    if (this.bot.verbose) console.log(`Clicking for a ${selector} matching ${classRegex}`)

    await this.bot.page.evaluate(
      (selector, classRegex) => {
        classRegex = new RegExp(classRegex)
        const buttons = Array.from(document.querySelectorAll(selector))
        const enterButton = buttons.find((button) => Array.from(button.classList).some((c) => classRegex.test(c)))
        if (enterButton) enterButton.click()
      },
      selector,
      classRegex.toString().slice(1, -1)
    )
  }
  async clickSelectorId<K extends keyof HTMLElementTagNameMap>(selector: K, id: string) {
    if (this.bot.verbose) console.log(`Clicking for a ${selector} matching ${id}`)

    await this.bot.page.waitForFunction(`document.getElementById('${id}')`)

    await this.bot.page.evaluate(
      (selector: K, id: string) => {
        const matches = Array.from(document.querySelectorAll(selector))

        const singleMatch = matches.find((button) => button.id === id)
        let result
        if (singleMatch && singleMatch.click) {
          console.log('normal click')
          result = singleMatch.click()
        }
        if (singleMatch && !singleMatch.click) {
          console.log('on click')
          result = singleMatch.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }
        if (!singleMatch) {
          console.log('event click', matches.length)
          const m = matches[0]
          result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        }
      },
      selector,
      id
    )
  }
  async clickSelectorFirstMatch(selector) {
    if (this.bot.verbose) console.log(`Clicking for first ${selector}`)

    await this.bot.page.evaluate((selector) => {
      const matches = Array.from(document.querySelectorAll(selector))
      const singleMatch = matches[0]
      if (singleMatch) singleMatch.click()
    }, selector)
  }
}

type BotProps = {
  verbose?: boolean
  headless?: boolean
  gpu?: boolean
  name?: string
  fakeMediaPath?: string
  windowSize?: { width: number; height: number }
}

/**
 * Main class for creating a bot.
 */
export class XREngineBot {
  activeChannel
  headless: boolean
  ci: boolean
  verbose: boolean
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
    console.log('headless', this.headless)
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
      ignoreDefaultArgs: ['--mute-audio'],
      args: [
        this.headless ? '--headless' : '--enable-webgl',
        '--enable-features=NetworkService',
        '--ignore-certificate-errors',
        `--no-sandbox`,
        `--disable-dev-shm-usage`,
        '--shm-size=4gb',
        `--window-size=${this.windowSize.width},${this.windowSize.height}`,
        '--use-fake-ui-for-media-stream=1',
        '--use-fake-device-for-media-stream=1',
        '--disable-web-security=1',
        //'--no-first-run',
        '--allow-file-access=1',
        '--mute-audio'
      ],
      ...this.detectOsOption()
    } as LaunchOptions & BrowserLaunchArgumentOptions & BrowserConnectOptions

    this.browser = await puppeteer.launch(options)

    this.page = await this.browser.newPage()
    await this.page.setUserAgent(BotUserAgent)

    this.page.on('close', () => {
      console.log('[XRENGINE BOT]: page closed')
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
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60 * 1000 })

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
    // await new Promise(resolve => {setTimeout(async() => {
    //     // await this.pu.clickSelectorClassRegex("button", /join_world/);
    //     setTimeout(async() => {
    //         // await this.page.waitForSelector('button.openChat');
    //         resolve();
    //     }, 30000)
    // }, 2000) });
  }

  /** Enters the editor scene specified
   * @param {string} sceneUrl The url of the scene to load
   */
  async enterEditor(sceneUrl, loginUrl) {
    await this.navigate(loginUrl)
    await this.page.waitForFunction("document.querySelector('#show-id-btn')", { timeout: 1000000 })
    await this.pageUtils.clickSelectorId('h2', 'show-id-btn')
    await this.page.waitForFunction("document.querySelector('#user-id')", { timeout: 1000000 })
    const userId = await new Promise((resolve) => {
      const interval = setInterval(async () => {
        const id = await this.page.evaluate(() => document.querySelector('#user-id')!.getAttribute('value'))
        if (id !== '') {
          clearInterval(interval)
          resolve(id)
        }
      }, 100)
    })
    console.log(userId)
    //TODO: We should change this from making admin to registered user.
    await makeAdmin(userId)
    await this.navigate(sceneUrl)
    await this.page.mouse.click(0, 0)
    await this.page.waitForFunction("document.querySelector('canvas')", { timeout: 1000000 })
    console.log('selected sucessfully')
    await this.page.mouse.click(0, 0)
    await this.setFocus('canvas')
    await this.pageUtils.clickSelectorId('canvas', 'viewport-canvas')
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
    let userInfoPath: any = '#engine-container > section > div > button.MuiButtonBase-root.MuiIconButton-root'
    await this.pageUtils.clickSelectorFirstMatch(userInfoPath) // bcz user info is the first button, again must fall back to nth of type for the others, ids prefered
    await this.delay(1000)
  }

  async Opensettings(settingsType: string) {
    let settingsButton: any = this.pageUtils.uiCanvas + '> div > div > div > div.MuiBox-root > button'
    let settingsHeaderPath: any = "[id^=':r'] > div > div > div"
    console.log('opening settings')
    await this.page.waitForSelector(settingsButton)
    await this.pageUtils.clickSelectorFirstMatch(settingsButton)
    const settingsContainer: any = await this.waitForSelector(settingsHeaderPath, 10000)
    await this.delay(1000)
    console.log('selectors ' + settingsContainer)
    // sadly hardcoded tried to scrape the text within button using xpath and eval but all return null
    var button
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

  async closeInterface() {
    // generic method for closing canvas based interfaces
    // add ids for everything else later
    console.log('closing interface')
    await this.delay(300)
    await this.pageUtils.clickSelectorFirstMatch(this.pageUtils.uiCanvas)
  }

  async simulateSlider(selector: string, value: number) {
    console.log('slider path is ' + selector)
    var sliderElement: any = await this.page.$(selector)
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

  async simulateCheckbox(selector: string, value: boolean) {
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
    const isChecked: boolean = await checkbox.evaluate((element: HTMLInputElement) => element.checked)
    if (isChecked == value) {
      return
    }
    await checkbox.click()
    await this.delay(200)
  }

  async changeTheme(uiType: string, theme: string) {
    // uses lowercase string for now, will change to engine enums later
    // add ids for everything else later
    let uiTypeContainer: any = this.pageUtils.uiCanvas + '> div > div > div > div'
    let uiTypeId: any = '#mui-component-select-' + uiType
    let themeContainer: any =
      `#menu-${uiType}` +
      '> div.MuiPaper-root.MuiPaper-rounded.MuiPaper-root.MuiMenu-paper.MuiPaper-rounded.MuiPopover-paper > ul'

    await this.openUserInfo()
    await this.Opensettings('General')

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

  async setSpatialAudioVideo(value: boolean) {
    let checkbox: any =
      this.pageUtils.uiCanvas +
      "> div > div > div > div > span.MuiButtonBase-root.MuiCheckbox-root > input[type='checkbox']"
    await this.openUserInfo()
    await this.Opensettings('Audio')
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

    let slider: any =
      this.pageUtils.uiCanvas +
      '> div > div > div > ' +
      `div.MuiBox-root:nth-of-type(${audiotypemap[audioType.toLowerCase()]})` +
      '> span'
    await this.openUserInfo()
    await this.Opensettings('Audio')
    await this.delay(1000)
    await this.simulateSlider(slider, value)
    await this.closeInterface()
  }

  async changeResolution(value: number) {
    let slider: any = this.pageUtils.uiCanvas + '> div > div > div > div.MuiBox-root > span'
    await this.openUserInfo()
    await this.Opensettings('Graphics')
    await this.delay(1000)
    await this.simulateSlider(slider, value)
    await this.closeInterface()
  }

  // might be able to combine these functions worth checking later
  async setAutomatic(value: boolean) {
    let checkbox: any =
      this.pageUtils.uiCanvas +
      "> div > div > div > div.MuiGrid-root.MuiGrid-container > div.MuiGrid-root.MuiGrid-item:nth-of-type(3) > label > span.MuiButtonBase-root.MuiCheckbox-root.PrivateSwitchBase-root.MuiCheckbox-root > input[type='checkbox']"

    await this.openUserInfo()
    await this.Opensettings('Graphics')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
  }

  async setPostProcessing(value: boolean) {
    let checkbox: any =
      this.pageUtils.uiCanvas +
      "> div > div > div > div.MuiGrid-root.MuiGrid-container > div.MuiGrid-root.MuiGrid-item:nth-of-type(1) > label > span.MuiButtonBase-root.MuiCheckbox-root.PrivateSwitchBase-root.MuiCheckbox-root > input[type='checkbox']"

    await this.openUserInfo()
    await this.Opensettings('Graphics')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
  }

  async setShadows(value: boolean) {
    let checkbox: any =
      this.pageUtils.uiCanvas +
      "> div > div > div > div.MuiGrid-root.MuiGrid-container > div.MuiGrid-root.MuiGrid-item:nth-of-type(2) > label > span.MuiButtonBase-root.MuiCheckbox-root.PrivateSwitchBase-root.MuiCheckbox-root > input[type='checkbox']"

    await this.openUserInfo()
    await this.Opensettings('Graphics')
    await this.delay(1000)
    await this.simulateCheckbox(checkbox, value)
    await this.closeInterface()
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
