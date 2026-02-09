import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArticleIdFromSlug } from "@/lib/client/articleSlug";
import article from "models/article";

export const dynamic = "force-dynamic";

type PostPageProps = {
	params: Promise<{
		id: string;
	}>;
};

async function getArticleById(id: string) {
	try {
		return await article.findOneById(id);
	} catch (error) {
		return null;
	}
}

function getReadingTime(text: string) {
	const words = text.trim().split(/\s+/).filter(Boolean).length;
	const minutes = Math.max(1, Math.ceil(words / 200));
	return `${minutes} min de leitura`;
}

export default async function PostPage({ params }: PostPageProps) {
	const resolvedParams = await params;
	if (!resolvedParams?.id) {
		notFound();
	}

	const articleId = getArticleIdFromSlug(resolvedParams.id);
	const articleRecord = articleId ? await getArticleById(articleId) : null;
	if (!articleRecord || !articleRecord.active) {
		notFound();
	}

	const paragraphs = articleRecord.text?.split("\n\n") ?? [];
	const readingTime = getReadingTime(articleRecord.text ?? "");
	const publishedAt = new Date(articleRecord.created_at).toLocaleDateString(
		"pt-BR",
	);
	const thumbnailSrc = articleRecord.thumbnail
		? articleRecord.thumbnail.match(/^(https?:\/\/|data:|blob:)/)
			? articleRecord.thumbnail
			: articleRecord.thumbnail.startsWith("/")
				? articleRecord.thumbnail
				: `/${articleRecord.thumbnail}`
		: null;

	return (
		<main className="min-h-screen bg-background text-textPrimary pt-28 pb-16">
			<article className="mx-auto max-w-3xl px-4">
				{/* CATEGORIA / VOLTAR */}
				<div className="mb-4 text-sm text-textSecondary">
					<Link
						href="/blog"
						className="hover:text-gold transition-colors"
					>
						← Voltar para o blog
					</Link>
				</div>

				{/* TÍTULO */}
				<header className="mb-8">
					<p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
						Artigo
					</p>

					<h1 className="text-3xl md:text-4xl font-semibold text-textPrimary mb-3">
						{articleRecord.title}
					</h1>

					<div className="text-xs md:text-sm text-textSecondary flex flex-wrap gap-3">
						<span>{publishedAt}</span>
						<span>•</span>
						<span>{readingTime}</span>
					</div>
				</header>

				{/* IMAGEM DE DESTAQUE */}
				{thumbnailSrc && (
					<div className="mb-8 overflow-hidden rounded-xl border border-white/10">
						<Image
							src={thumbnailSrc}
							alt={articleRecord.title}
							width={1200}
							height={600}
							className="h-auto w-full object-cover"
						/>
					</div>
				)}

				{/* CONTEÚDO */}
				<div className="prose prose-invert prose-sm md:prose-base max-w-none">
					{paragraphs.map((para, idx) => (
						<p
							key={idx}
							className="mb-4 text-textSecondary leading-relaxed"
						>
							{para}
						</p>
					))}
				</div>
			</article>
		</main>
	);
}
