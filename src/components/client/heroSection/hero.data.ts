export const heroData = {
	title: "Excelência Jurídica para Guiar Suas Decisões",
	subtitle:
		"Assistência jurídica completa com foco em segurança e transparência.",
	typingSpeed: 50,
	subtitleSpeed: 30,
	delayBetweenTexts: 300,

	get totalDelay() {
		return this.title.length * this.typingSpeed + this.delayBetweenTexts;
	},
} as const;

export const heroEnglishData = {
	title: "Juridic Excellence to Guide Your Decisions",
	subtitle:
		"Complete Juridic Assistance with a Focus on Security and Transparency.",
	typingSpeed: 50,
	subtitleSpeed: 30,
	delayBetweenTexts: 300,

	get totalDelay() {
		return this.title.length * this.typingSpeed + this.delayBetweenTexts;
	},
} as const;
