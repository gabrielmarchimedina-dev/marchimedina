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

export const metadata: Metadata = {
	title: "Marchi Medina",
	description: "Advocacia e Consultoria",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="pt-BR">
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
