import Header from "@/header/Header";
import Footer from "@/components/client/footer/Footer";
import "./globals.css";

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<Header />
			{children}
			<Footer />
		</>
	);
}
