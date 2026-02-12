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

type ConfirmModalProps = {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
};

function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	onConfirm,
	onCancel,
	isLoading = false,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0, 0, 0, 0.7)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
			}}
			onClick={onCancel}
		>
			<div
				style={{
					background: "#1a1a1a",
					border: "1px solid #333",
					borderRadius: "12px",
					padding: "2rem",
					maxWidth: "400px",
					width: "90%",
					boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h3
					style={{
						fontSize: "1.25rem",
						fontWeight: "600",
						color: "#ededed",
						marginBottom: "1rem",
					}}
				>
					{title}
				</h3>

				<p
					style={{
						color: "#d1d5db",
						marginBottom: "1.5rem",
						lineHeight: "1.5",
					}}
				>
					{message}
				</p>

				<div
					style={{
						display: "flex",
						gap: "0.75rem",
						justifyContent: "flex-end",
					}}
				>
					<button
						onClick={onCancel}
						disabled={isLoading}
						style={{
							padding: "0.75rem 1.5rem",
							background: "transparent",
							border: "1px solid #333",
							borderRadius: "6px",
							color: "#ededed",
							cursor: isLoading ? "not-allowed" : "pointer",
							fontWeight: "500",
							transition: "all 0.2s",
						}}
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						style={{
							padding: "0.75rem 1.5rem",
							background: "#7f1d1d",
							border: "none",
							borderRadius: "6px",
							color: "#fca5a5",
							cursor: isLoading ? "not-allowed" : "pointer",
							fontWeight: "600",
							transition: "all 0.2s",
							opacity: isLoading ? 0.7 : 1,
						}}
					>
						{isLoading ? "Desativando..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function TeamMembersPage() {
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(
		null,
	);

	useEffect(() => {
		fetchTeamMembers();
	}, []);

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

	function openDeleteModal(member: TeamMember) {
		setMemberToDelete(member);
	}

	function closeDeleteModal() {
		if (!deletingId) {
			setMemberToDelete(null);
		}
	}

	async function handleConfirmDelete() {
		if (!memberToDelete) return;

		setDeletingId(memberToDelete.id);

		try {
			const response = await fetch(
				`/api/v1/team-members/${memberToDelete.id}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (response.ok) {
				setTeamMembers((prev) =>
					prev.map((m) =>
						m.id === memberToDelete.id
							? { ...m, active: false }
							: m,
					),
				);
				setMemberToDelete(null);
			} else {
				const error = await response.json();
				alert(error.message || "Erro ao desativar membro");
			}
		} catch (error) {
			console.error("Erro ao desativar membro:", error);
			alert("Erro ao desativar membro");
		} finally {
			setDeletingId(null);
		}
	}

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
											}}
										>
											<span
												style={{
													padding: "0.25rem 0.75rem",
													borderRadius: "9999px",
													fontSize: "0.75rem",
													fontWeight: "500",
													background: member.active
														? "#14532d"
														: "#7f1d1d",
													color: member.active
														? "#86efac"
														: "#fca5a5",
												}}
											>
												{member.active
													? "Ativo"
													: "Inativo"}
											</span>
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
												onClick={() =>
													openDeleteModal(member)
												}
												disabled={
													!member.active ||
													deletingId === member.id
												}
												style={{
													padding: "0.5rem 1rem",
													background: "transparent",
													border: member.active
														? "1px solid #7f1d1d"
														: "1px solid #333",
													borderRadius: "4px",
													color: member.active
														? "#fca5a5"
														: "#666",
													cursor: member.active
														? "pointer"
														: "not-allowed",
													opacity:
														deletingId === member.id
															? 0.5
															: 1,
												}}
											>
												Desativar
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<ConfirmModal
				isOpen={memberToDelete !== null}
				title="Desativar membro"
				message={`Tem certeza que deseja desativar "${memberToDelete?.name}"? O membro não aparecerá mais no site público.`}
				confirmText="Desativar"
				cancelText="Cancelar"
				onConfirm={handleConfirmDelete}
				onCancel={closeDeleteModal}
				isLoading={deletingId !== null}
			/>
		</div>
	);
}
