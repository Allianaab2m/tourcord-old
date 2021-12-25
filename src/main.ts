import * as discord from 'discord.js'
import * as dotenv from 'dotenv'
import { Bot } from './class/bot'

dotenv.config()

const bot = new Bot({
    admin: 'tc!',
    member: 'tc/'
},{
    intents: 32767
})

bot.login(process.env.TOKEN)

bot.on('ready', async () => {
    console.log('Bot起動中')
    if (bot.user) {
        console.log(bot.user.tag + 'としてログイン中')
    }
    bot.adminCogs.init()
    bot.memberCogs.init()
})

bot.on('messageCreate', async (message: discord.Message) => {
    bot.handler(bot, message)
})
