import Header from "@/header/Header";
import Footer from "@/components/client/footer/Footer";
import { LanguageProvider } from "@/hooks/client/useLanguage";
import "./globals.css";

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<LanguageProvider>
			<Header />
			{children}
			<Footer />
		</LanguageProvider>
	);
}
