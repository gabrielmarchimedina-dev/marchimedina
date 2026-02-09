"use client";

import Link from "next/link";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";

export default function Footer() {
	return (
		<footer className="w-full bg-black text-textSecondary border-t border-white/10">
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
				{/* LINKS DO FOOTER */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
					{/* Marca */}
					<div className="text-center md:text-left">
						<h3 className="text-gold text-lg sm:text-xl font-semibold tracking-wide">
							Marchi Medina
						</h3>
						<p className="text-xs sm:text-sm mt-2 text-textSecondary">
							Excelência jurídica com transparência e ética.
						</p>
					</div>

					{/* Navegação */}
					<nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
						<Link
							href="#servicos"
							className="hover:text-gold transition-colors"
						>
							Serviços
						</Link>
						<Link
							href="#sobre"
							className="hover:text-gold transition-colors"
						>
							Sobre
						</Link>
						<Link
							href="/blog"
							className="hover:text-gold transition-colors"
						>
							Blog
						</Link>
						<Link
							href="#contato"
							className="hover:text-gold transition-colors"
						>
							Contato
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
						<a
							href="https://facebook.com"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-gold transition-colors"
						>
							<FaFacebook />
						</a>
					</div>
				</div>

				{/* Linha divisória */}
				<div className="mt-8 sm:mt-10 h-px bg-white/10 w-full"></div>

				{/* COPYRIGHT */}
				<div className="text-center text-xs text-textSecondary mt-4 sm:mt-6">
					© {new Date().getFullYear()} Marchi Medina — Todos os
					direitos reservados.
				</div>
			</div>
		</footer>
	);
}
