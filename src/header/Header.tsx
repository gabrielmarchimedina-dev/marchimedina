"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { headerData, headerEnglishData } from "./header.data";
import { useLanguage } from "@/hooks/client/useLanguage";

// Componentes de bandeira
function BrazilFlag({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 36 36" className={className}>
			<path
				fill="#009B3A"
				d="M36 27a4 4 0 01-4 4H4a4 4 0 01-4-4V9a4 4 0 014-4h28a4 4 0 014 4v18z"
			/>
			<path fill="#FEDF01" d="M32.728 18L18 29.124 3.272 18 18 6.876z" />
			<circle fill="#002776" cx="18" cy="18" r="6.5" />
			<path
				fill="#CBE9D4"
				d="M12.277 14.887a6.5 6.5 0 00-.672 2.023c3.995-.29 9.417 1.891 11.744 4.595.402-.604.7-1.28.883-2.004-2.872-2.808-7.917-4.63-11.955-4.614z"
			/>
		</svg>
	);
}

function UKFlag({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 36 36" className={className}>
			<path
				fill="#00247D"
				d="M0 9.059V27a4 4 0 004 4h28a4 4 0 004-4V9a4 4 0 00-4-4H4a4 4 0 00-4 4v.059z"
			/>
			<path
				fill="#CF1B2B"
				d="M19 18v-4h9.062l-9 4H19zm17-4h-6l-9 4v-4h6l9.062-4H36v4zm0 4h-6l-9 4v-4h6l9-4v4zm-17 4v4H9.938l9-4H19zM0 22h6l9-4v4H9l-9.062 4H0v-4zm0-4h6l9-4v4H9L-.062 14H0v4z"
			/>
			<path
				fill="#EEE"
				d="M36 21h-3l-9 4v-4h-3v11h-6V21h-3l-9 4v-4H0v-6h3l9-4v4h3V4h6v11h3l9-4v4h3v6z"
			/>
			<path
				fill="#CF1B2B"
				d="M36 18v-2h-7l7-3v-2h-9l9 4v1h-2l-9 4h2v-2zm-21 0v2h-7l7 3v2H6l9-4v-1h-2l9.062-4H15v2z"
			/>
			<path fill="#EEE" d="M36 21v-6H21V4h-6v11H0v6h15v11h6V21z" />
			<path fill="#CF1B2B" d="M36 17v2H20v13h-4V19H0v-2h16V4h4v13z" />
		</svg>
	);
}

