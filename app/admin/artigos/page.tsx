"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Article = {
	id: string;
	title: string;
	subtitle: string;
	thumbnail: string;
	text: string;
	view_count: number;
	active: boolean;
	created_at: string;
};

type ConfirmModalProps = {
	isOpen: boolean;
	title: string;
	message: string;
	confirmText?: string;
	cancelText?: string;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
	error?: string | null;
};

function ConfirmModal({
	isOpen,
	title,
	message,
	confirmText = "Confirmar",
	cancelText = "Cancelar",
	onConfirm,
	onCancel,
	isLoading = false,
	error = null,
}: ConfirmModalProps) {
	if (!isOpen) return null;

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: "rgba(0, 0, 0, 0.7)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000,
			}}
			onClick={onCancel}
		>
			<div
				style={{
					background: "#1a1a1a",
					border: "1px solid #333",
					borderRadius: "12px",
					padding: "2rem",
					maxWidth: "400px",
					width: "90%",
					boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<h3
					style={{
						fontSize: "1.25rem",
						fontWeight: "600",
						color: "#ededed",
						marginBottom: "1rem",
					}}
				>
					{title}
				</h3>

				<p
					style={{
						color: "#d1d5db",
						marginBottom: "1.5rem",
						lineHeight: "1.5",
					}}
				>
					{message}
				</p>

				{error && (
					<div
						style={{
							background: "#7f1d1d",
							border: "1px solid #dc2626",
							borderRadius: "6px",
							padding: "0.75rem 1rem",
							marginBottom: "1rem",
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
						gap: "0.75rem",
						justifyContent: "flex-end",
					}}
				>
					<button
						onClick={onCancel}
						disabled={isLoading}
						style={{
							padding: "0.75rem 1.5rem",
							background: "transparent",
							border: "1px solid #333",
							borderRadius: "6px",
							color: "#ededed",
							cursor: isLoading ? "not-allowed" : "pointer",
							fontWeight: "500",
							transition: "all 0.2s",
						}}
					>
						{cancelText}
					</button>
					<button
						onClick={onConfirm}
						disabled={isLoading}
						style={{
							padding: "0.75rem 1.5rem",
							background: "#7f1d1d",
							border: "none",
							borderRadius: "6px",
							color: "#fca5a5",
							cursor: isLoading ? "not-allowed" : "pointer",
							fontWeight: "600",
							transition: "all 0.2s",
							opacity: isLoading ? 0.7 : 1,
						}}
					>
						{isLoading ? "Desativando..." : confirmText}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function ArticlesPage() {
	const [articles, setArticles] = useState<Article[]>([]);
	const [loading, setLoading] = useState(true);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [articleToDelete, setArticleToDelete] = useState<Article | null>(
		null,
	);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	useEffect(() => {
		fetchArticles();
	}, []);

	async function fetchArticles() {
		try {
			const response = await fetch("/api/v1/articles", {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				setArticles(data);
			}
		} catch (error) {
			console.error("Erro ao buscar artigos:", error);
		} finally {
			setLoading(false);
		}
	}

	function openDeleteModal(article: Article) {
		setArticleToDelete(article);
	}

	function closeDeleteModal() {
		if (!deletingId) {
			setArticleToDelete(null);
			setDeleteError(null);
		}
	}

	async function handleConfirmDelete() {
		if (!articleToDelete) return;

		setDeletingId(articleToDelete.id);

		try {
			const response = await fetch(
				`/api/v1/articles/${articleToDelete.id}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (response.ok) {
				setArticles((prev) =>
					prev.map((a) =>
						a.id === articleToDelete.id
							? { ...a, active: false }
							: a,
					),
				);
				setArticleToDelete(null);
				setDeleteError(null);
			} else {
				const error = await response.json();
				setDeleteError(error.message || "Erro ao desativar artigo");
			}
		} catch (error) {
			console.error("Erro ao desativar artigo:", error);
			setDeleteError("Erro ao desativar artigo");
		} finally {
			setDeletingId(null);
		}
	}

	if (loading) {
		return <div>Carregando...</div>;
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
				<h1 style={{ fontSize: "1.875rem", fontWeight: "600" }}>
					Artigos
				</h1>
				<Link
					href="/admin/artigos/novo"
					style={{
						padding: "0.75rem 1.5rem",
						background: "#d4af37",
						color: "#0a0a0a",
						border: "none",
						borderRadius: "6px",
						fontWeight: "600",
						cursor: "pointer",
						transition: "background 0.2s",
						textDecoration: "none",
						display: "inline-block",
					}}
					onMouseEnter={(e) =>
						(e.currentTarget.style.background = "#b8860b")
					}
					onMouseLeave={(e) =>
						(e.currentTarget.style.background = "#d4af37")
					}
				>
					+ Novo Artigo
				</Link>
			</div>

			{articles.length === 0 ? (
				<div
					style={{
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: "8px",
						padding: "3rem",
						textAlign: "center",
						color: "#d1d5db",
					}}
				>
					<div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
						📰
					</div>
					<h3
						style={{
							fontSize: "1.25rem",
							marginBottom: "0.5rem",
							color: "#ededed",
						}}
					>
						Nenhum artigo encontrado
					</h3>
					<p style={{ color: "#999" }}>
						Comece criando um novo artigo
					</p>
				</div>
			) : (
				<div
					style={{
						background: "#1a1a1a",
						border: "1px solid #333",
						borderRadius: "8px",
						overflow: "hidden",
					}}
				>
					<table
						style={{ width: "100%", borderCollapse: "collapse" }}
					>
						<thead>
							<tr
								style={{
									background: "#0a0a0a",
									borderBottom: "1px solid #333",
								}}
							>
								<th
									style={{
										padding: "1rem",
										textAlign: "left",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Título
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "left",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Subtítulo
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "center",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Views
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "center",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Status
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "left",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Criado em
								</th>
								<th
									style={{
										padding: "1rem",
										textAlign: "right",
										fontWeight: "600",
										color: "#d4af37",
									}}
								>
									Ações
								</th>
							</tr>
						</thead>
						<tbody>
							{articles.map((item) => {
								return (
									<tr
										key={item.id}
										style={{
											borderBottom: "1px solid #333",
										}}
									>
										<td
											style={{
												padding: "1rem",
												color: "#ededed",
											}}
										>
											{item.title}
										</td>
										<td
											style={{
												padding: "1rem",
												color: "#d1d5db",
											}}
										>
											{item.subtitle}
										</td>
										<td
											style={{
												padding: "1rem",
												textAlign: "center",
												color: "#d1d5db",
											}}
										>
											{item.view_count}
										</td>
										<td
											style={{
												padding: "1rem",
												textAlign: "center",
											}}
										>
											<span
												style={{
													padding: "0.25rem 0.75rem",
													borderRadius: "9999px",
													fontSize: "0.75rem",
													fontWeight: "500",
													background: item.active
														? "#14532d"
														: "#7f1d1d",
													color: item.active
														? "#86efac"
														: "#fca5a5",
												}}
											>
												{item.active
													? "Ativo"
													: "Inativo"}
											</span>
										</td>
										<td
											style={{
												padding: "1rem",
												color: "#d1d5db",
											}}
										>
											{new Date(
												item.created_at,
											).toLocaleDateString("pt-BR")}
										</td>
										<td
											style={{
												padding: "1rem",
												textAlign: "right",
											}}
										>
											<Link
												href={`/admin/artigos/${item.id}`}
												style={{
													padding: "0.5rem 1rem",
													background: "transparent",
													border: "1px solid #333",
													borderRadius: "4px",
													color: "#ededed",
													cursor: "pointer",
													marginRight: "0.5rem",
													textDecoration: "none",
													display: "inline-block",
												}}
											>
												Visualizar
											</Link>
											<button
												onClick={() =>
													openDeleteModal(item)
												}
												disabled={
													!item.active ||
													deletingId === item.id
												}
												style={{
													padding: "0.5rem 1rem",
													background: "transparent",
													border: item.active
														? "1px solid #7f1d1d"
														: "1px solid #333",
													borderRadius: "4px",
													color: item.active
														? "#fca5a5"
														: "#666",
													cursor: item.active
														? "pointer"
														: "not-allowed",
													opacity:
														deletingId === item.id
															? 0.5
															: 1,
												}}
											>
												Desativar
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			<ConfirmModal
				isOpen={articleToDelete !== null}
				title="Desativar artigo"
				message={`Tem certeza que deseja desativar "${articleToDelete?.title}"? O artigo não aparecerá mais no site público.`}
				confirmText="Desativar"
				cancelText="Cancelar"
				onConfirm={handleConfirmDelete}
				onCancel={closeDeleteModal}
				isLoading={deletingId !== null}
				error={deleteError}
			/>
		</div>
	);
}
