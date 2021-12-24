import * as discord from 'discord.js'
import { Bot } from '../class/bot'

export const aliases = ['p', 'pg']

export const ping = async (bot: Bot, message: discord.Message) => {
    message.channel.send('pong')
}
