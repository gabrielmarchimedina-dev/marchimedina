"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ActivateAccountPage({
	params,
}: {
	params: Promise<{ token_id: string }>;
}) {
	const router = useRouter();
	const [tokenId, setTokenId] = useState("");
	const [formData, setFormData] = useState({
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [checkingAuth, setCheckingAuth] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	useEffect(() => {
		params.then((p) => setTokenId(p.token_id));
	}, [params]);

	useEffect(() => {
		// Verifica se está logado e se tem permissão para ativar
		async function checkAuth() {
			try {
				const response = await fetch("/api/v1/user", {
					credentials: "include",
				});

				if (response.ok) {
					const user = await response.json();
					// Se está logado mas NÃO tem a feature de ativação, redireciona
					if (!user.features.includes("read:activation_token")) {
						window.location.href = "/admin";
						return;
					}
				}
			} catch (err) {
				// Não está logado ou erro, deixa continuar
			}
			setCheckingAuth(false);
		}
		checkAuth();
	}, []);

	if (checkingAuth) {
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

		if (formData.password !== formData.confirmPassword) {
			setError("As senhas não coincidem");
			setLoading(false);
			return;
		}

		if (formData.password.length < 8) {
			setError("A senha deve ter no mínimo 8 caracteres");
			setLoading(false);
			return;
		}

		try {
			const response = await fetch(`/api/v1/activations/${tokenId}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao ativar conta");
				setLoading(false);
				return;
			}

			setSuccess(true);
			setTimeout(() => {
				router.push("/");
			}, 3000);
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

	if (success) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#0a0a0a",
					padding: "2rem",
				}}
			>
				<div
					style={{
						maxWidth: "28rem",
						width: "100%",
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: "8px",
						padding: "3rem",
						textAlign: "center",
					}}
				>
					<div
						style={{
							width: "4rem",
							height: "4rem",
							background: "#15803d",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "0 auto 1.5rem",
						}}
					>
						<span style={{ fontSize: "2rem" }}>✓</span>
					</div>
					<h1
						style={{
							fontSize: "1.5rem",
							fontWeight: "600",
							marginBottom: "1rem",
							color: "#ededed",
						}}
					>
						Conta ativada com sucesso!
					</h1>
					<p
						style={{
							color: "#999",
							marginBottom: "2rem",
						}}
					>
						Sua senha foi definida. Você será redirecionado em
						alguns segundos...
					</p>
					<Link
						href="/"
						style={{
							display: "inline-block",
							padding: "0.75rem 1.5rem",
							background: "#d4af37",
							color: "#0a0a0a",
							borderRadius: "6px",
							textDecoration: "none",
							fontWeight: "600",
						}}
					>
						Ir para a página inicial
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				height: "100vh",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#0a0a0a",
				padding: "1rem",
				overflow: "hidden",
			}}
		>
			<div
				style={{
					maxWidth: "28rem",
					width: "100%",
				}}
			>
				<div
					style={{
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: "8px",
						padding: "2rem",
					}}
				>
					<div
						style={{ textAlign: "center", marginBottom: "1.5rem" }}
					>
						<h1
							style={{
								fontSize: "1.875rem",
								fontWeight: "600",
								marginBottom: "0.5rem",
								color: "#ededed",
							}}
						>
							Finalize seu cadastro
						</h1>
						<p style={{ color: "#999" }}>
							Crie sua senha para acessar o sistema
						</p>
					</div>
					<form onSubmit={handleSubmit}>
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
									name="password"
									type={showPassword ? "text" : "password"}
									value={formData.password}
									onChange={handleChange}
									required
									minLength={8}
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
							<p
								style={{
									fontSize: "0.75rem",
									color: "#999",
									marginTop: "0.5rem",
								}}
							>
								Mínimo de 8 caracteres
							</p>
						</div>

						<div style={{ marginBottom: "2rem" }}>
							<label
								htmlFor="confirmPassword"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Confirmar senha
							</label>
							<div
								style={{ position: "relative", width: "100%" }}
							>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={
										showConfirmPassword
											? "text"
											: "password"
									}
									value={formData.confirmPassword}
									onChange={handleChange}
									required
									minLength={8}
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
										setShowConfirmPassword(
											!showConfirmPassword,
										)
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
									{showConfirmPassword ? "👁️" : "👁️‍🗨️"}
								</button>
							</div>
						</div>

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

						<button
							type="submit"
							disabled={loading}
							style={{
								width: "100%",
								padding: "0.75rem",
								background: loading ? "#555" : "#d4af37",
								color: loading ? "#999" : "#0a0a0a",
								border: "none",
								borderRadius: "6px",
								fontWeight: "600",
								fontSize: "1rem",
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
							{loading ? "Ativando..." : "Ativar conta"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
