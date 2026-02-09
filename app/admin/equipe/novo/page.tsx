"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NewTeamMemberPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		oab_number: "",
		education: "",
		lattes_url: "",
		bio: "",
		languages: "",
		role: "",
		instagram: "",
		linkedin: "",
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			// Cria FormData com todos os campos
			const submitFormData = new FormData();
			submitFormData.append("name", formData.name);
			submitFormData.append("role", formData.role);

			if (formData.email) submitFormData.append("email", formData.email);
			if (formData.oab_number)
				submitFormData.append("oab_number", formData.oab_number);
			if (formData.education)
				submitFormData.append("education", formData.education);
			if (formData.lattes_url)
				submitFormData.append("lattes_url", formData.lattes_url);
			if (formData.bio) submitFormData.append("bio", formData.bio);
			if (formData.languages)
				submitFormData.append("languages", formData.languages);
			if (formData.instagram)
				submitFormData.append("instagram", formData.instagram);
			if (formData.linkedin)
				submitFormData.append("linkedin", formData.linkedin);

			// Adiciona o arquivo se foi selecionado
			if (selectedFile) {
				submitFormData.append("file", selectedFile);
			}

			const response = await fetch("/api/v1/team-members", {
				method: "POST",
				credentials: "include",
				body: submitFormData,
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao criar membro da equipe");
				setLoading(false);
				return;
			}

			// Sucesso - redireciona para lista
			router.push("/admin/equipe");
		} catch (err) {
			setError("Erro ao conectar com o servidor");
			setLoading(false);
		}
	}

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			// Criar preview da imagem
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	}

	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Link
					href="/admin/equipe"
					style={{
						color: "#d1d5db",
						textDecoration: "none",
						fontSize: "0.875rem",
						display: "inline-flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					← Voltar para equipe
				</Link>
			</div>

			<h1
				style={{
					fontSize: "1.875rem",
					fontWeight: "600",
					marginBottom: "2rem",
				}}
			>
				Novo Membro da Equipe
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
								Nome completo *
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
								htmlFor="role"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Cargo *
							</label>
							<input
								id="role"
								name="role"
								type="text"
								value={formData.role}
								onChange={handleChange}
								required
								placeholder="Ex: Sócio-fundador, Advogado"
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
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleChange}
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
								htmlFor="oab_number"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Número OAB
							</label>
							<input
								id="oab_number"
								name="oab_number"
								type="text"
								value={formData.oab_number}
								onChange={handleChange}
								placeholder="Ex: SP 123.456"
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

					<div style={{ marginBottom: "2rem" }}>
						<label
							htmlFor="photo"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							Foto
						</label>
						<input
							id="photo"
							name="photo"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
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
							}}
						/>
						{previewUrl && (
							<div style={{ marginTop: "1rem" }}>
								<Image
									src={previewUrl}
									alt="Preview"
									width={200}
									height={200}
									style={{
										maxWidth: "200px",
										maxHeight: "200px",
										borderRadius: "8px",
										border: "1px solid #333",
									}}
								/>
							</div>
						)}
					</div>

					<div style={{ marginBottom: "2rem" }}>
						<label
							htmlFor="education"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							Formação
						</label>
						<textarea
							id="education"
							name="education"
							value={formData.education}
							onChange={handleChange}
							rows={3}
							placeholder="Ex: Bacharel em Direito pela USP, Mestrado em..."
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
								resize: "vertical",
								fontFamily: "inherit",
							}}
							onFocus={(e) =>
								(e.target.style.borderColor = "#d4af37")
							}
							onBlur={(e) =>
								(e.target.style.borderColor = "#333")
							}
						/>
					</div>

					<div style={{ marginBottom: "2rem" }}>
						<label
							htmlFor="bio"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							Biografia
						</label>
						<textarea
							id="bio"
							name="bio"
							value={formData.bio}
							onChange={handleChange}
							rows={6}
							placeholder="Descreva a experiência e especialidades..."
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
								resize: "vertical",
								fontFamily: "inherit",
							}}
							onFocus={(e) =>
								(e.target.style.borderColor = "#d4af37")
							}
							onBlur={(e) =>
								(e.target.style.borderColor = "#333")
							}
						/>
					</div>

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
								htmlFor="languages"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Idiomas
							</label>
							<input
								id="languages"
								name="languages"
								type="text"
								value={formData.languages}
								onChange={handleChange}
								placeholder="Ex: Português, Inglês, Espanhol"
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
							<p
								style={{
									marginTop: "0.25rem",
									fontSize: "0.75rem",
									color: "#999",
								}}
							>
								Separe por vírgula
							</p>
						</div>

						<div>
							<label
								htmlFor="lattes_url"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Currículo Lattes
							</label>
							<input
								id="lattes_url"
								name="lattes_url"
								type="url"
								value={formData.lattes_url}
								onChange={handleChange}
								placeholder="https://lattes.cnpq.br/..."
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
								htmlFor="instagram"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Instagram
							</label>
							<input
								id="instagram"
								name="instagram"
								type="text"
								value={formData.instagram}
								onChange={handleChange}
								placeholder="@usuario"
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
								htmlFor="linkedin"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								LinkedIn
							</label>
							<input
								id="linkedin"
								name="linkedin"
								type="text"
								value={formData.linkedin}
								onChange={handleChange}
								placeholder="linkedin.com/in/usuario"
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

					<div style={{ display: "flex", gap: "1rem" }}>
						<button
							type="submit"
							disabled={loading}
							style={{
								padding: "0.75rem 1.5rem",
								background: loading ? "#999" : "#d4af37",
								color: "#0a0a0a",
								border: "none",
								borderRadius: "6px",
								fontWeight: "600",
								cursor: loading ? "not-allowed" : "pointer",
								transition: "background 0.2s",
							}}
						>
							{loading ? "Criando..." : "Criar Membro"}
						</button>
						<Link
							href="/admin/equipe"
							style={{
								padding: "0.75rem 1.5rem",
								background: "transparent",
								color: "#d1d5db",
								border: "1px solid #333",
								borderRadius: "6px",
								fontWeight: "600",
								cursor: "pointer",
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
