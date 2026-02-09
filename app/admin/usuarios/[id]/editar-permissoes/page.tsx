"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type User = {
	id: string;
	name: string;
	email: string;
	features: string[];
};

// Todas as permissões disponíveis
const ALL_FEATURES = [
	"create:session",
	"read:session",
	"delete:session",
	"read:user",
	"read:user:self",
	"read:user:other",
	"create:user",
	"update:user",
	"update:user:other",
	"update:user:self",
	"update:user:password",
	"update:user:features",
	"read:team_member",
	"create:team_member",
	"read:activation_token",
];

// Permissões padrão (não editáveis)
const DEFAULT_USER_FEATURES = [
	"create:session",
	"delete:session",
	"read:session",
	"read:user",
	"read:user:self",
	"update:user",
	"update:user:self",
	"update:user:password",
	"read:team_member",
];

// Permissões anônimas (não editáveis)
const ANONYMOUS_FEATURES = [
	"read:activation_token",
	"create:session",
	"read:team_member",
];

// Permissões extras que podem ser adicionadas/removidas
const EDITABLE_FEATURES = ALL_FEATURES.filter(
	(feature) =>
		!DEFAULT_USER_FEATURES.includes(feature) &&
		!ANONYMOUS_FEATURES.includes(feature),
);

const FEATURE_LABELS: Record<string, string> = {
	"read:user:other": "Ler dados de outros usuários",
	"create:user": "Criar novos usuários",
	"update:user:other": "Editar outros usuários",
	"update:user:features": "Gerenciar permissões de usuários (Gerente)",
	"create:team_member": "Criar membros da equipe",
};

export default function EditUserPermissionsPage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;
	const [user, setUser] = useState<User | null>(null);
	const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	useEffect(() => {
		async function fetchUser() {
			try {
				const response = await fetch(`/api/v1/users/${userId}`, {
					credentials: "include",
				});
				if (response.ok) {
					const data: User = await response.json();
					setUser(data);
					// Selecionar apenas as permissões extras que o usuário já tem
					const extraFeatures = data.features.filter((feature) =>
						EDITABLE_FEATURES.includes(feature),
					);
					setSelectedFeatures(extraFeatures);
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

	function handleToggleFeature(feature: string) {
		setSelectedFeatures((prev) => {
			if (prev.includes(feature)) {
				return prev.filter((f) => f !== feature);
			} else {
				return [...prev, feature];
			}
		});
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSuccess("");
		setSubmitting(true);

		try {
			// Combinar permissões padrão com as selecionadas
			const finalFeatures = [
				...DEFAULT_USER_FEATURES,
				...selectedFeatures,
			];

			const response = await fetch(
				`/api/v1/users/${userId}/update-features`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({ features: finalFeatures }),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Erro ao atualizar permissões.",
				);
			}

			setSuccess("Permissões atualizadas com sucesso!");
			setTimeout(() => {
				router.push(`/admin/usuarios/${userId}`);
			}, 1500);
		} catch (err: any) {
			setError(err.message || "Erro ao atualizar permissões.");
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return <div>Carregando...</div>;
	}

	if (!user) {
		return null;
	}

	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Link
					href={`/admin/usuarios/${userId}`}
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
					Editar Permissões
				</h1>
				<p style={{ color: "#999", marginTop: "0.5rem" }}>
					{user.name} ({user.email})
				</p>
			</div>

			<div
				style={{
					background: "#1a1a1a",
					border: "1px solid #333",
					borderRadius: "8px",
					padding: "2rem",
					maxWidth: "600px",
				}}
			>
				<form onSubmit={handleSubmit}>
					<div style={{ marginBottom: "1.5rem" }}>
						<h2
							style={{
								fontSize: "1.125rem",
								fontWeight: "600",
								marginBottom: "1rem",
								color: "#d4af37",
							}}
						>
							Permissões Extras
						</h2>
						<p
							style={{
								color: "#999",
								fontSize: "0.875rem",
								marginBottom: "1rem",
							}}
						>
							As permissões padrão já estão incluídas
							automaticamente. Selecione permissões adicionais
							abaixo:
						</p>

						<div
							style={{
								display: "grid",
								gap: "0.75rem",
							}}
						>
							{EDITABLE_FEATURES.map((feature) => (
								<label
									key={feature}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.75rem",
										padding: "0.75rem",
										background: "#0a0a0a",
										border: "1px solid #333",
										borderRadius: "6px",
										cursor: "pointer",
									}}
								>
									<input
										type="checkbox"
										checked={selectedFeatures.includes(
											feature,
										)}
										onChange={() =>
											handleToggleFeature(feature)
										}
										style={{
											width: "1.25rem",
											height: "1.25rem",
											cursor: "pointer",
										}}
									/>
									<div
										style={{
											color: "#ededed",
											fontWeight: "500",
										}}
									>
										{FEATURE_LABELS[feature] || feature}
									</div>
								</label>
							))}
						</div>
					</div>

					{error && (
						<div
							style={{
								padding: "0.75rem",
								marginBottom: "1rem",
								background: "#dc2626",
								color: "#fff",
								borderRadius: "6px",
							}}
						>
							{error}
						</div>
					)}

					{success && (
						<div
							style={{
								padding: "0.75rem",
								marginBottom: "1rem",
								background: "#16a34a",
								color: "#fff",
								borderRadius: "6px",
							}}
						>
							{success}
						</div>
					)}

					<div style={{ display: "flex", gap: "1rem" }}>
						<button
							type="submit"
							disabled={submitting}
							style={{
								padding: "0.75rem 1.5rem",
								background: submitting ? "#666" : "#d4af37",
								color: "#0a0a0a",
								border: "none",
								borderRadius: "6px",
								fontSize: "1rem",
								fontWeight: "600",
								cursor: submitting ? "not-allowed" : "pointer",
							}}
						>
							{submitting ? "Salvando..." : "Salvar Permissões"}
						</button>
						<Link
							href={`/admin/usuarios/${userId}`}
							style={{
								padding: "0.75rem 1.5rem",
								background: "transparent",
								color: "#d1d5db",
								border: "1px solid #333",
								borderRadius: "6px",
								fontSize: "1rem",
								fontWeight: "600",
								textDecoration: "none",
								display: "inline-block",
							}}
						>
							Cancelar
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
