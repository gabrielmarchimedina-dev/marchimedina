"use client";

import { useEffect } from "react";

export function SetHtmlLang({ lang }: { lang: string }) {
	useEffect(() => {
		document.documentElement.lang = lang === "en" ? "en-US" : "pt-BR";
	}, [lang]);

	return null;
}
