"use client";

import { useScrollAnimation } from "@/hooks/client/useScrollAnimation";
import { Service } from "./services.types";

export default function ServiceCard({
	service,
	index,
}: {
	service: Service;
	index: number;
}) {
	const { ref, isVisible } = useScrollAnimation();

	return (
		<article
			ref={ref}
			style={{ animationDelay: `${index * 80}ms` }}
			className={`animate-on-scroll ${
				isVisible ? "visible" : ""
			} group flex h-full flex-col rounded-xl border border-white/10 bg-white/[0.02] p-5 shadow-sm transition-transform transition-shadow duration-300 hover:-translate-y-2 hover:border-gold hover:shadow-lg hover:shadow-gold/20`}
		>
			<h3 className="mb-2 text-base font-semibold text-gold group-hover:text-gold-light">
				{service.title}
			</h3>
			<p className="text-sm text-textSecondary">{service.description}</p>
		</article>
	);
}
