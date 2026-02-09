import BlogCard from "@/components/client/blogSection/BlogCard";
import article from "models/article";
import { Article as ClientArticle } from "@/types/blog/article.type";

export const dynamic = "force-dynamic";

async function getArticles() {
	const data = await article.findAll();
	return data.filter((item) => item.active);
}

export default async function BlogPage() {
	const articles = await getArticles();
	const orderedPosts = [...articles].sort(
		(a, b) =>
			new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
	);
	const serializedPosts: ClientArticle[] = orderedPosts.map((item) => ({
		id: item.id,
		title: item.title,
		subtitle: item.subtitle,
		text: item.text,
		thumbnail: item.thumbnail,
		active: item.active,
		created_at:
			item.created_at instanceof Date
				? item.created_at.toISOString()
				: String(item.created_at),
		updated_at:
			item.updated_at instanceof Date
				? item.updated_at.toISOString()
				: String(item.updated_at),
	}));

	return (
		<main className="min-h-screen bg-background text-textPrimary pt-28 pb-16">
			<div className="mx-auto max-w-5xl px-4">
				<header className="mb-10 text-center md:mb-14">
					<p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
						Blog
					</p>

					<h1 className="text-3xl md:text-4xl font-semibold text-gold mb-4">
						Todos os artigos
					</h1>

					<p className="text-sm md:text-base text-textSecondary max-w-3xl mx-auto">
						Explore nossos conteúdos sobre contratos, direito
						empresarial e outros temas jurídicos relevantes para o
						seu dia a dia.
					</p>
				</header>

				{serializedPosts.length === 0 ? (
					<div className="rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center text-textSecondary">
						Nenhum artigo publicado ainda.
					</div>
				) : (
					<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{serializedPosts.map((post, index) => (
							<BlogCard
								key={post.id}
								post={post}
								index={index}
								isVisible={true}
							/>
						))}
					</div>
				)}
			</div>
		</main>
	);
}
