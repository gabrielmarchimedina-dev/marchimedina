"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TrocarSenhaPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmNewPassword: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			// Buscar informações do usuário atual
			const userResponse = await fetch("/api/v1/user", {
				method: "GET",
				credentials: "include",
			});

			if (!userResponse.ok) {
				throw new Error("Não foi possível obter suas informações.");
			}

			const userData = await userResponse.json();

			// Fazer a requisição para trocar a senha
			const response = await fetch(
				`/api/v1/users/${userData.id}/update-password`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify(formData),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Erro ao trocar a senha.");
			}

			setSuccess("Senha alterada com sucesso!");
			setFormData({
				currentPassword: "",
				newPassword: "",
				confirmNewPassword: "",
			});

			// Redirecionar após 2 segundos
			setTimeout(() => {
				router.push("/admin");
			}, 2000);
		} catch (err: any) {
			setError(err.message || "Erro ao trocar a senha.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div
			style={{
				maxWidth: "500px",
				margin: "0 auto",
			}}
		>
			<h1
				style={{
					fontSize: "1.875rem",
					fontWeight: "600",
					color: "#d4af37",
					marginBottom: "2rem",
				}}
			>
				Trocar Senha
			</h1>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "1.5rem" }}>
					<label
						htmlFor="currentPassword"
						style={{
							display: "block",
							marginBottom: "0.5rem",
							color: "#d1d5db",
						}}
					>
						Senha Atual
					</label>
					<input
						type="password"
						id="currentPassword"
						value={formData.currentPassword}
						onChange={(e) =>
							setFormData({
								...formData,
								currentPassword: e.target.value,
							})
						}
						required
						style={{
							width: "100%",
							padding: "0.75rem",
							background: "#1a1a1a",
							border: "1px solid #333",
							borderRadius: "6px",
							color: "#ededed",
							fontSize: "1rem",
						}}
					/>
				</div>

				<div style={{ marginBottom: "1.5rem" }}>
					<label
						htmlFor="newPassword"
						style={{
							display: "block",
							marginBottom: "0.5rem",
							color: "#d1d5db",
						}}
					>
						Nova Senha
					</label>
					<input
						type="password"
						id="newPassword"
						value={formData.newPassword}
						onChange={(e) =>
							setFormData({
								...formData,
								newPassword: e.target.value,
							})
						}
						required
						style={{
							width: "100%",
							padding: "0.75rem",
							background: "#1a1a1a",
							border: "1px solid #333",
							borderRadius: "6px",
							color: "#ededed",
							fontSize: "1rem",
						}}
					/>
				</div>

				<div style={{ marginBottom: "1.5rem" }}>
					<label
						htmlFor="confirmNewPassword"
						style={{
							display: "block",
							marginBottom: "0.5rem",
							color: "#d1d5db",
						}}
					>
						Confirmar Nova Senha
					</label>
					<input
						type="password"
						id="confirmNewPassword"
						value={formData.confirmNewPassword}
						onChange={(e) =>
							setFormData({
								...formData,
								confirmNewPassword: e.target.value,
							})
						}
						required
						style={{
							width: "100%",
							padding: "0.75rem",
							background: "#1a1a1a",
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

				<button
					type="submit"
					disabled={loading}
					style={{
						width: "100%",
						padding: "0.75rem",
						background: loading ? "#666" : "#d4af37",
						color: "#0a0a0a",
						border: "none",
						borderRadius: "6px",
						fontSize: "1rem",
						fontWeight: "600",
						cursor: loading ? "not-allowed" : "pointer",
						transition: "background 0.2s",
					}}
				>
					{loading ? "Alterando..." : "Alterar Senha"}
				</button>
			</form>
		</div>
	);
}
