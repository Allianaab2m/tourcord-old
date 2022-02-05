import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { SubCommandPluginCommand, SubCommandPluginCommandOptions } from '@sapphire/plugin-subcommands';
import { Message, MessageEmbed } from 'discord.js';
import { parseUserId, prismaGuildConfRead, prismaTeamRead, prismaTeamMemberUpdate } from '../lib/utils';

@ApplyOptions<SubCommandPluginCommandOptions>({
	description: 'チームに参加します。DMかつ返信の形式で実行されます。\n`tc!join [チームID]`',
	preconditions: ['inDirectMessage']
})
export class UserCommand extends SubCommandPluginCommand {
	public async messageRun(message: Message, args: Args) {
		const teamId = await args.pick('string');
		if (message.type !== 'REPLY') {
			return message.reply('招待メッセージに返信で実行してください。');
		}
		// GuildId取得
		const replyMessage = await message.fetchReference();
		const guildId = replyMessage.embeds[0].footer?.text.substring(5);
		if (!guildId) return;

		//招待されたチーム取得
		const inviteTeam = await prismaTeamRead(guildId, teamId);
		if (!inviteTeam) {
			const errEmbed = new MessageEmbed().setColor('#ff0000').setTitle('エラー').setDescription('チームが見つかりませんでした。');
			return message.reply({ embeds: [errEmbed] });
		} else if (inviteTeam.teamId !== teamId) {
			const errEmbed = new MessageEmbed().setColor('#ff0000').setTitle('エラー').setDescription('チームIDが違います。');
			return message.reply({ embeds: [errEmbed] });
		}

		const inviteGuild = await message.client.guilds.fetch(guildId);
		const inviteGuildConf = await prismaGuildConfRead(guildId);
		if (!inviteGuildConf) {
			const errEmbed = new MessageEmbed().setColor('#ff0000').setTitle('エラー').setDescription('トーナメントが開催されていないようです。');
			return message.reply({ embeds: [errEmbed] });
		}

		// チームメンバーに追加
		const teamUserArray = parseUserId(message.client, inviteTeam.teamMembersId);
		teamUserArray.push(message.author);
		await prismaTeamMemberUpdate(inviteTeam.teamId, teamUserArray);

		inviteGuild.members.cache.get(message.author.id)?.roles.add([inviteTeam.roleId, inviteGuildConf.memberRoleId]);
		const inviteGuildTextChannel = inviteGuild.channels.cache.get(inviteTeam.textChannelId);
		if (inviteGuildTextChannel?.isText()) {
			const joinEmbed = new MessageEmbed().setColor('#00ff00').setTitle(`${message.author.tag}さんがチームに参加しました。`);
			return inviteGuildTextChannel.send({ embeds: [joinEmbed] });
		} else {
			const partialErrorEmbed = new MessageEmbed()
				.setColor('#00ff00')
				.setTitle('チームへ参加しました。')
				.setDescription(
					'部分的に処理が失敗しています。チーム専用チャンネルにアクセスできるか確認してください。\nもし，チーム専用チャンネルが表示されない場合は大会運営に問い合わせてください。'
				);
			return message.reply({ embeds: [partialErrorEmbed] });
		}
	}
}
