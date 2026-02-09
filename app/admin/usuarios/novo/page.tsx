"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewUserPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/v1/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao criar usuário");
				setLoading(false);
				return;
			}

			// Sucesso - redireciona para lista
			router.push("/admin/usuarios");
		} catch (err) {
			setError("Erro ao conectar com o servidor");
			setLoading(false);
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	}

	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Link
					href="/admin/usuarios"
					style={{
						color: "#d1d5db",
						textDecoration: "none",
						fontSize: "0.875rem",
						display: "inline-flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					← Voltar para usuários
				</Link>
			</div>

			<h1
				style={{
					fontSize: "1.875rem",
					fontWeight: "600",
					marginBottom: "2rem",
				}}
			>
				Novo Usuário
			</h1>

			<div
				style={{
					background: "#1a1a1a",
					border: "1px solid #333",
					borderRadius: "8px",
					padding: "3rem",
				}}
			>
				<form onSubmit={handleSubmit}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "1fr 1fr",
							gap: "2rem",
							marginBottom: "2rem",
						}}
					>
						<div>
							<label
								htmlFor="name"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Nome completo
							</label>
							<input
								id="name"
								name="name"
								type="text"
								value={formData.name}
								onChange={handleChange}
								required
								style={{
									width: "100%",
									padding: "0.75rem",
									background: "#0a0a0a",
									border: "1px solid #333",
									borderRadius: "6px",
									color: "#ededed",
									fontSize: "1rem",
									outline: "none",
									transition: "border-color 0.2s",
								}}
								onFocus={(e) =>
									(e.target.style.borderColor = "#d4af37")
								}
								onBlur={(e) =>
									(e.target.style.borderColor = "#333")
								}
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								E-mail
							</label>
							<input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
								required
								style={{
									width: "100%",
									padding: "0.75rem",
									background: "#0a0a0a",
									border: "1px solid #333",
									borderRadius: "6px",
									color: "#ededed",
									fontSize: "1rem",
									outline: "none",
									transition: "border-color 0.2s",
								}}
								onFocus={(e) =>
									(e.target.style.borderColor = "#d4af37")
								}
								onBlur={(e) =>
									(e.target.style.borderColor = "#333")
								}
							/>
						</div>
					</div>

					<p
						style={{
							fontSize: "0.875rem",
							color: "#999",
							marginBottom: "2rem",
						}}
					>
						Um e-mail será enviado para o usuário criar sua senha.
					</p>

					{error && (
						<div
							style={{
								marginBottom: "1.5rem",
								padding: "0.75rem",
								background: "#3f1515",
								border: "1px solid #7f1d1d",
								borderRadius: "6px",
								color: "#fca5a5",
								fontSize: "0.875rem",
							}}
						>
							{error}
						</div>
					)}

					<div
						style={{
							display: "flex",
							gap: "1rem",
							justifyContent: "flex-end",
						}}
					>
						<Link
							href="/admin/usuarios"
							style={{
								padding: "0.75rem 1.5rem",
								background: "transparent",
								border: "1px solid #333",
								borderRadius: "6px",
								color: "#ededed",
								textDecoration: "none",
								fontWeight: "500",
								display: "inline-block",
							}}
						>
							Cancelar
						</Link>
						<button
							type="submit"
							disabled={loading}
							style={{
								padding: "0.75rem 1.5rem",
								background: loading ? "#555" : "#d4af37",
								color: loading ? "#999" : "#0a0a0a",
								border: "none",
								borderRadius: "6px",
								fontWeight: "600",
								cursor: loading ? "not-allowed" : "pointer",
								transition: "background 0.2s",
							}}
							onMouseEnter={(e) => {
								if (!loading)
									e.currentTarget.style.background =
										"#b8860b";
							}}
							onMouseLeave={(e) => {
								if (!loading)
									e.currentTarget.style.background =
										"#d4af37";
							}}
						>
							{loading ? "Criando..." : "Criar Usuário"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
