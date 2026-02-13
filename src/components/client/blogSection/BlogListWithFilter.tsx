"use client";

import { useState } from "react";
import BlogCard from "./BlogCard";
import { useLanguage } from "@/hooks/client/useLanguage";
import {
	blogPageStaticData,
	blogPageStaticEnglishData,
} from "../../../../app/(client)/blog/blog.data";
import { Article, ArticleLanguage } from "@/types/blog/article.type";

type FilterOption = "all" | ArticleLanguage;

type BlogListWithFilterProps = {
	posts: Article[];
};

export default function BlogListWithFilter({ posts }: BlogListWithFilterProps) {
	const { language } = useLanguage();
	const data =
		language === "en" ? blogPageStaticEnglishData : blogPageStaticData;
	const [filter, setFilter] = useState<FilterOption>("all");

	const filteredPosts =
		filter === "all"
			? posts
			: posts.filter((post) => post.language === filter);

	const filterButtons: { value: FilterOption; label: string }[] = [
		{ value: "all", label: data.filterAll },
		{ value: "portugues", label: data.filterPortuguese },
		{ value: "ingles", label: data.filterEnglish },
		{ value: "frances", label: data.filterFrench },
	];

	return (
		<>
			{/* Filtros */}
			<div className="flex flex-wrap justify-center gap-3 mb-10">
				{filterButtons.map((btn) => (
					<button
						key={btn.value}
						onClick={() => setFilter(btn.value)}
						className={`
							px-4 py-2 rounded-full text-sm font-medium transition-all
							${
								filter === btn.value
									? "bg-gold text-black"
									: "border border-gold text-gold hover:bg-gold/10"
							}
						`}
					>
						{btn.label}
					</button>
				))}
			</div>

			{/* Lista de artigos */}
			{filteredPosts.length === 0 ? (
				<div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-textSecondary">
					{data.noArticleMessage}
				</div>
			) : (
				<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
					{filteredPosts.map((post, index) => (
						<BlogCard
							key={post.id}
							post={post}
							index={index}
							isVisible={true}
						/>
					))}
				</div>
			)}
		</>
	);
}
