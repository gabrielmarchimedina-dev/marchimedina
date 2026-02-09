exports.up = (pgm) => {
	pgm.createTable("article", {
		id: {
			type: "uuid",
			primaryKey: true,
			default: pgm.func("gen_random_uuid()"),
		},
		title: {
			type: "varchar(255)",
			notNull: true,
		},
		subtitle: {
			type: "varchar(255)",
			notNull: true,
		},
		thumbnail: {
			type: "varchar(2048)",
			notNull: true,
		},
		text: {
			type: "text",
			notNull: true,
		},
		view_count: {
			type: "integer",
			notNull: true,
			default: 0,
		},
		active: {
			type: "boolean",
			notNull: true,
			default: true,
		},
		created_by: {
			type: "uuid",
			references: "users",
			onDelete: "SET NULL",
		},
		updated_by: {
			type: "uuid",
			references: "users",
			onDelete: "SET NULL",
		},
		deleted_by: {
			type: "uuid",
			references: "users",
			onDelete: "SET NULL",
		},
		deleted_at: {
			type: "timestamptz",
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
