import { EtherealEngineBot } from ".."

export class PageUtils {
    bot: EtherealEngineBot
    uiCanvas: string
    constructor(bot) {
      this.bot = bot
      this.uiCanvas = 'body > div.MuiDialog-root.MuiModal-root > div.MuiDialog-container.MuiDialog-scrollPaper'
    }
    async clickButton(buttonName: string) {
      await this.bot.page.evaluate((selector) => { const v:any = document.querySelector(selector)
    if (v != undefined && v != null)
        v.click()
    }, buttonName)
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
        (selector: any, id: string) => {
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
    
    async clickSelectorByAlt(selector, title) {
      if (this.bot.verbose) console.log(`Clicking for a ${selector} matching ${title}`)

      await this.bot.page.evaluate((selector, title) => {
          let matches = Array.from(document.querySelectorAll(selector))
          let singleMatch = matches.find((btn) => btn.alt === title)
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
           if (matches.length > 0) {
                const m = matches[0]
                result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            }
          }
      }, selector, title)
  }

    async getParentElement(elementHandle) {
      const parentElementHandle: any = await this.bot.page.evaluateHandle((element) => {
        return element.parentElement
      }, elementHandle)
      return parentElementHandle.asElement()
    }

    
  }