"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type Article = {
	id: string;
	title: string;
	subtitle: string;
	thumbnail: string;
	text: string;
	view_count: number;
	active: boolean;
	created_by: string | null;
	updated_by: string | null;
	deleted_by: string | null;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
};

type HistoryEntry = {
	id: string;
	field: string;
	old_value: string | null;
	new_value: string | null;
	edited_by: string | null;
	edited_by_name?: string | null;
	created_at: string;
};

export default function ViewArticlePage() {
	const params = useParams();
	const router = useRouter();
	const articleId = params.id as string;
	const [article, setArticle] = useState<Article | null>(null);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState({
		title: "",
		subtitle: "",
		text: "",
		active: true,
	});
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string>("");
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchArticle() {
			try {
				const response = await fetch(`/api/v1/articles/${articleId}`, {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setArticle(data);
					setFormData({
						title: data.title ?? "",
						subtitle: data.subtitle ?? "",
						text: data.text ?? "",
						active: Boolean(data.active),
					});
					setPreviewUrl(data.thumbnail ? `/${data.thumbnail}` : "");
				} else {
					router.push("/admin/artigos");
				}
			} catch (error) {
				console.error("Erro ao buscar artigo:", error);
				router.push("/admin/artigos");
			} finally {
				setLoading(false);
			}
		}

		fetchArticle();
	}, [articleId, router]);

	const fetchHistory = useCallback(async () => {
		try {
			const response = await fetch(
				`/api/v1/articles/${articleId}/history`,
				{ credentials: "include" },
			);
			if (response.ok) {
				const data = await response.json();
				setHistory(data);
			}
		} catch (error) {
			console.error("Erro ao buscar histórico:", error);
		}
	}, [articleId]);

	useEffect(() => {
		fetchHistory();
	}, [fetchHistory]);

	if (loading) {
		return <div>Carregando...</div>;
	}

	if (!article) {
		return null;
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");
		setSaving(true);

		try {
			const submitFormData = new FormData();
			submitFormData.append("title", formData.title);
			submitFormData.append("subtitle", formData.subtitle);
			submitFormData.append("text", formData.text);
			submitFormData.append("active", formData.active ? "true" : "false");

			if (selectedFile) {
				submitFormData.append("file", selectedFile);
			}

			const response = await fetch(`/api/v1/articles/${articleId}`, {
				method: "PATCH",
				credentials: "include",
				body: submitFormData,
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.message || "Erro ao atualizar artigo");
				setSaving(false);
				return;
			}

			setArticle(data);
			setIsEditing(false);
			setSelectedFile(null);
			await fetchHistory();
			setSaving(false);
		} catch (err) {
			setError("Erro ao conectar com o servidor");
			setSaving(false);
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
						href="/admin/artigos"
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
						Visualizar Artigo
					</h1>
				</div>
				<button
					onClick={() => {
						setIsEditing((prev) => !prev);
						setError("");
						setSelectedFile(null);
						setPreviewUrl(
							article.thumbnail ? `/${article.thumbnail}` : "",
						);
					}}
					style={{
						padding: "0.75rem 1.5rem",
						background: isEditing ? "transparent" : "#d4af37",
						color: isEditing ? "#ededed" : "#0a0a0a",
						border: isEditing ? "1px solid #333" : "none",
						borderRadius: "6px",
						fontWeight: "600",
						cursor: "pointer",
					}}
				>
					{isEditing ? "Cancelar" : "Editar Artigo"}
				</button>
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
					Dados do Artigo
				</h2>

				{isEditing ? (
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
								htmlFor="thumbnail"
								style={{
									display: "block",
									marginBottom: "0.5rem",
									fontSize: "0.875rem",
									color: "#d1d5db",
									fontWeight: "500",
								}}
							>
								Thumbnail
							</label>
							<input
								id="thumbnail"
								name="thumbnail"
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
							<button
								type="submit"
								disabled={saving}
								style={{
									padding: "0.75rem 1.5rem",
									background: saving ? "#555" : "#d4af37",
									color: saving ? "#999" : "#0a0a0a",
									border: "none",
									borderRadius: "6px",
									fontWeight: "600",
									cursor: saving ? "not-allowed" : "pointer",
									transition: "background 0.2s",
								}}
								onMouseEnter={(e) => {
									if (!saving)
										e.currentTarget.style.background =
											"#b8860b";
								}}
								onMouseLeave={(e) => {
									if (!saving)
										e.currentTarget.style.background =
											"#d4af37";
								}}
							>
								{saving ? "Salvando..." : "Salvar"}
							</button>
						</div>
					</form>
				) : (
					<>
						{article.thumbnail && (
							<div style={{ marginBottom: "1.5rem" }}>
								<Image
									src={`/${article.thumbnail}`}
									alt={article.title}
									width={240}
									height={160}
									style={{
										width: "240px",
										height: "160px",
										borderRadius: "12px",
										objectFit: "cover",
										border: "2px solid #333",
									}}
								/>
							</div>
						)}

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
									Título
								</label>
								<p
									style={{
										fontSize: "1rem",
										color: "#ededed",
									}}
								>
									{article.title}
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
									Subtítulo
								</label>
								<p
									style={{
										fontSize: "1rem",
										color: "#ededed",
									}}
								>
									{article.subtitle}
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
										background: article.active
											? "#15803d"
											: "#854d0e",
										color: article.active
											? "#86efac"
											: "#fde047",
									}}
								>
									{article.active ? "✓" : "○"}
									{article.active ? " Ativo" : " Inativo"}
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
									Views
								</label>
								<p
									style={{
										fontSize: "1rem",
										color: "#ededed",
									}}
								>
									{article.view_count}
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
									Criado em
								</label>
								<p
									style={{
										fontSize: "1rem",
										color: "#ededed",
									}}
								>
									{new Date(
										article.created_at,
									).toLocaleString("pt-BR")}
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
								<p
									style={{
										fontSize: "1rem",
										color: "#ededed",
									}}
								>
									{new Date(
										article.updated_at,
									).toLocaleString("pt-BR")}
								</p>
							</div>
						</div>
					</>
				)}
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
					Conteúdo
				</h2>
				<p
					style={{
						fontSize: "1rem",
						color: "#ededed",
						lineHeight: "1.7",
						whiteSpace: "pre-wrap",
					}}
				>
					{article.text}
				</p>
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
					Histórico
				</h2>

				{history.length === 0 ? (
					<div
						style={{
							background: "#0a0a0a",
							border: "1px dashed #333",
							borderRadius: "8px",
							padding: "2rem",
							textAlign: "center",
							color: "#d1d5db",
						}}
					>
						Nenhum histórico registrado ainda.
					</div>
				) : (
					<div style={{ display: "grid", gap: "1rem" }}>
						{history.map((entry) => (
							<div
								key={entry.id}
								style={{
									background: "#0a0a0a",
									border: "1px solid #333",
									borderRadius: "8px",
									padding: "1rem",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
									}}
								>
									<div>
										<p
											style={{
												color: "#ededed",
												marginBottom: "0.25rem",
											}}
										>
											Campo &quot;{entry.field}&quot;
											atualizado
										</p>
										<div
											style={{
												color: "#999",
												fontSize: "0.875rem",
											}}
										>
											<span>
												Antes: {entry.old_value ?? "-"}
											</span>
											<span
												style={{ marginLeft: "1rem" }}
											>
												Depois: {entry.new_value ?? "-"}
											</span>
										</div>
									</div>
									<div
										style={{
											textAlign: "right",
											color: "#999",
											fontSize: "0.875rem",
										}}
									>
										<div>
											{new Date(
												entry.created_at,
											).toLocaleString("pt-BR")}
										</div>
										{entry.edited_by_name && (
											<div>
												Por: {entry.edited_by_name}
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
