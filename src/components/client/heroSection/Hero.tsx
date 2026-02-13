"use client";

import Image from "next/image";
import { useTypewriter } from "@/hooks/client/useTypewriter";
import { useScrollAnimation } from "@/hooks/client/useScrollAnimation";
import { useLanguage } from "@/hooks/client/useLanguage";
import { heroData, heroEnglishData } from "./hero.data";

export default function Hero() {
	const { language } = useLanguage();
	const data = language === "en" ? heroEnglishData : heroData;
	const { ref, isVisible } = useScrollAnimation(0.3);
	const typedTitle = useTypewriter(
		data.title,
		data.typingSpeed,
		0,
		isVisible,
	);
	const typedSubtitle = useTypewriter(
		data.subtitle,
		data.subtitleSpeed,
		data.totalDelay,
		isVisible,
	);
	return (
		<section className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
			<Image
				src="/client/assets/images/hero/heroImg.jpg"
				alt="Hero Background"
				className="absolute inset-0 object-cover brightness-70 animate-kenburns-slow"
				fill
				priority
			/>
			<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-background/95" />

			<div
				ref={ref}
				className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 text-center"
			>
				<h1 className="mb-3 text-sm sm:text-md uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gold">
					{typedTitle}
				</h1>
				<p className="mx-auto mb-8 max-w-2xl text-base sm:text-xl md:text-2xl lg:text-3xl text-white font-light px-2">
					{typedSubtitle}
				</p>
				<a
					href="#servicos"
					className="inline-flex items-center justify-center text-gold-light hover:text-gold transition"
				>
					<svg
						className="w-6 h-6 sm:w-7 sm:h-7 animate-bounce"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</a>
			</div>
		</section>
	);
}
