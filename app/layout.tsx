import type { Metadata } from "next";
// import "./globals.css";

import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const playfair = Playfair_Display({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

const baseUrl =
	process.env.NEXT_PUBLIC_SITE_URL || "https://marchimedina.com.br";

export const metadata: Metadata = {
	title: {
		default: "Marchi Medina",
		template: "%s | Marchi Medina",
	},
	keywords: [
		"advocacia",
		"advogado",
		"consultoria jurídica",
		"direito empresarial",
		"Marchi Medina",
		"law firm",
		"legal consulting",
	],
	authors: [{ name: "Marchi Medina Advocacia" }],
	robots: {
		index: true,
		follow: true,
	},
	metadataBase: new URL(baseUrl),
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${playfair.className} antialiased`}
				style={{
					margin: 0,
					fontFamily: "system-ui, Arial, sans-serif",
				}}
			>
				{children}
			</body>
		</html>
	);
}
