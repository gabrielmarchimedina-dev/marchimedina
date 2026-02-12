"use client";

import { useEffect, useMemo, useState } from "react";
import { useScrollAnimation } from "@/hooks/client/useScrollAnimation";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import Image from "next/image";
import { getImageSrc } from "@/lib/imageUrl";

type TeamMember = {
	id: string;
	name: string;
	email?: string;
	oab_number?: string;
	education?: string;
	lattes_url?: string;
	bio?: string;
	languages?: string[];
	image_url: string;
	role: string;
	instagram?: string;
	linkedin?: string;
	active?: boolean;
};

export default function AboutSection() {
	const { ref, isVisible } = useScrollAnimation(0.2);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedMember, setSelectedMember] = useState<TeamMember | null>(
		null,
	);

	useEffect(() => {
		async function fetchTeamMembers() {
			try {
				const response = await fetch("/api/v1/team-members", {
					cache: "no-store",
				});
				if (response.ok) {
					const data = await response.json();
					setTeamMembers(data);
				}
			} catch (error) {
				console.error("Erro ao buscar equipe:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchTeamMembers();
	}, []);

	const orderedTeamMembers = useMemo(() => {
		return [...teamMembers].sort((a, b) => a.name.localeCompare(b.name));
	}, [teamMembers]);

	return (
		<section
			id="sobre"
			className="w-full bg-background py-16 text-textPrimary md:py-24"
		>
			<div className="mx-auto max-w-5xl px-4">
				<header className="mb-10 text-center md:mb-14">
					<p className="text-xs uppercase tracking-[0.3em] text-gold">
						Conheça o time
					</p>

					<h2 className="mt-3 text-3xl font-semibold text-gold md:text-4xl">
						Profissionais qualificados
					</h2>

					<p className="mt-4 text-sm text-textSecondary md:text-base max-w-3xl mx-auto">
						Contamos com uma equipe de profissionais dedicados e
						experientes, comprometidos em oferecer atendimento
						jurídico estratégico, ético e personalizado para cada
						cliente.
					</p>
				</header>

				<h3 className="mt-12 mb-8 text-2xl font-semibold text-gold md:text-3xl text-center">
					Equipe
				</h3>

				{loading ? (
					<p className="text-center text-textSecondary">
						Carregando equipe...
					</p>
				) : (
					<div
						ref={ref}
						className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12 justify-items-center"
					>
						{orderedTeamMembers.map((member, index) => (
							<div
								key={member.id}
								style={{ animationDelay: `${index * 120}ms` }}
								className={`
                                animate-on-scroll ${isVisible ? "visible" : ""}
                                group overflow-hidden rounded-xl 
                                border border-white/10 bg-white/[0.03]
                                shadow-sm transition w-full max-w-sm
                                hover:-translate-y-2 hover:border-gold 
                                hover:shadow-lg hover:shadow-gold/20`}
							>
								<div className="relative h-64 w-full overflow-hidden">
									<Image
										src={getImageSrc(member.image_url)}
										alt={member.name}
										fill
										className="object-cover transition-transform duration-300 group-hover:scale-105"
									/>
								</div>

								<div className="p-4 text-center">
									<h3 className="text-lg font-semibold text-textPrimary transition-colors group-hover:text-gold">
										{member.name}
									</h3>
									<p className="mt-1 text-sm text-textSecondary">
										{member.role}
									</p>
									<div className="mt-3 flex items-center justify-center gap-4 text-gold">
										{member.instagram && (
											<a
												href={member.instagram}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:text-gold-light transition-colors"
											>
												<FaInstagram size={20} />
											</a>
										)}
										{member.linkedin && (
											<a
												href={member.linkedin}
												target="_blank"
												rel="noopener noreferrer"
												className="hover:text-gold-light transition-colors"
											>
												<FaLinkedin size={20} />
											</a>
										)}
									</div>
									<button
										type="button"
										onClick={() =>
											setSelectedMember(member)
										}
										className="mt-4 inline-flex items-center justify-center rounded-full border border-gold px-4 py-2 text-sm font-medium text-gold transition hover:bg-gold/10"
									>
										Ver currículo
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{selectedMember && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-10"
					role="dialog"
					aria-modal="true"
					onClick={() => setSelectedMember(null)}
				>
					<div
						className="w-full max-w-2xl rounded-2xl border border-white/10 bg-background p-6 text-textPrimary shadow-xl"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-start justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10">
									<Image
										src={getImageSrc(
											selectedMember.image_url,
										)}
										alt={selectedMember.name}
										fill
										className="object-cover"
									/>
								</div>
								<div>
									<h3 className="text-2xl font-semibold text-gold">
										{selectedMember.name}
									</h3>
									<p className="mt-1 text-sm text-textSecondary">
										{selectedMember.role}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => setSelectedMember(null)}
								className="text-textSecondary transition hover:text-gold"
							>
								Fechar
							</button>
						</div>

						<div className="mt-6 space-y-4 text-sm text-textSecondary">
							{selectedMember.bio && (
								<div>
									<p className="text-xs uppercase tracking-[0.2em] text-gold">
										Bio
									</p>
									<p className="mt-2 text-textPrimary">
										{selectedMember.bio}
									</p>
								</div>
							)}
							<div className="grid gap-4 sm:grid-cols-2">
								{selectedMember.oab_number && (
									<div>
										<p className="text-xs uppercase tracking-[0.2em] text-gold">
											OAB
										</p>
										<p className="mt-1 text-textPrimary">
											{selectedMember.oab_number}
										</p>
									</div>
								)}
								{selectedMember.email && (
									<div>
										<p className="text-xs uppercase tracking-[0.2em] text-gold">
											Email
										</p>
										<p className="mt-1 text-textPrimary">
											{selectedMember.email}
										</p>
									</div>
								)}
								{selectedMember.education && (
									<div>
										<p className="text-xs uppercase tracking-[0.2em] text-gold">
											Formação
										</p>
										<p className="mt-1 text-textPrimary">
											{selectedMember.education}
										</p>
									</div>
								)}
								{selectedMember.languages?.length ? (
									<div>
										<p className="text-xs uppercase tracking-[0.2em] text-gold">
											Idiomas
										</p>
										<p className="mt-1 text-textPrimary">
											{selectedMember.languages.join(
												", ",
											)}
										</p>
									</div>
								) : null}
								{selectedMember.lattes_url && (
									<div>
										<p className="text-xs uppercase tracking-[0.2em] text-gold">
											Currículo Lattes
										</p>
										<a
											href={selectedMember.lattes_url}
											target="_blank"
											rel="noopener noreferrer"
											className="mt-1 inline-flex text-textPrimary underline decoration-gold/60 underline-offset-4"
										>
											Abrir currículo
										</a>
									</div>
								)}
							</div>

							<div className="flex flex-wrap items-center gap-4 pt-2">
								{selectedMember.instagram && (
									<a
										href={selectedMember.instagram}
										target="_blank"
										rel="noopener noreferrer"
										className="text-gold hover:text-gold-light"
									>
										Instagram
									</a>
								)}
								{selectedMember.linkedin && (
									<a
										href={selectedMember.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="text-gold hover:text-gold-light"
									>
										LinkedIn
									</a>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
