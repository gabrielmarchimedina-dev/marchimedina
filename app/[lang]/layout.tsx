import Header from "@/header/Header";
import Footer from "@/components/client/footer/Footer";
import { LanguageProvider, Language } from "@/hooks/client/useLanguage";
import { SetHtmlLang } from "@/components/client/SetHtmlLang";
import { Metadata } from "next";
import "./globals.css";

type Props = {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
};

const baseUrl =
	process.env.NEXT_PUBLIC_SITE_URL || "https://marchimedina.com.br";

const metadata = {
	pt: {
		title: "Marchi Medina - Advocacia e Consultoria",
		description:
			"Escritório de advocacia especializado em consultoria jurídica. Atendimento personalizado e soluções legais para empresas e pessoas físicas.",
	},
	en: {
		title: "Marchi Medina - Law Firm & Legal Consulting",
		description:
			"Law firm specialized in legal consulting. Personalized service and legal solutions for businesses and individuals.",
	},
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const validLang = lang === "en" ? "en" : "pt";
	const data = metadata[validLang];

	return {
		title: {
			default: data.title,
			template: `%s | Marchi Medina`,
		},
		description: data.description,
		openGraph: {
			title: data.title,
			description: data.description,
			url: `${baseUrl}/${validLang}`,
			siteName: "Marchi Medina",
			locale: validLang === "en" ? "en_US" : "pt_BR",
			type: "website",
			images: [
				{
					url: `${baseUrl}/og-image.jpg`,
					width: 1200,
					height: 630,
					alt: "Marchi Medina",
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: data.title,
			description: data.description,
			images: [`${baseUrl}/og-image.jpg`],
		},
		alternates: {
			canonical: `${baseUrl}/${validLang}`,
			languages: {
				"pt-BR": `${baseUrl}/pt`,
				"en-US": `${baseUrl}/en`,
			},
		},
	};
}

export function generateStaticParams() {
	return [{ lang: "pt" }, { lang: "en" }];
}

export default async function LangLayout({ children, params }: Props) {
	const { lang } = await params;
	const validLang: Language = lang === "en" ? "en" : "pt";

	return (
		<LanguageProvider initialLang={validLang}>
			<SetHtmlLang lang={validLang} />
			<Header />
			{children}
			<Footer />
		</LanguageProvider>
	);
}