export default function Header() {
	const { language, setLanguage } = useLanguage();
	const data = language === "en" ? headerEnglishData : headerData;
	const pathname = usePathname();
	const isHome = pathname === "/";
	const [scrollSection, setScrollSection] = useState("");
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [hasArticles, setHasArticles] = useState(false);

	// Estado derivado: activeSection só é scrollSection quando está na home
	const activeSection = isHome ? scrollSection : "";

	useEffect(() => {
		let isMounted = true;

		async function checkArticles() {
			try {
				const response = await fetch("/api/v1/articles", {
					credentials: "include",
				});
				if (!response.ok) {
					return;
				}

				const data = (await response.json()) as Array<{
					active: boolean;
				}>;
				if (isMounted) {
					setHasArticles(data.some((item) => item.active));
				}
			} catch (error) {
				console.error("Erro ao verificar artigos:", error);
			}
		}

		checkArticles();
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		if (!isHome) {
			return;
		}

		const handleScroll = () => {
			const sections = [
				"servicos",
				"sobre",
				...(hasArticles ? ["blog"] : []),
				"contato",
			];
			const scrollPosition = window.scrollY + 200;

			const firstSection = document.getElementById("servicos");
			if (firstSection && scrollPosition < firstSection.offsetTop) {
				setScrollSection("");
				return;
			}

			for (const sectionId of sections) {
				const element = document.getElementById(sectionId);
				if (element) {
					const { offsetTop, offsetHeight } = element;
					if (
						scrollPosition >= offsetTop &&
						scrollPosition < offsetTop + offsetHeight
					) {
						setScrollSection(sectionId);
						break;
					}
				}
			}
		};

		handleScroll();
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [hasArticles, isHome]);

	// Fecha o menu mobile quando clicar em um link
	const handleLinkClick = () => {
		setMobileMenuOpen(false);
	};

	const getLinkClassName = (section: string) => {
		const isActive = activeSection === section;
		return `relative after:content-[''] after:absolute after:left-0 after:-bottom-1 
                after:h-[2px] after:bg-gold after:transition-all after:duration-300
                ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;
	};

	return (
		<>
			<header className="fixed top-0 left-0 z-50 w-full bg-black/30 backdrop-blur-md">
				<div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5">
					<Link
						href="/"
						className="text-xl sm:text-2xl font-semibold tracking-wide text-gold transition-colors"
					>
						<div className="flex flex-col items-center">
							<p>{data.agencyName}</p>
							<p className="text-base">{data.agencyTagline}</p>
						</div>
					</Link>

					{/* Menu Desktop */}
					<nav className="hidden md:flex gap-6 lg:gap-10 text-base lg:text-lg font-medium text-gold items-center">
						<a
							href={isHome ? "#servicos" : "/#servicos"}
							className={getLinkClassName("servicos")}
						>
							{data.services}
						</a>
						{hasArticles && (
							<a
								href={isHome ? "#blog" : "/#blog"}
								className={getLinkClassName("blog")}
							>
								{data.blog}
							</a>
						)}
						<a
							href={isHome ? "#contato" : "/#contato"}
							className={getLinkClassName("contato")}
						>
							{data.contact}
						</a>
						<a
							href="/equipe"
							className={getLinkClassName("equipe")}
						>
							{data.team}
						</a>
						{/* Botões de idioma */}
						<div className="flex gap-2 ml-4">
							<button
								onClick={() => setLanguage("pt")}
								className={`w-7 h-7 rounded-full overflow-hidden transition-all ${language === "pt" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="Português"
							>
								<BrazilFlag className="w-full h-full" />
							</button>
							<button
								onClick={() => setLanguage("en")}
								className={`w-7 h-7 rounded-full overflow-hidden transition-all ${language === "en" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="English"
							>
								<UKFlag className="w-full h-full" />
							</button>
						</div>
					</nav>

					{/* Botão Hamburger Mobile */}
					<button
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						className="md:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center z-50"
						aria-label="Menu"
					>
						<span
							className={`w-6 h-0.5 bg-gold transition-all duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
						></span>
						<span
							className={`w-6 h-0.5 bg-gold transition-all duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`}
						></span>
						<span
							className={`w-6 h-0.5 bg-gold transition-all duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
						></span>
					</button>
				</div>

				{/* Menu Mobile */}
				<div
					className={`
                md:hidden fixed top-0 right-0 h-screen w-64 bg-black/95 backdrop-blur-lg z-50
                transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}
            `}
				>
					<nav className="flex flex-col gap-8 px-8 pt-24 text-lg font-medium text-gold">
						<a
							href={isHome ? "#servicos" : "/#servicos"}
							onClick={handleLinkClick}
							className="hover:text-gold-light transition-colors"
						>
							{data.services}
						</a>
						{hasArticles && (
							<a
								href={isHome ? "#blog" : "/#blog"}
								onClick={handleLinkClick}
								className="hover:text-gold-light transition-colors"
							>
								{data.blog}
							</a>
						)}
						<a
							href={isHome ? "#contato" : "/#contato"}
							onClick={handleLinkClick}
							className="hover:text-gold-light transition-colors"
						>
							{data.contact}
						</a>
						<a
							href="/equipe"
							className="hover:text-gold-light transition-colors"
						>
							{data.team}
						</a>
						{/* Botões de idioma mobile */}
						<div className="flex gap-3 mt-4">
							<button
								onClick={() => setLanguage("pt")}
								className={`w-8 h-8 rounded-full overflow-hidden transition-all ${language === "pt" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="Português"
							>
								<BrazilFlag className="w-full h-full" />
							</button>
							<button
								onClick={() => setLanguage("en")}
								className={`w-8 h-8 rounded-full overflow-hidden transition-all ${language === "en" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="English"
							>
								<UKFlag className="w-full h-full" />
							</button>
						</div>
					</nav>
				</div>

				{/* Overlay - fora do header para funcionar corretamente */}
			</header>

			{/* Overlay */}
			{mobileMenuOpen && (
				<div
					className="md:hidden fixed inset-0 bg-black/50 z-40"
					onClick={() => setMobileMenuOpen(false)}
				/>
			)}
		</>
	);
}
