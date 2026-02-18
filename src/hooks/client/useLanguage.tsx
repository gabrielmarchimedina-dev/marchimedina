"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

export type Language = "pt" | "en";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({
	children,
	initialLang = "pt",
}: {
	children: ReactNode;
	initialLang?: Language;
}) {
	const router = useRouter();
	const pathname = usePathname();

	const setLanguage = (lang: Language) => {
		// Remove current language prefix and add new one
		const pathWithoutLang = pathname.replace(/^\/(pt|en)/, "") || "/";
		router.push(`/${lang}${pathWithoutLang}`);
	};

	return (
		<LanguageContext.Provider
			value={{ language: initialLang, setLanguage, isHydrated: true }}
		>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error("useLanguage must be used within a LanguageProvider");
	}
	return context;
}
