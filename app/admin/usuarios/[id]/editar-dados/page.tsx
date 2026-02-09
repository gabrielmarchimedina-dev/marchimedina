"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type User = {
	id: string;
	name: string;
	email: string;
};

export default function EditUserDataPage() {
	const params = useParams();
	const router = useRouter();
	const userId = params.id as string;
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
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
					setFormData({
						name: data.name,
						email: data.email,
					});
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

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSuccess("");
		setSubmitting(true);

		try {
			const response = await fetch(`/api/v1/users/${userId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.message || "Erro ao atualizar usuário.",
				);
			}

			setSuccess("Dados atualizados com sucesso!");
			setTimeout(() => {
				router.push(`/admin/usuarios/${userId}`);
			}, 1500);
		} catch (err: any) {
			setError(err.message || "Erro ao atualizar usuário.");
		} finally {
			setSubmitting(false);
		}
	}

	if (loading) {
		return <div>Carregando...</div>;
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
					Editar Dados do Usuário
				</h1>
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
						<label
							htmlFor="name"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#d1d5db",
							}}
						>
							Nome
						</label>
						<input
							type="text"
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData({
									...formData,
									name: e.target.value,
								})
							}
							required
							style={{
								width: "100%",
								padding: "0.75rem",
								background: "#0a0a0a",
								border: "1px solid #333",
								borderRadius: "6px",
								color: "#ededed",
								fontSize: "1rem",
							}}
						/>
					</div>

					<div style={{ marginBottom: "1.5rem" }}>
						<label
							htmlFor="email"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								color: "#d1d5db",
							}}
						>
							Email
						</label>
						<input
							type="email"
							id="email"
							value={formData.email}
							onChange={(e) =>
								setFormData({
									...formData,
									email: e.target.value,
								})
							}
							required
							style={{
								width: "100%",
								padding: "0.75rem",
								background: "#0a0a0a",
								border: "1px solid #333",
								borderRadius: "6px",
								color: "#ededed",
								fontSize: "1rem",
							}}
						/>
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
							{submitting ? "Salvando..." : "Salvar Alterações"}
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
