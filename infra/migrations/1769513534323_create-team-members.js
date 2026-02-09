exports.up = (pgm) => {
	pgm.createTable("team_members", {
		id: {
			type: "uuid",
			primaryKey: true,
			default: pgm.func("gen_random_uuid()"),
		},
		name: {
			type: "varchar(255)",
			notNull: true,
		},
		email: {
			type: "varchar(254)",
			unique: true,
		},
		oab_number: {
			type: "varchar(100)",
			unique: true,
		},
		education: {
			type: "text",
		},
		lattes_url: {
			type: "varchar(2048)",
		},
		bio: {
			type: "text",
		},
		languages: {
			type: "varchar(255)[]",
		},
		image_url: {
			type: "varchar(2048)",
			notNull: true,
		},
		role: {
			type: "varchar(100)",
			notNull: true,
		},
		instagram: {
			type: "varchar(255)",
		},
		linkedin: {
			type: "varchar(512)",
		},
		active: {
			type: "boolean",
			notNull: true,
			default: true,
		},
		created_at: {
			type: "timestamptz",
			notNull: true,
			default: pgm.func("timezone('utc', now())"),
		},
		updated_at: {
			type: "timestamptz",
			notNull: true,
			default: pgm.func("timezone('utc', now())"),
		},
	});
};

exports.down = (pgm) => false;
