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

function USAFlag({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 36 36" className={className}>
			<path
				fill="#B22234"
				d="M35.445 7C34.752 5.809 33.477 5 32 5H4c-1.477 0-2.752.809-3.445 2h34.89z"
			/>
			<path fill="#EEE" d="M0 9.5h36V12H0z" />
			<path fill="#B22234" d="M0 12h36v2.5H0z" />
			<path fill="#EEE" d="M0 14.5h36V17H0z" />
			<path fill="#B22234" d="M0 17h36v2.5H0z" />
			<path fill="#EEE" d="M0 19.5h36V22H0z" />
			<path fill="#B22234" d="M0 22h36v2.5H0z" />
			<path fill="#EEE" d="M0 24.5h36V27H0z" />
			<path
				fill="#B22234"
				d="M0 27v.333C0 29.355 1.645 31 3.667 31h28.666C34.355 31 36 29.355 36 27.333V27H0z"
			/>
			<path fill="#3C3B6E" d="M0 7c0-1.105.672-2 1.5-2H18v12H0V7z" />
			<path
				fill="#FFF"
				d="M1.5 8.5l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm-13.5 3l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1zm3 0l.5 1h1l-.8.6.3 1-.9-.7-.9.7.3-1-.8-.6h1z"
			/>
		</svg>
	);
}

export default function Header() {
	const { language, setLanguage } = useLanguage();
	const data = language === "en" ? headerEnglishData : headerData;
	const pathname = usePathname();
	const langPrefix = `/${language}`;
	const isHome = pathname === `/${language}` || pathname === "/";
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
						href={langPrefix}
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
							href={
								isHome ? "#servicos" : `${langPrefix}#servicos`
							}
							className={getLinkClassName("servicos")}
						>
							{data.services}
						</a>
						{hasArticles && (
							<a
								href={isHome ? "#blog" : `${langPrefix}#blog`}
								className={getLinkClassName("blog")}
							>
								{data.blog}
							</a>
						)}
						<a
							href={isHome ? "#contato" : `${langPrefix}#contato`}
							className={getLinkClassName("contato")}
						>
							{data.contact}
						</a>
						<a
							href={`${langPrefix}/equipe`}
							className={getLinkClassName("equipe")}
						>
							{data.team}
						</a>
						{/* Botões de idioma */}
						<div className="flex gap-2 ml-4">
							<button
								onClick={() => setLanguage("pt")}
								className={`w-7 h-7 rounded-full overflow-hidden transition-all cursor-pointer ${language === "pt" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="Português"
							>
								<BrazilFlag className="w-full h-full" />
							</button>
							<button
								onClick={() => setLanguage("en")}
								className={`w-7 h-7 rounded-full overflow-hidden transition-all cursor-pointer ${language === "en" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="English"
							>
								<USAFlag className="w-full h-full" />
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
							href={
								isHome ? "#servicos" : `${langPrefix}#servicos`
							}
							onClick={handleLinkClick}
							className="hover:text-gold-light transition-colors"
						>
							{data.services}
						</a>
						{hasArticles && (
							<a
								href={isHome ? "#blog" : `${langPrefix}#blog`}
								onClick={handleLinkClick}
								className="hover:text-gold-light transition-colors"
							>
								{data.blog}
							</a>
						)}
						<a
							href={isHome ? "#contato" : `${langPrefix}#contato`}
							onClick={handleLinkClick}
							className="hover:text-gold-light transition-colors"
						>
							{data.contact}
						</a>
						<a
							href={`${langPrefix}/equipe`}
							className="hover:text-gold-light transition-colors"
						>
							{data.team}
						</a>
						{/* Botões de idioma mobile */}
						<div className="flex gap-3 mt-4">
							<button
								onClick={() => setLanguage("pt")}
								className={`w-8 h-8 rounded-full overflow-hidden transition-all cursor-pointer ${language === "pt" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="Português"
							>
								<BrazilFlag className="w-full h-full" />
							</button>
							<button
								onClick={() => setLanguage("en")}
								className={`w-8 h-8 rounded-full overflow-hidden transition-all cursor-pointer ${language === "en" ? "ring-2 ring-gold scale-110" : "opacity-60 hover:opacity-100"}`}
								title="English"
							>
								<USAFlag className="w-full h-full" />
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
