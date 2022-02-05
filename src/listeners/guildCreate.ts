import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';
import { prismaGuildConfCreate } from '../lib/utils';

@ApplyOptions<ListenerOptions>({
	event: 'guildCreate'
})
export class UserEvent extends Listener {
	public async run(guild: Guild) {
		await prismaGuildConfCreate(guild.id, {
			guildId: guild.id,
			init: false,
			maxEntryTeams: 64,
			maxTeamMembers: 5,
			memberRoleId: '',
			adminRoleId: ''
		});
	}
}
