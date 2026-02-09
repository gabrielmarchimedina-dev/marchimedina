"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [checkingSession, setCheckingSession] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	useEffect(() => {
		// Verificar se já está logado
		async function checkSession() {
			try {
				const response = await fetch("/api/v1/user", {
					credentials: "include",
				});
				if (response.ok) {
					// Já está logado, redireciona pro admin
					window.location.href = "/admin";
					return;
				}
			} catch (err) {
				// Não está logado, continua
			}
			setCheckingSession(false);
		}
		checkSession();
	}, []);

	if (checkingSession) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#0a0a0a",
				}}
			>
				<p style={{ color: "#999" }}>Verificando...</p>
			</div>
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const response = await fetch("/api/v1/sessions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao fazer login");
				setLoading(false);
				return;
			}

			// Login bem-sucedido, força reload completo
			window.location.href = "/admin";
		} catch (err) {
			setError("Erro ao conectar com o servidor");
			setLoading(false);
		}
	}

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				background: "#0a0a0a",
				padding: "2rem",
			}}
		>
			<div
				style={{
					width: "100%",
					maxWidth: "28rem",
				}}
			>
				<div
					style={{
						background: "#1a1a1a",
						padding: "2.5rem",
						borderRadius: "8px",
						border: "1px solid #333",
					}}
				>
					<h1
						style={{
							marginBottom: "2rem",
							fontSize: "1.75rem",
							fontWeight: "600",
							color: "#d4af37",
						}}
					>
						Admin Login
					</h1>

					<form onSubmit={handleSubmit}>
						<div style={{ marginBottom: "1.5rem" }}>
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
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								style={{
									width: "100%",
									padding: "0.75rem",
									boxSizing: "border-box",
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

						<div style={{ marginBottom: "1.5rem" }}>
							<label
								htmlFor="password"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Senha
							</label>
							<div
								style={{ position: "relative", width: "100%" }}
							>
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
									style={{
										width: "100%",
										padding: "0.75rem",
										paddingRight: "2.5rem",
										boxSizing: "border-box",
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
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									style={{
										position: "absolute",
										right: "0.75rem",
										top: "50%",
										transform: "translateY(-50%)",
										background: "none",
										border: "none",
										color: "#999",
										cursor: "pointer",
										padding: "0.25rem",
										display: "flex",
										alignItems: "center",
									}}
								>
									{showPassword ? "👁️" : "👁️‍🗨️"}
								</button>
							</div>
						</div>

						{error && (
							<div
								style={{
									marginBottom: "1rem",
									padding: "0.75rem",
									background: "#3f1515",
									border: "1px solid #7f1d1d",
									borderRadius: "4px",
									color: "#fca5a5",
									fontSize: "0.875rem",
								}}
							>
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							style={{
								width: "100%",
								padding: "0.875rem",
								background: loading ? "#555" : "#d4af37",
								color: loading ? "#999" : "#0a0a0a",
								border: "none",
								borderRadius: "6px",
								fontSize: "1rem",
								fontWeight: "600",
								cursor: loading ? "not-allowed" : "pointer",
								transition: "all 0.2s",
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
							{loading ? "Entrando..." : "Entrar"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
