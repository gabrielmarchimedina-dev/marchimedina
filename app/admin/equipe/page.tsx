"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
};

export default function TeamMembersPage() {
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchTeamMembers() {
			try {
				const response = await fetch("/api/v1/team-members", {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setTeamMembers(data);
				}
			} catch (error) {
				console.error("Erro ao buscar membros da equipe:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchTeamMembers();
	}, []);

	if (loading) {
		return <div>Carregando...</div>;
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
				<h1 style={{ fontSize: "1.875rem", fontWeight: "600" }}>
					Equipe
				</h1>
				<Link
					href="/admin/equipe/novo"
					style={{
						padding: "0.75rem 1.5rem",
						background: "#d4af37",
						color: "#0a0a0a",
						border: "none",
						borderRadius: "6px",
						fontWeight: "600",
						cursor: "pointer",
						transition: "background 0.2s",
						textDecoration: "none",
						display: "inline-block",
					}}
					onMouseEnter={(e) =>
						(e.currentTarget.style.background = "#b8860b")
					}
					onMouseLeave={(e) =>
						(e.currentTarget.style.background = "#d4af37")
					}
				>
					+ Novo Membro
				</Link>
			</div>

			{teamMembers.length === 0 ? (
				<div
					style={{
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: "8px",
						padding: "3rem",
						textAlign: "center",
						color: "#d1d5db",
					}}
				>
					<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
						👥
					</div>
					<h3
						style={{
							fontSize: "1.25rem",
							marginBottom: "0.5rem",
							color: "#ededed",
						}}
					>
						Nenhum membro encontrado
					</h3>
					<p style={{ color: "#999" }}>
						Comece adicionando um novo membro da equipe
					</p>
				</div>
			) : (
				<div
					style={{
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					<table
						style={{ width: "100%", borderCollapse: "collapse" }}
					>
						<thead>
							<tr
								style={{
									background: "#0a0a0a",
									borderBottom: "1px solid #333",
								}}
							>
								<th
									style={{
										padding: "1rem",
										textAlign: "left",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Nome
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "left",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Cargo
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "left",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Criado em
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "right",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Ações
								</th>
							</tr>
						</thead>
						<tbody>
							{teamMembers.map((member) => {
								return (
									<tr
										key={member.id}
										style={{
											borderBottom: "1px solid #333",
										}}
									>
										<td
											style={{
												padding: "1rem",
												color: "#ededed",
											}}
										>
											{member.name}
										</td>
										<td
											style={{
												padding: "1rem",
												color: "#d1d5db",
											}}
										>
											{member.role}
										</td>
										<td
											style={{
												padding: "1rem",
												color: "#d1d5db",
											}}
										>
											{new Date(
												member.created_at,
											).toLocaleDateString("pt-BR")}
										</td>
										<td
											style={{
												padding: "1rem",
												textAlign: "right",
											}}
										>
											<Link
												href={`/admin/equipe/${member.id}`}
												style={{
													padding: "0.5rem 1rem",
													background: "transparent",
													border: "1px solid #333",
													borderRadius: "4px",
													color: "#ededed",
													cursor: "pointer",
													marginRight: "0.5rem",
													textDecoration: "none",
													display: "inline-block",
												}}
											>
												Visualizar
											</Link>
											<button
												style={{
													padding: "0.5rem 1rem",
													background: "transparent",
													border: "1px solid #7f1d1d",
													borderRadius: "4px",
													color: "#fca5a5",
													cursor: "pointer",
												}}
											>
												Excluir
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
