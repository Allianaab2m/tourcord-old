import * as discord from 'discord.js'
import { Bot } from '../class/bot'

export const returnArg = async (bot: Bot, message: discord.Message, args: string[]) => {
    if (args.length === 0) {
        message.channel.send({
            embeds: [
                bot.utils.createEmbedObject('error', {
                    description: '引数が足りません'
                })
            ]
        })
        return
    }
    message.channel.send(args.join(' '))
}
