exports.up = (pgm) => {
	pgm.createTable("article_history", {
		id: {
			type: "uuid",
			primaryKey: true,
			default: pgm.func("gen_random_uuid()"),
		},
		article_id: {
			type: "uuid",
			notNull: true,
			references: "article",
			onDelete: "CASCADE",
		},
		field: {
			type: "varchar(255)",
			notNull: true,
		},
		old_value: {
			type: "text",
		},
		new_value: {
			type: "text",
		},
		edited_by: {
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
