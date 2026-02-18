"use client";

import { useLanguage } from "@/hooks/client/useLanguage";
import {
	blogPageStaticData,
	blogPageStaticEnglishData,
} from "../../../../app/[lang]/blog/blog.data";

export default function BlogPageHeader() {
	const { language } = useLanguage();
	const data =
		language === "en" ? blogPageStaticEnglishData : blogPageStaticData;

	return (
		<header className="mb-10 text-center md:mb-14">
			<p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
				{data.label}
			</p>

			<h1 className="text-3xl md:text-4xl font-semibold text-gold mb-4">
				{data.title}
			</h1>

			<p className="text-sm md:text-base text-textSecondary max-w-3xl mx-auto">
				{data.description}
			</p>
		</header>
	);
}

export function BlogPageEmpty() {
	const { language } = useLanguage();
	const data =
		language === "en" ? blogPageStaticEnglishData : blogPageStaticData;

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-textSecondary">
			{data.noArticleMessage}
		</div>
	);
}
