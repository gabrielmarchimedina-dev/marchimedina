"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type TeamMember = {
	id: string;
	name: string;
	image_url: string;
};

export default function NewArticlePage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		title: "",
		subtitle: "",
		text: "",
		active: true,
		language: "portugues" as "portugues" | "ingles" | "frances",
	});
	const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [authorSearch, setAuthorSearch] = useState("");
	const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
	const authorDropdownRef = useRef<HTMLDivElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
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
			}
		}
		fetchTeamMembers();
	}, []);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				authorDropdownRef.current &&
				!authorDropdownRef.current.contains(event.target as Node)
			) {
				setAuthorDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const submitFormData = new FormData();
			submitFormData.append("title", formData.title);
			submitFormData.append("subtitle", formData.subtitle);
			submitFormData.append("text", formData.text);
			submitFormData.append("active", formData.active ? "true" : "false");
			submitFormData.append("language", formData.language);
			if (selectedAuthors.length > 0) {
				submitFormData.append(
					"authors",
					JSON.stringify(selectedAuthors),
				);
			}

			if (selectedFile) {
				submitFormData.append("file", selectedFile);
			}

			const response = await fetch("/api/v1/articles", {
				method: "POST",
				credentials: "include",
				body: submitFormData,
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao criar artigo");
				setLoading(false);
				return;
			}

			router.push("/admin/artigos");
		} catch (err) {
			setError("Erro ao conectar com o servidor");
			setLoading(false);
		}
	}

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	}

	function handleCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
		setFormData((prev) => ({
			...prev,
			active: e.target.checked,
		}));
	}

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPreviewUrl(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	}

	function handleLanguageChange(e: React.ChangeEvent<HTMLSelectElement>) {
		setFormData((prev) => ({
			...prev,
			language: e.target.value as "portugues" | "ingles" | "frances",
		}));
	}

	function toggleAuthor(authorId: string) {
		setSelectedAuthors((prev) =>
			prev.includes(authorId)
				? prev.filter((id) => id !== authorId)
				: [...prev, authorId],
		);
	}

	const filteredTeamMembers = teamMembers.filter((member) =>
		member.name.toLowerCase().includes(authorSearch.toLowerCase()),
	);

	const selectedAuthorNames = teamMembers
		.filter((m) => selectedAuthors.includes(m.id))
		.map((m) => m.name);

	return (
		<div>
			<div style={{ marginBottom: "2rem" }}>
				<Link
					href="/admin/artigos"
					style={{
						color: "#d1d5db",
						textDecoration: "none",
						fontSize: "0.875rem",
						display: "inline-flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					← Voltar para artigos
				</Link>
			</div>

			<h1
				style={{
					fontSize: "1.875rem",
					fontWeight: "600",
					marginBottom: "2rem",
				}}
			>
				Novo Artigo
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
								htmlFor="title"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Título *
							</label>
							<input
								id="title"
								name="title"
								type="text"
								value={formData.title}
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
								htmlFor="subtitle"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Subtítulo *
							</label>
							<input
								id="subtitle"
								name="subtitle"
								type="text"
								value={formData.subtitle}
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

					<div style={{ marginBottom: "2rem" }}>
						<label
							htmlFor="text"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							Texto *
						</label>
						<textarea
							id="text"
							name="text"
							value={formData.text}
							onChange={handleChange}
							required
							rows={8}
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
							htmlFor="active"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.75rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							<input
								id="active"
								name="active"
								type="checkbox"
								checked={formData.active}
								onChange={handleCheckboxChange}
								style={{
									width: "16px",
									height: "16px",
									accentColor: "#d4af37",
								}}
							/>
							Ativo
						</label>
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
								htmlFor="language"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Idioma
							</label>
							<select
								id="language"
								name="language"
								value={formData.language}
								onChange={handleLanguageChange}
								style={{
									width: "100%",
									padding: "0.75rem",
									background: "#0a0a0a",
									border: "1px solid #333",
									borderRadius: "6px",
									color: "#ededed",
									fontSize: "1rem",
									outline: "none",
									cursor: "pointer",
								}}
							>
								<option value="portugues">Português</option>
								<option value="ingles">Inglês</option>
								<option value="frances">Francês</option>
							</select>
						</div>

						<div
							ref={authorDropdownRef}
							style={{ position: "relative" }}
						>
							<label
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Autores
							</label>
							<div
								onClick={() =>
									setAuthorDropdownOpen(!authorDropdownOpen)
								}
								style={{
									width: "100%",
									padding: "0.75rem",
									background: "#0a0a0a",
									border: "1px solid #333",
									borderRadius: "6px",
									color:
										selectedAuthors.length > 0
											? "#ededed"
											: "#666",
									fontSize: "1rem",
									cursor: "pointer",
									minHeight: "46px",
								}}
							>
								{selectedAuthors.length > 0
									? selectedAuthorNames.join(", ")
									: "Selecione os autores..."}
							</div>
							{authorDropdownOpen && (
								<div
									style={{
										position: "absolute",
										top: "100%",
										left: 0,
										right: 0,
										background: "#1a1a1a",
										border: "1px solid #333",
										borderRadius: "6px",
										marginTop: "4px",
										zIndex: 100,
										maxHeight: "250px",
										overflowY: "auto",
									}}
								>
									<div style={{ padding: "0.5rem" }}>
										<input
											type="text"
											placeholder="Buscar por nome..."
											value={authorSearch}
											onChange={(e) =>
												setAuthorSearch(e.target.value)
											}
											onClick={(e) => e.stopPropagation()}
											style={{
												width: "100%",
												padding: "0.5rem",
												background: "#0a0a0a",
												border: "1px solid #333",
												borderRadius: "4px",
												color: "#ededed",
												fontSize: "0.875rem",
												outline: "none",
											}}
										/>
									</div>
									{filteredTeamMembers.map((member) => (
										<div
											key={member.id}
											onClick={() =>
												toggleAuthor(member.id)
											}
											style={{
												padding: "0.75rem 1rem",
												display: "flex",
												alignItems: "center",
												gap: "0.75rem",
												cursor: "pointer",
												background:
													selectedAuthors.includes(
														member.id,
													)
														? "#2a2a2a"
														: "transparent",
												borderBottom: "1px solid #222",
											}}
										>
											<input
												type="checkbox"
												checked={selectedAuthors.includes(
													member.id,
												)}
												onChange={() => {}}
												style={{
													width: "16px",
													height: "16px",
													accentColor: "#d4af37",
													cursor: "pointer",
												}}
											/>
											<span style={{ color: "#ededed" }}>
												{member.name}
											</span>
										</div>
									))}
									{filteredTeamMembers.length === 0 && (
										<div
											style={{
												padding: "1rem",
												color: "#666",
												textAlign: "center",
											}}
										>
											Nenhum membro encontrado
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					<div style={{ marginBottom: "2rem" }}>
						<label
							htmlFor="thumbnail"
							style={{
								display: "block",
								marginBottom: "0.5rem",
								fontSize: "0.875rem",
								color: "#d1d5db",
								fontWeight: "500",
							}}
						>
							Thumbnail *
						</label>
						<input
							id="thumbnail"
							name="thumbnail"
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
									width={240}
									height={180}
									style={{
										maxWidth: "240px",
										maxHeight: "180px",
										borderRadius: "8px",
										border: "1px solid #333",
										objectFit: "cover",
									}}
								/>
							</div>
						)}
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

					<div
						style={{
							display: "flex",
							gap: "1rem",
							justifyContent: "flex-end",
						}}
					>
						<Link
							href="/admin/artigos"
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
							{loading ? "Criando..." : "Criar Artigo"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
