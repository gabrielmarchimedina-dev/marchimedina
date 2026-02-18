"use client";

import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types/blog/article.type";
import { createArticleSlug } from "@/lib/client/articleSlug";
import { useLanguage } from "@/hooks/client/useLanguage";
import { blogCardStaticData, blogCardStaticEnglishData } from "./blogCard.data";

type BlogCardProps = {
	post: Article;
	index: number;
	isVisible: boolean;
};

function buildExcerpt(post: Article) {
	if (post.subtitle && post.subtitle.trim()) {
		return post.subtitle;
	}

	const text = post.text?.trim() ?? "";
	if (!text) {
		return "";
	}

	return text.length > 140 ? `${text.slice(0, 140)}...` : text;
}

export default function BlogCard({ post, index, isVisible }: BlogCardProps) {
	const { language } = useLanguage();
	const data =
		language === "en" ? blogCardStaticEnglishData : blogCardStaticData;
	const langPrefix = `/${language}`;
	const thumbnailSrc = post.thumbnail
		? post.thumbnail.match(/^(https?:\/\/|data:|blob:)/)
			? post.thumbnail
			: post.thumbnail.startsWith("/")
				? post.thumbnail
				: `/${post.thumbnail}`
		: "/client/assets/images/mockBlog/thumb-post-1.jpg";

	return (
		<Link
			href={`${langPrefix}/blog/${createArticleSlug(post)}`}
			style={{ animationDelay: `${index * 120}ms` }}
			className={`
				animate-on-scroll ${isVisible ? "visible" : ""}
				group flex flex-col overflow-hidden rounded-xl 
				border border-white/10 bg-white/[0.03] shadow-sm 
				transition hover:-translate-y-2 hover:border-gold
				hover:shadow-lg hover:shadow-gold/20
			`}
		>
			<div className="relative h-64 w-full overflow-hidden">
				<Image
					src={thumbnailSrc}
					alt={post.title}
					fill
					className="object-cover transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
			<div className="p-4 flex flex-col h-full">
				<h3 className="text-lg font-semibold text-textPrimary group-hover:text-gold transition-colors">
					{post.title}
				</h3>

				<p className="mt-2 text-sm text-textSecondary">
					{buildExcerpt(post)}
				</p>

				<span className="mt-auto pt-4 inline-block text-gold text-sm font-medium">
					{data.readMore} →
				</span>
			</div>
		</Link>
	);
}
