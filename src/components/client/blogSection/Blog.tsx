"use client";

import BlogCard from "./BlogCard";
import { useScrollAnimation } from "@/hooks/client/useScrollAnimation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Article } from "@/types/blog/article.type";

export default function BlogSection() {
	const { ref, isVisible } = useScrollAnimation(0.2);
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;

		async function loadArticles() {
			try {
				const response = await fetch("/api/v1/articles", {
					credentials: "include",
				});
				if (!response.ok) {
					return;
				}

				const data = (await response.json()) as Article[];
				if (isMounted) {
					setArticles(data.filter((item) => item.active));
				}
			} catch (error) {
				console.error("Erro ao carregar artigos:", error);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadArticles();
		return () => {
			isMounted = false;
		};
	}, []);

	const latestPosts = useMemo(() => {
		return [...articles]
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime(),
			)
			.slice(0, 3);
	}, [articles]);

	if (loading || latestPosts.length === 0) {
		return null;
	}

	return (
		<section
			id="blog"
			className="w-full bg-background py-16 text-textPrimary md:py-24"
		>
			<div className="mx-auto max-w-5xl px-4">
				{/* HEADER */}
				<header className="mb-10 text-center md:mb-14">
					<p className="text-xs uppercase tracking-[0.3em] text-gold">
						Conteúdo
					</p>

					<h2 className="mt-3 text-3xl font-semibold text-gold md:text-4xl">
						Artigos e Publicações
					</h2>

					<p className="mt-4 text-sm text-textSecondary md:text-base max-w-3xl mx-auto">
						Acompanhe análises, orientações e informações jurídicas
						desenvolvidas por nossos profissionais.
					</p>
				</header>

				{/* GRID DE POSTS */}
				<div
					ref={ref}
					className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
				>
					{latestPosts.map((post, index) => (
						<BlogCard
							key={post.id}
							post={post}
							index={index}
							isVisible={isVisible}
						/>
					))}
				</div>

				{/* BOTÃO VER TODOS */}
				<div className="mt-10 flex justify-center">
					<Link
						href="/blog"
						className="
              inline-flex items-center rounded-full border border-gold 
              px-6 py-2 text-sm font-medium text-gold 
              hover:bg-gold hover:text-black transition-colors
            "
					>
						Ver todos os artigos
					</Link>
				</div>
			</div>
		</section>
	);
}
