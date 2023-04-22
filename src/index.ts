import Koa from 'koa';
import Router from "koa-router"
import bodyParser from "koa-bodyparser"
import { BotAction } from './bot/bot-action';
import { BotManager } from './bot/bot-manager';

const app = new Koa();
const router = new Router();
const botManager = new BotManager();

app.use(bodyParser());

router.get('/', (ctx) => {
  ctx.body = { status: 'ee-bot api is working' };
});

router.get('/bots', (ctx) => {
  ctx.body = botManager.bots;
});

router.get('/bots/:id', (ctx) => {
  const id = ctx.params.id;
  const bot = botManager.findBotById(id);
  ctx.body = bot;
});

router.get('/bots/actions', (ctx) => {
  const actions = botManager.getActions();
  ctx.body = actions;
});

router.put('/bots/:id/create', (ctx) => {
  const id = ctx.params.id;
  const body:any = ctx.request.body
  const name = body.name;
  const options = body.options;
  const bot = botManager.addBot(id, name, options);
  ctx.body = bot;
});

router.post('/bots/:id/actions/add', (ctx) => {
  const id = ctx.params.id;
  const body:any = ctx.request.body
  const action: BotAction = body.action;
  botManager.addAction(id, action);
  ctx.status = 200;
});

router.post('/bots/run', async (ctx) => {
  await botManager.run();
  ctx.status = 200;
});

router.delete('/bots/:id/delete', async (ctx) => {
  const id = ctx.params.id;
  const bot = botManager.removeBot(id);
  ctx.status = 200;
});

router.delete('/bots/clear', async (ctx) => {
  await botManager.clear();
  ctx.status = 200;
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Koa Server listening on port ${PORT}`);
});
