"use client";

import Link from "next/link";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { useLanguage } from "@/hooks/client/useLanguage";
import { footerData, footerEnglishData } from "./footer.data";

export default function Footer() {
	const { language } = useLanguage();
	const data = language === "en" ? footerEnglishData : footerData;
	const langPrefix = `/${language}`;

	return (
		<footer className="w-full bg-black text-textSecondary border-t border-white/10">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* LINKS DO FOOTER */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
					{/* Marca */}
					<div className="text-center md:text-left">
						<h3 className="text-gold text-lg sm:text-xl font-semibold tracking-wide">
							{data.agencyName}
						</h3>
						<p className="text-xs sm:text-sm mt-2 text-textSecondary">
							{data.agencyTagline}
						</p>
					</div>

					{/* Navegação */}
					<nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
						<Link
							href={`${langPrefix}#servicos`}
							className="hover:text-gold transition-colors"
						>
							{data.services}
						</Link>
						<Link
							href={`${langPrefix}#sobre`}
							className="hover:text-gold transition-colors"
						>
							{data.about}
						</Link>
						<Link
							href={`${langPrefix}/blog`}
							className="hover:text-gold transition-colors"
						>
							{data.blog}
						</Link>
						<Link
							href={`${langPrefix}#contato`}
							className="hover:text-gold transition-colors"
						>
							{data.contact}
						</Link>
					</nav>

					{/* Redes sociais */}
					<div className="flex gap-4 sm:gap-5 text-lg sm:text-xl">
						<a
							href="https://instagram.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-gold transition-colors"
						>
							<FaInstagram />
						</a>
						<a
							href="https://linkedin.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-gold transition-colors"
						>
							<FaLinkedin />
						</a>
					</div>
				</div>

				{/* Linha divisória */}
				<div className="mt-8 sm:mt-10 h-px bg-white/10 w-full"></div>

				{/* COPYRIGHT */}
				<div className="text-center text-xs text-textSecondary mt-4 sm:mt-6">
					© {new Date().getFullYear()} {data.rights}
				</div>
			</div>
		</footer>
	);
}
