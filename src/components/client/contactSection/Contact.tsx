"use client";

import { useScrollAnimation } from "@/hooks/client/useScrollAnimation";
import { useLanguage } from "@/hooks/client/useLanguage";
import { contactSectionData, contactSectionEnglishData } from "./contact.data";

export default function ContactSection() {
	const { language } = useLanguage();
	const data =
		language === "en" ? contactSectionEnglishData : contactSectionData;
	const { ref, isVisible } = useScrollAnimation(0.2);

	return (
		<section
			id="contato"
			className="w-full bg-black py-12 sm:py-16 md:py-20 text-textPrimary"
		>
			<div className="mx-auto max-w-4xl px-4 sm:px-6">
				<div
					ref={ref}
					className={`
            animate-on-scroll ${isVisible ? "visible" : ""}
            text-center
          `}
				>
					<p className="text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase text-gold mb-3">
						{data.label}
					</p>

					<h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gold mb-4 px-2">
						{data.title}
					</h2>

					<p className="text-textSecondary mb-8 sm:mb-10 max-w-2xl mx-auto text-sm md:text-base px-4">
						{data.subtitle}
					</p>

					{/* Botões */}
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 px-4">
						{/* WhatsApp */}
						<a
							href="https://wa.me/5544991041002"
							target="_blank"
							rel="noopener noreferrer"
							className="
                w-full sm:w-auto inline-flex items-center justify-center
                rounded-full bg-gold px-6 sm:px-8 py-3 text-sm font-semibold text-black
                shadow-md shadow-gold/30
                transition hover:bg-gold-light hover:shadow-gold/50
              "
						>
							{data.whatsAppButtonText}
						</a>

						{/* TODO: Descomentar quando o serviço de e-mail estiver pronto */}
						{/* <Link
							href="/contato"
							className="
                w-full sm:w-auto inline-flex items-center justify-center
                rounded-full border border-gold px-6 sm:px-8 py-3 text-sm font-semibold
                text-gold hover:bg-gold/10 transition
              "
						>
							{data.emailButtonText}
						</Link> */}
					</div>

					{/* Info rápida de contato */}
					<div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-textSecondary px-4">
						<div>
							<p className="font-semibold text-textPrimary mb-1">
								{data.phoneLabel}
							</p>
							<p>{data.phoneNumber}</p>
						</div>
						<div>
							<p className="font-semibold text-textPrimary mb-1">
								{data.emailLabel}
							</p>
							<p className="break-all">{data.emailAddress}</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
