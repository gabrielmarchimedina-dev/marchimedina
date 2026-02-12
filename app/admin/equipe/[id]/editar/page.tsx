"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getImageSrc } from "@/lib/imageUrl";

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
	updated_at: string;
};

export default function EditTeamMemberPage() {
	const params = useParams();
	const router = useRouter();
	const memberId = params.id as string;
	const [member, setMember] = useState<TeamMember | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		oab_number: "",
		education: "",
		lattes_url: "",
		bio: "",
		languages: "",
		image_url: "",
		role: "",
		instagram: "",
		linkedin: "",
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [fetchLoading, setFetchLoading] = useState(true);

	useEffect(() => {
		async function fetchMember() {
			try {
				const response = await fetch(
					`/api/v1/team-members/${memberId}`,
					{
						credentials: "include",
					},
				);
				if (response.ok) {
					const data = await response.json();
					setMember(data);
					setFormData({
						name: data.name,
						email: data.email || "",
						oab_number: data.oab_number || "",
						education: data.education || "",
						lattes_url: data.lattes_url || "",
						bio: data.bio || "",
						languages: data.languages
							? data.languages.join(", ")
							: "",
						image_url: data.image_url,
						role: data.role,
						instagram: data.instagram || "",
						linkedin: data.linkedin || "",
					});
				} else {
					router.push("/admin/equipe");
				}
			} catch (error) {
				console.error("Erro ao buscar membro:", error);
				router.push("/admin/equipe");
			} finally {
				setFetchLoading(false);
			}
		}

		fetchMember();
	}, [memberId, router]);

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

			const response = await fetch(`/api/v1/team-members/${memberId}`, {
				method: "PATCH",
				credentials: "include",
				body: submitFormData,
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao atualizar membro da equipe");
				setLoading(false);
				return;
			}

			// Sucesso - redireciona para visualização
			router.push(`/admin/equipe/${memberId}`);
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

	if (fetchLoading) {
		return <div>Carregando...</div>;
	}

	if (!member) {
		return null;
	}

	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Link
					href={`/admin/equipe/${memberId}`}
					style={{
						color: "#d1d5db",
						textDecoration: "none",
						fontSize: "0.875rem",
						display: "inline-flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					← Voltar
				</Link>
			</div>

			<h1
				style={{
					fontSize: "1.875rem",
					fontWeight: "600",
					marginBottom: "2rem",
				}}
			>
				Editar Membro da Equipe
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
					{/* Seção de Imagem */}
					<div style={{ marginBottom: "2rem" }}>
						<label
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							Foto Atual
						</label>
						<div style={{ marginBottom: "1rem" }}>
							<Image
								src={getImageSrc(formData.image_url)}
								alt="Foto atual"
								width={120}
								height={120}
								style={{
									width: "120px",
									height: "120px",
									borderRadius: "50%",
									objectFit: "cover",
									border: "3px solid #d4af37",
								}}
							/>
						</div>

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
							Alterar Foto (opcional)
						</label>
						<input
							id="photo"
							name="photo"
							type="file"
							accept="image/*"
							onChange={handleFileChange}
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
								<p
									style={{
										fontSize: "0.875rem",
										color: "#d1d5db",
										marginBottom: "0.5rem",
									}}
								>
									Nova foto (preview):
								</p>
								<Image
									src={previewUrl}
									alt="Preview"
									width={120}
									height={120}
									style={{
										width: "120px",
										height: "120px",
										borderRadius: "50%",
										objectFit: "cover",
										border: "3px solid #22c55e",
									}}
								/>
							</div>
						)}
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
							{loading ? "Salvando..." : "Salvar Alterações"}
						</button>
						<Link
							href={`/admin/equipe/${memberId}`}
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
