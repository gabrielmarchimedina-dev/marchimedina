export type TeamMemberInput = {
	name: string;
	email?: string;
	oab_number?: string;
	education?: string;
	lattes_url?: string;
	bio?: string;
	languages?: string[];
	image_url: string;
	role: string;
	instagram?: string;
	linkedin?: string;
	active?: boolean;
};

export type TeamMemberUpdateInput = {
	name?: string;
	email?: string;
	oab_number?: string;
	education?: string;
	lattes_url?: string;
	bio?: string;
	languages?: string[];
	image_url?: string;
	role?: string;
	instagram?: string;
	linkedin?: string;
	active?: boolean;
};

export type TeamMemberRecord = {
	id: string;
	name: string;
	email?: string;
	oab_number?: string;
	education?: string;
	lattes_url?: string;
	bio?: string;
	languages?: string[];
	image_url: string;
	role: string;
	instagram?: string;
	linkedin?: string;
	active: boolean;
	created_at: Date;
	updated_at: Date;
};

export type TestTeamMemberInput = {
	name?: string;
	email?: string;
	oab_number?: string;
	education?: string;
	lattes_url?: string;
	bio?: string;
	languages?: string[];
	image_url?: string;
	role?: string;
	instagram?: string;
	linkedin?: string;
	active?: boolean;
};
