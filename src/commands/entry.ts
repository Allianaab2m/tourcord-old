import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import { Team } from '../lib/team';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'トーナメントにエントリーします。\n`tc!entry [チーム名]`',
	preconditions: ['inGuild']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const waitMessage = await message.reply('エントリー処理を行っています。');
		const teamName = await args.pick('string').catch(() => undefined);
		if (!teamName) return await waitMessage.edit('チーム名を指定してください。');
		if (message.guild === null) return;

		const createdTeam = await Team.init(teamName, message.guild);
		await message.member?.roles.add(createdTeam.role);
		createdTeam.teamMembersId.push(message.author.id);
		// TODO: SQLite3に保存する
		return await message.reply(
			`チーム名: ${createdTeam.teamName}
            チームID: ${createdTeam.teamId}
            テキストチャンネルID: ${createdTeam.textChannel.id}
            ボイスチャンネルID: ${createdTeam.voiceChannel.id}
            ロールID: ${createdTeam.role.id}
            チームメンバー: ${createdTeam.teamMembersId.join(', ')}`
		);
	}
}
