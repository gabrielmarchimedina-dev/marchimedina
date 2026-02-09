"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
	active: boolean;
	created_at: string;
	updated_at: string;
};

export default function ViewTeamMemberPage() {
	const params = useParams();
	const router = useRouter();
	const memberId = params.id as string;
	const [member, setMember] = useState<TeamMember | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchMember() {
			try {
				const response = await fetch(
					`/api/v1/team-members/${memberId}`,
					{
						credentials: "include",
					},
				);
				if (response.ok) {
					const data = await response.json();
					setMember(data);
				} else {
					router.push("/admin/equipe");
				}
			} catch (error) {
				console.error("Erro ao buscar membro:", error);
				router.push("/admin/equipe");
			} finally {
				setLoading(false);
			}
		}

		fetchMember();
	}, [memberId, router]);

	if (loading) {
		return <div>Carregando...</div>;
	}

	if (!member) {
		return null;
	}

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "2rem",
				}}
			>
				<div>
					<Link
						href="/admin/equipe"
						style={{
							color: "#d1d5db",
							textDecoration: "none",
							marginBottom: "0.5rem",
							display: "inline-block",
						}}
					>
						← Voltar
					</Link>
					<h1 style={{ fontSize: "1.875rem", fontWeight: "600" }}>
						Visualizar Membro da Equipe
					</h1>
				</div>
			</div>

			<div
				style={{
					background: "#1a1a1a",
					border: "1px solid #333",
					borderRadius: "8px",
					padding: "2rem",
					marginBottom: "1.5rem",
				}}
			>
				<h2
					style={{
						fontSize: "1.25rem",
						fontWeight: "600",
						marginBottom: "1.5rem",
						color: "#d4af37",
					}}
				>
					Dados do Membro
				</h2>

				{member.image_url && (
					<div style={{ marginBottom: "1.5rem" }}>
						<Image
							src={`/${member.image_url}`}
							alt={member.name}
							width={120}
							height={120}
							style={{
								width: "120px",
								height: "120px",
								borderRadius: "50%",
								objectFit: "cover",
								border: "3px solid #d4af37",
							}}
						/>
					</div>
				)}

				<div style={{ display: "grid", gap: "1rem" }}>
					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.25rem",
								color: "#999",
								fontSize: "0.875rem",
							}}
						>
							Nome
						</label>
						<p style={{ fontSize: "1rem", color: "#ededed" }}>
							{member.name}
						</p>
					</div>

					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.25rem",
								color: "#999",
								fontSize: "0.875rem",
							}}
						>
							Cargo
						</label>
						<p style={{ fontSize: "1rem", color: "#ededed" }}>
							{member.role}
						</p>
					</div>

					{member.email && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								Email
							</label>
							<p style={{ fontSize: "1rem", color: "#ededed" }}>
								{member.email}
							</p>
						</div>
					)}

					{member.oab_number && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								OAB
							</label>
							<p style={{ fontSize: "1rem", color: "#ededed" }}>
								{member.oab_number}
							</p>
						</div>
					)}

					{member.education && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								Formação
							</label>
							<p style={{ fontSize: "1rem", color: "#ededed" }}>
								{member.education}
							</p>
						</div>
					)}

					{member.bio && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								Biografia
							</label>
							<p
								style={{
									fontSize: "1rem",
									color: "#ededed",
									lineHeight: "1.6",
									whiteSpace: "pre-wrap",
								}}
							>
								{member.bio}
							</p>
						</div>
					)}

					{member.languages && member.languages.length > 0 && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								Idiomas
							</label>
							<p style={{ fontSize: "1rem", color: "#ededed" }}>
								{member.languages.join(", ")}
							</p>
						</div>
					)}

					{member.lattes_url && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								Currículo Lattes
							</label>
							<a
								href={member.lattes_url}
								target="_blank"
								rel="noopener noreferrer"
								style={{
									fontSize: "0.875rem",
									color: "#d4af37",
									wordBreak: "break-all",
								}}
							>
								{member.lattes_url}
							</a>
						</div>
					)}

					{member.instagram && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								Instagram
							</label>
							<p style={{ fontSize: "1rem", color: "#ededed" }}>
								{member.instagram}
							</p>
						</div>
					)}

					{member.linkedin && (
						<div>
							<label
								style={{
									display: "block",
									marginBottom: "0.25rem",
									color: "#999",
									fontSize: "0.875rem",
								}}
							>
								LinkedIn
							</label>
							<p style={{ fontSize: "1rem", color: "#ededed" }}>
								{member.linkedin}
							</p>
						</div>
					)}

					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.25rem",
								color: "#999",
								fontSize: "0.875rem",
							}}
						>
							Criado em
						</label>
						<p style={{ fontSize: "1rem", color: "#ededed" }}>
							{new Date(member.created_at).toLocaleString(
								"pt-BR",
							)}
						</p>
					</div>

					<div>
						<label
							style={{
								display: "block",
								marginBottom: "0.25rem",
								color: "#999",
								fontSize: "0.875rem",
							}}
						>
							Atualizado em
						</label>
						<p style={{ fontSize: "1rem", color: "#ededed" }}>
							{new Date(member.updated_at).toLocaleString(
								"pt-BR",
							)}
						</p>
					</div>
				</div>

				<div style={{ marginTop: "1.5rem" }}>
					<Link
						href={`/admin/equipe/${memberId}/editar`}
						style={{
							padding: "0.75rem 1.5rem",
							background: "#d4af37",
							color: "#0a0a0a",
							border: "none",
							borderRadius: "6px",
							fontWeight: "600",
							cursor: "pointer",
							textDecoration: "none",
							display: "inline-block",
						}}
					>
						Editar Membro
					</Link>
				</div>
			</div>
		</div>
	);
}
