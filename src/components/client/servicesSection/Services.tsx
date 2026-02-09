import ServiceCard from "./ServiceCard";
import services from "./services.data";

export default function Services() {
	return (
		<section
			id="servicos"
			className="w-full bg-background py-16 text-textPrimary md:py-24"
		>
			<div className="mx-auto max-w-5xl px-4">
				<header className="mb-10 text-center md:mb-14">
					<p className="text-xs uppercase tracking-[0.3em] text-gold">
						Atuação
					</p>
					<h2 className="mt-3 text-3xl font-semibold text-gold md:text-4xl">
						Áreas de atuação
					</h2>
					<p className="mt-4 text-sm text-textSecondary md:text-base">
						Descubra nossas especializações e conte com um
						acompanhamento jurídico estratégico e personalizado.
					</p>
				</header>

				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{services.map((service, index) => (
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
