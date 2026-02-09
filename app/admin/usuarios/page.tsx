"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = {
	id: string;
	name: string;
	email: string;
	features: string[];
	created_at: string;
};

export default function UsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUsers() {
			try {
				const response = await fetch("/api/v1/users", {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setUsers(data);
				}
			} catch (error) {
				console.error("Erro ao buscar usuários:", error);
			} finally {
				setLoading(false);
			}
		}

		fetchUsers();
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
					Usuários
				</h1>
				<Link
					href="/admin/usuarios/novo"
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
					+ Novo Usuário
				</Link>
			</div>

			{users.length === 0 ? (
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
						Nenhum usuário encontrado
					</h3>
					<p style={{ color: "#999" }}>
						Comece criando um novo usuário
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
									Email
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "center",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Status
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
							{users.map((user) => {
								const isActive = !user.features.includes(
									"read:activation_token",
								);
								return (
									<tr
										key={user.id}
										style={{
											borderBottom: "1px solid #333",
										}}
									>
										<td style={{ padding: "1rem" }}>
											{user.name}
										</td>
										<td
											style={{
												padding: "1rem",
												color: "#d1d5db",
											}}
										>
											{user.email}
										</td>
										<td
											style={{
												padding: "1rem",
												textAlign: "center",
											}}
										>
											<span
												style={{
													display: "inline-flex",
													alignItems: "center",
													gap: "0.5rem",
													padding: "0.25rem 0.75rem",
													borderRadius: "9999px",
													fontSize: "0.875rem",
													fontWeight: "500",
													background: isActive
														? "#15803d"
														: "#854d0e",
													color: isActive
														? "#86efac"
														: "#fde047",
												}}
											>
												{isActive ? "✓" : "○"}{" "}
												{isActive
													? "Ativo"
													: "Pendente"}
											</span>
										</td>
										<td
											style={{
												padding: "1rem",
												color: "#d1d5db",
											}}
										>
											{new Date(
												user.created_at,
											).toLocaleDateString("pt-BR")}
										</td>
										<td
											style={{
												padding: "1rem",
												textAlign: "right",
											}}
										>
											<Link
												href={`/admin/usuarios/${user.id}`}
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
