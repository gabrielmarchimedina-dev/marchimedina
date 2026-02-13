"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode,
} from "react";

export type Language = "pt" | "en";

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
	undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
	const [language, setLanguageState] = useState<Language>("pt");
	const [isHydrated, setIsHydrated] = useState(false);

	// Hidratar idioma do localStorage após montar (evita mismatch SSR)
	useEffect(() => {
		const stored = localStorage.getItem("language");
		if (stored === "pt" || stored === "en") {
			// eslint-disable-next-line react-hooks/set-state-in-effect -- necessário para hidratar do localStorage
			setLanguageState(stored);
		}
		setIsHydrated(true);
	}, []);

	const setLanguage = (lang: Language) => {
		setLanguageState(lang);
		localStorage.setItem("language", lang);
	};

	return (
		<LanguageContext.Provider value={{ language, setLanguage, isHydrated }}>
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
