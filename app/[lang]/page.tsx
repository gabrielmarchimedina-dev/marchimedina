import Hero from "@/components/client/heroSection/Hero";
import Services from "@/components/client/servicesSection/Services";
import Blog from "@/components/client/blogSection/Blog";
import Contact from "@/components/client/contactSection/Contact";

export default function Home() {
	return (
		<div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
			<Hero />
			<Services />
			<Blog />
			<Contact />
		</div>
	);
}
