import * as discord from 'discord.js'
import * as dotenv from 'dotenv'
import { Bot } from './class/bot'

dotenv.config()

const prefix = '!'

const bot = new Bot({
    intents: 32767
})

bot.login(process.env.TOKEN)

bot.on('ready', async () => {
    console.log('Bot起動中')
    if (bot.user) {
        console.log(bot.user.tag + 'としてログイン中')
    }
    bot.cogs.init()
})

bot.on('messageCreate', async (message: discord.Message) => {
    const [command, ...args] = message.content.slice(prefix.length).split(' ')
    bot.handler(command, bot, message, args)
})
