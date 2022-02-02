import type { TextChannel, VoiceChannel, CategoryChannel, Role, Guild } from 'discord.js';

export class Team {
	constructor(
		public teamName: string,
		public teamId: string,
		public role: Role,
		public categoryChannel: CategoryChannel,
		public textChannel: TextChannel,
		public voiceChannel: VoiceChannel,
		public teamMembersId: string[]
	) {}

	static async init(teamName: string, guild: Guild) {
		const role = await guild.roles.create({
			name: teamName
		});
		const categoryChannel = await guild.channels.create(teamName, {
			type: 'GUILD_CATEGORY',
			permissionOverwrites: [
				{
					id: role.id,
					allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'CONNECT', 'SPEAK']
				},
				{
					id: guild.roles.everyone,
					deny: ['VIEW_CHANNEL']
				}
			]
		});

		const textChannel = await categoryChannel.createChannel(teamName + '-text');
		const voiceChannel = await categoryChannel.createChannel(teamName + '-voice', {
			type: 'GUILD_VOICE'
		});

		const team = new Team(teamName, role.id, role, categoryChannel, textChannel, voiceChannel, []);

		return team;
	}
}
