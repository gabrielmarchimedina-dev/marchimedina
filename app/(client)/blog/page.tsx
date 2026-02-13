import BlogCard from "@/components/client/blogSection/BlogCard";
import BlogPageHeader, {
	BlogPageEmpty,
} from "@/components/client/blogSection/BlogPageHeader";
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
				<BlogPageHeader />

				{serializedPosts.length === 0 ? (
					<BlogPageEmpty />
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
