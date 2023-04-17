import express from "express"
import { BotAction } from "./bot/bot-action"
import {BotManager} from './bot/bot-manager'

const app = express()
const botManager = new BotManager()
app.use(express.json())

app.get('/', (req, res) => {
  try {
  return res.json({status:"ee-bot api is working"})
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

app.get('/bots', (req, res) => {
  try {
    res.json(botManager.bots)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

app.get('/bots/:id', (req,res) => {
  try {
    const id:string  = req.params.id
    const bot = botManager.findBotById(id)
    res.json(bot)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

app.get('/bots/actions', (req,res) => {
  try {
    const actions = botManager.getActions()
    return res.json(actions) 
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

app.put('/bots/:id/create', (req, res) => {
  try {
    const id:string  = req.params.id
    const name:string = req.body.name
    const options = req.body.options
    const bot = botManager.addBot(id, name , options)
    res.json(bot)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

app.post('/bots/:id/actions/add', (req, res) => {
  try {
  const id:string  = req.params.id
  const action:BotAction = req.body.action
  botManager.addAction(id,action)
  res.sendStatus(200)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

app.post('/bots/run', async (req, res) => {
  try {
    await botManager.run()
    res.sendStatus(200)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.delete('/bots/:id/delete', async (req, res) => {
  try {
    const id:string  = req.params.id
    const bot = botManager.removeBot(id)
    res.sendStatus(200)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

app.delete('/bots/clear', async (req, res) => {
  try {
  await botManager.clear()
  res.sendStatus(200)
  }
  catch (error) {
    res.status(500).send(error.message)
  }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})