import * as discord from 'discord.js'
import * as dotenv from 'dotenv'

dotenv.config()

const client = new discord.Client({
    intents: 32767
})

client.on('ready', () => {
    console.log('Bot準備完了 - Tourcord')
})

client.login(process.env.DISCORD_TOKEN)