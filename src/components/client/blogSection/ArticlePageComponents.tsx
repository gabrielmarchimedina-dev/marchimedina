"use client";

import { useLanguage } from "@/hooks/client/useLanguage";
import Link from "next/link";
import {
	articlePageStaticData,
	articlePageStaticEnglishData,
} from "../../../../app/(client)/blog/[id]/article.data";

export function ArticleBackLink() {
	const { language } = useLanguage();
	const data =
		language === "en"
			? articlePageStaticEnglishData
			: articlePageStaticData;

	return (
		<div className="mb-4 text-sm text-textSecondary">
			<Link href="/blog" className="hover:text-gold transition-colors">
				← {data.back}
			</Link>
		</div>
	);
}

export function ArticleLabel() {
	const { language } = useLanguage();
	const data =
		language === "en"
			? articlePageStaticEnglishData
			: articlePageStaticData;

	return (
		<p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
			{data.article}
		</p>
	);
}

export function ArticleAuthorsLabel({ count }: { count: number }) {
	const { language } = useLanguage();
	const data =
		language === "en"
			? articlePageStaticEnglishData
			: articlePageStaticData;

	return (
		<h3 className="text-lg font-semibold text-gold mb-6">
			{count === 1 ? data.author : data.authors}
		</h3>
	);
}
