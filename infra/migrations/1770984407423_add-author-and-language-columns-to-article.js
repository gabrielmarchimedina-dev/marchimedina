exports.up = (pgm) => {
	pgm.addColumns("article", {
		authors: {
			type: "uuid[]",
		},
		language: {
			type: "varchar(20)",
			notNull: true,
			default: "portugues",
			check: "language IN ('portugues', 'ingles', 'frances')",
		},
	});
};

exports.down = false;
