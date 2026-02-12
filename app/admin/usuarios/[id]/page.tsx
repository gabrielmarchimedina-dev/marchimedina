"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type User = {
	id: string;
	name: string;
	email: string;
	features: string[];
	created_at: string;
	updated_at: string;
};

export default function ViewUserPage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUser() {
			try {
				const response = await fetch(`/api/v1/users/${userId}`, {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setUser(data);
				} else {
					router.push("/admin/usuarios");
				}
			} catch (error) {
				console.error("Erro ao buscar usuário:", error);
				router.push("/admin/usuarios");
			} finally {
				setLoading(false);
			}
		}

		fetchUser();
	}, [userId, router]);

	if (loading) {
		return <div>Carregando...</div>;
	}

	if (!user) {
		return null;
	}

	// Filtrar permissões que não são padrão nem anônimas
	const defaultFeatures = [
		"create:session",
		"delete:session",
		"read:session",
		"read:user",
		"read:user:self",
		"update:user",
		"update:user:self",
		"update:user:password",
		"read:team_member",
		"read:article",
	];

	const anonymousFeatures = [
		"read:activation_token",
		"create:session",
		"read:team_member",
		"read:article",
	];

	const allStandardFeatures = [
		...new Set([...defaultFeatures, ...anonymousFeatures]),
	];

	const extraFeatures = user.features.filter(
		(feature) => !allStandardFeatures.includes(feature),
	);

	const FEATURE_LABELS: Record<string, string> = {
		"read:user:other": "Ler dados de outros usuários",
		"create:user": "Criar novos usuários",
		"update:user:other": "Editar outros usuários",
		"update:user:features": "Gerenciar permissões de usuários (Gerente)",
		"create:team_member": "Criar membros da equipe",
		"is:admin": "Administrador",
	};

	const isActive = !user.features.includes("read:activation_token");

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
						href="/admin/usuarios"
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
						Visualizar Usuário
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
					Dados do Usuário
				</h2>

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
							{user.name}
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
							Email
						</label>
						<p style={{ fontSize: "1rem", color: "#ededed" }}>
							{user.email}
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
							Status
						</label>
						<span
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "0.5rem",
								padding: "0.25rem 0.75rem",
								borderRadius: "9999px",
								fontSize: "0.875rem",
								fontWeight: "500",
								background: isActive ? "#15803d" : "#854d0e",
								color: isActive ? "#86efac" : "#fde047",
							}}
						>
							{isActive ? "✓" : "○"}{" "}
							{isActive ? "Ativo" : "Pendente"}
						</span>
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
							Criado em
						</label>
						<p style={{ fontSize: "1rem", color: "#ededed" }}>
							{new Date(user.created_at).toLocaleString("pt-BR")}
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
							{new Date(user.updated_at).toLocaleString("pt-BR")}
						</p>
					</div>
				</div>

				<div style={{ marginTop: "1.5rem" }}>
					<Link
						href={`/admin/usuarios/${userId}/editar-dados`}
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
						Editar Dados
					</Link>
				</div>
			</div>

			<div
				style={{
					background: "#1a1a1a",
					border: "1px solid #333",
					borderRadius: "8px",
					padding: "2rem",
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
					Permissões Extras
				</h2>

				{extraFeatures.length === 0 ? (
					<p style={{ color: "#999" }}>
						Este usuário possui apenas as permissões padrão.
					</p>
				) : (
					<div style={{ marginBottom: "1.5rem" }}>
						<ul
							style={{
								listStyle: "none",
								padding: 0,
								display: "grid",
								gap: "0.5rem",
							}}
						>
							{extraFeatures.map((feature) => (
								<li
									key={feature}
									style={{
										padding: "0.5rem 1rem",
										background: "#0a0a0a",
										border: "1px solid #333",
										borderRadius: "4px",
										color: "#d1d5db",
									}}
								>
									{FEATURE_LABELS[feature] || feature}
								</li>
							))}
						</ul>
					</div>
				)}

				<div style={{ marginTop: "1.5rem" }}>
					<Link
						href={`/admin/usuarios/${userId}/editar-permissoes`}
						style={{
							padding: "0.75rem 1.5rem",
							background: "transparent",
							color: "#d4af37",
							border: "1px solid #d4af37",
							borderRadius: "6px",
							fontWeight: "600",
							cursor: "pointer",
							textDecoration: "none",
							display: "inline-block",
						}}
					>
						Editar Permissões
					</Link>
				</div>
			</div>
		</div>
	);
}
