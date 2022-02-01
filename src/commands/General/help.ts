import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { Message, MessageEmbed } from 'discord.js';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'コマンドの使用方法を表示します。\n`tc!help [コマンド名]`',
	aliases: ['help', 'h']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const { client } = this.container;
		const commandName = await args.pick('string');
		const command = client.stores.get('commands').filter((c) => c.name === commandName);
		const commandDescription = command.get(commandName)?.description;
		if (commandDescription === undefined) {
			return;
		} else {
			const embed = new MessageEmbed();
			embed.setTitle(`${commandName}コマンドの使用方法`);
			embed.setDescription(commandDescription);
			embed.setColor('#00ff00');
			embed.setURL(`https://github.com/Allianaab2m/tourcord/wiki/${commandName}`);
			embed.setFooter('詳しい説明は青い部分をクリックしてください。(外部サイトが開きます)');
			return message.reply({ embeds: [embed] });
		}
	}
}
