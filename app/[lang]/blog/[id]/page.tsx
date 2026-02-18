import { notFound } from "next/navigation";
import Image from "next/image";
import { getArticleIdFromSlug } from "@/lib/client/articleSlug";
import article from "models/article";
import teamMember from "models/teamMember";
import { getImageSrc } from "@/lib/imageUrl";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import {
	ArticleBackLink,
	ArticleLabel,
	ArticleAuthorsLabel,
} from "@/components/client/blogSection/ArticlePageComponents";

export const dynamic = "force-dynamic";

type TeamMemberRecord = {
	id: string;
	name: string;
	image_url: string;
	role: string;
	instagram?: string;
	linkedin?: string;
};

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

async function getArticleAuthors(
	authorIds: string[] | null,
): Promise<TeamMemberRecord[]> {
	if (!authorIds || authorIds.length === 0) {
		return [];
	}
	try {
		return await teamMember.findManyByIds(authorIds);
	} catch (error) {
		return [];
	}
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
	const authors = await getArticleAuthors(articleRecord.authors);
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
				<ArticleBackLink />

				{/* TÍTULO */}
				<header className="mb-8">
					<ArticleLabel />

					<h1 className="text-3xl md:text-4xl font-semibold text-textPrimary mb-3">
						{articleRecord.title}
					</h1>

					<div className="text-xs md:text-sm text-textSecondary">
						<span>{publishedAt}</span>
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

				{/* AUTORES */}
				{authors.length > 0 && (
					<div className="mt-12 pt-8 border-t border-white/10">
						<ArticleAuthorsLabel count={authors.length} />
						<div className="grid gap-6 sm:grid-cols-2">
							{authors.map((author) => (
								<div
									key={author.id}
									className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03]"
								>
									<div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-white/10">
										<Image
											src={getImageSrc(author.image_url)}
											alt={author.name}
											fill
											className="object-cover"
										/>
									</div>
									<div className="flex-1">
										<h4 className="text-base font-semibold text-textPrimary">
											{author.name}
										</h4>
										<p className="text-sm text-textSecondary">
											{author.role}
										</p>
										<div className="mt-2 flex items-center gap-3 text-gold">
											{author.instagram && (
												<a
													href={author.instagram}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:text-gold-light transition-colors"
												>
													<FaInstagram size={16} />
												</a>
											)}
											{author.linkedin && (
												<a
													href={author.linkedin}
													target="_blank"
													rel="noopener noreferrer"
													className="hover:text-gold-light transition-colors"
												>
													<FaLinkedin size={16} />
												</a>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</article>
		</main>
	);
}
