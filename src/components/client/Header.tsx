"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Header() {
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
							<p>Marchi Medina</p>
							<p className="text-base">Advocacia</p>
						</div>
					</Link>

					{/* Menu Desktop */}
					<nav className="hidden md:flex gap-6 lg:gap-10 text-base lg:text-lg font-medium text-gold">
						<a
							href={isHome ? "#servicos" : "/#servicos"}
							className={getLinkClassName("servicos")}
						>
							Serviços
						</a>
						{hasArticles && (
							<a
								href={isHome ? "#blog" : "/#blog"}
								className={getLinkClassName("blog")}
							>
								Blog
							</a>
						)}
						<a
							href={isHome ? "#contato" : "/#contato"}
							className={getLinkClassName("contato")}
						>
							Contato
						</a>
						<a
							href="/equipe"
							className={getLinkClassName("equipe")}
						>
							Equipe
						</a>
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
							Serviços
						</a>
						{hasArticles && (
							<a
								href={isHome ? "#blog" : "/#blog"}
								onClick={handleLinkClick}
								className="hover:text-gold-light transition-colors"
							>
								Blog
							</a>
						)}
						<a
							href={isHome ? "#contato" : "/#contato"}
							onClick={handleLinkClick}
							className="hover:text-gold-light transition-colors"
						>
							Contato
						</a>
						<a
							href="/equipe"
							className="hover:text-gold-light transition-colors"
						>
							Equipe
						</a>
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
