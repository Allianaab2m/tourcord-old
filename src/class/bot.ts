import * as discord from 'discord.js'
import * as fs from 'fs/promises'

class Cogs {
    commands: { [key: string]: Function } = {}
    aliases: { [key: string]: string } = {}

    async init () {
        const commands = await fs.readdir('src/commands')
        commands.forEach(async (command) => {
            const commandName = command.split('.')[0]
            const commandFile = await import(`../commands/${command}`)
            this.commands[commandName] = commandFile[commandName]
            if (commandFile.aliases) {
                commandFile.aliases.forEach((alias: string) => {
                    this.aliases[alias] = commandName
                })
            }
            console.log(`Cog読み込み完了: ${commandName}`)
        })
    }
}

export class Bot extends discord.Client {
    public cogs
    public constructor (options: discord.ClientOptions) {
        super(options)
        this.cogs = new Cogs()
    }

    public handler(commandName: string, bot: Bot, message: discord.Message, args?: string[]) {
        if (message.author.bot) return
        if (commandName in this.cogs.commands) {
            return this.cogs.commands[commandName](bot, message, args)
        } else if (commandName in this.cogs.aliases) {
            return this.cogs.commands[this.cogs.aliases[commandName]](bot, message, args)
        } else {
            message.channel.send(`${commandName}コマンドは存在しません`)
        }
    }
}
