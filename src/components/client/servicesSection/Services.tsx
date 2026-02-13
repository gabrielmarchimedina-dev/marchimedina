"use client";

import { useLanguage } from "@/hooks/client/useLanguage";
import ServiceCard from "./ServiceCard";
import {
	services,
	englishServices,
	serviceSectionHeader,
	serviceSectionEnglishHeader,
} from "./services.data";

export default function Services() {
	const { language } = useLanguage();
	const header =
		language === "en" ? serviceSectionEnglishHeader : serviceSectionHeader;
	const servicesList = language === "en" ? englishServices : services;

	return (
		<section
			id="servicos"
			className="w-full bg-background py-16 text-textPrimary md:py-24"
		>
			<div className="mx-auto max-w-5xl px-4">
				<header className="mb-10 text-center md:mb-14">
					<p className="text-xs uppercase tracking-[0.3em] text-gold">
						{header.label}
					</p>
					<h2 className="mt-3 text-3xl font-semibold text-gold md:text-4xl">
						{header.title}
					</h2>
					<p className="mt-4 text-sm text-textSecondary md:text-base">
						{header.subtitle}
					</p>
				</header>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{servicesList.map((service, index) => (
						<ServiceCard
							key={service.id}
							service={service}
							index={index}
						/>
					))}
				</div>
			</div>
		</section>
	);
}
