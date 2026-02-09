"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
		null,
	);
	const [user, setUser] = useState<any>(null);
	const [sidebarExpanded, setSidebarExpanded] = useState(true);
	const [dropdownOpen, setDropdownOpen] = useState(false);

	useEffect(() => {
		// Não verifica autenticação para rotas de cadastro
		if (pathname.startsWith("/admin/cadastro")) {
			return;
		}

		async function checkAuth() {
			try {
				const response = await fetch("/api/v1/user", {
					method: "GET",
					credentials: "include",
				});

				if (response.ok) {
					const userData = await response.json();
					setUser(userData);
					setIsAuthenticated(true);
					// Se está logado e tentou acessar /login, redireciona pro admin
					if (pathname === "/admin/login") {
						window.location.href = "/admin";
					}
				} else {
					setIsAuthenticated(false);
					if (pathname !== "/admin/login") {
						window.location.href = "/admin/login";
					}
				}
			} catch (error) {
				setIsAuthenticated(false);
				if (pathname !== "/admin/login") {
					window.location.href = "/admin/login";
				}
			}
		}

		checkAuth();
	}, [pathname]);

	async function handleLogout() {
		try {
			await fetch("/api/v1/sessions", {
				method: "DELETE",
				credentials: "include",
			});
			window.location.href = "/admin/login";
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		}
	}

	// Páginas que não precisam do layout (login e cadastro)
	if (pathname === "/admin/login" || pathname.startsWith("/admin/cadastro")) {
		return <>{children}</>;
	}

	// Loading state
	if (isAuthenticated === null) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					minHeight: "100vh",
					background: "#0a0a0a",
					color: "#ededed",
				}}
			>
				Carregando...
			</div>
		);
	}

	const firstName = user?.name?.split(" ")[0] || "Usuário";

	const dropdownItemStyle = {
		width: "100%",
		padding: "0.75rem 1rem",
		background: "transparent",
		border: "none",
		color: "#ededed",
		cursor: "pointer",
		textAlign: "left" as const,
		transition: "background 0.2s",
		display: "block",
		textDecoration: "none",
	};

	// Layout autenticado
	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: sidebarExpanded ? "240px 1fr" : "60px 1fr",
				gridTemplateRows: "64px 1fr",
				minHeight: "100vh",
				background: "#0a0a0a",
				color: "#ededed",
				transition: "grid-template-columns 0.3s ease",
			}}
		>
			{/* Header */}
			<header
				style={{
					gridColumn: "1 / -1",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "0 1.5rem",
					background: "#1a1a1a",
					borderBottom: "1px solid #333",
				}}
			>
				<Link
					href="/admin"
					style={{
						color: "#d4af37",
						fontSize: "1.25rem",
						fontWeight: "600",
						textDecoration: "none",
					}}
				>
					Marchi Medina
				</Link>

				{/* User Dropdown */}
				<div style={{ position: "relative" }}>
					<button
						onClick={() => setDropdownOpen(!dropdownOpen)}
						style={{
							background: "transparent",
							border: "1px solid #333",
							borderRadius: "6px",
							padding: "0.5rem 1rem",
							color: "#ededed",
							cursor: "pointer",
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
						}}
					>
						{firstName}
						<span style={{ fontSize: "0.75rem" }}>▼</span>
					</button>

					{dropdownOpen && (
						<div
							style={{
								position: "absolute",
								top: "calc(100% + 0.5rem)",
								right: 0,
								background: "#1a1a1a",
								border: "1px solid #333",
								borderRadius: "6px",
								minWidth: "150px",
								boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
								zIndex: 1000,
								overflow: "hidden",
							}}
						>
							<Link
								href="/admin/trocar-senha"
								style={{
									...dropdownItemStyle,
									fontFamily: "inherit",
									fontSize: "1rem",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background =
										"#2a2a2a")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background =
										"transparent")
								}
								onClick={() => setDropdownOpen(false)}
							>
								Trocar Senha
							</Link>
							<button
								onClick={handleLogout}
								style={{
									...dropdownItemStyle,
									fontFamily: "inherit",
									fontSize: "1rem",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.background =
										"#2a2a2a")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.background =
										"transparent")
								}
							>
								Sair
							</button>
						</div>
					)}
				</div>
			</header>

			{/* Sidebar */}
			<aside
				style={{
					background: "#1a1a1a",
					borderRight: "1px solid #333",
					padding: "1rem 0",
					display: "flex",
					flexDirection: "column",
					gap: "0.5rem",
				}}
			>
				<button
					onClick={() => setSidebarExpanded(!sidebarExpanded)}
					style={{
						background: "transparent",
						border: "none",
						color: "#d1d5db",
						padding: "0.75rem 1rem",
						cursor: "pointer",
						textAlign: "left",
						fontSize: "1.25rem",
					}}
				>
					☰
				</button>

				<Link
					href="/admin/usuarios"
					style={{
						padding: "0.75rem 1rem",
						color: pathname.startsWith("/admin/usuarios")
							? "#d4af37"
							: "#d1d5db",
						textDecoration: "none",
						transition: "all 0.2s",
						display: "flex",
						alignItems: "center",
						gap: "0.75rem",
					}}
				>
					<span>👥</span>
					{sidebarExpanded && <span>Usuários</span>}
				</Link>

				<Link
					href="/admin/equipe"
					style={{
						padding: "0.75rem 1rem",
						color: pathname.startsWith("/admin/equipe")
							? "#d4af37"
							: "#d1d5db",
						textDecoration: "none",
						transition: "all 0.2s",
						display: "flex",
						alignItems: "center",
						gap: "0.75rem",
					}}
				>
					<span>👔</span>
					{sidebarExpanded && <span>Equipe</span>}
				</Link>

				<Link
					href="/admin/artigos"
					style={{
						padding: "0.75rem 1rem",
						color: pathname.startsWith("/admin/artigos")
							? "#d4af37"
							: "#d1d5db",
						textDecoration: "none",
						transition: "all 0.2s",
						display: "flex",
						alignItems: "center",
						gap: "0.75rem",
					}}
				>
					<span>📰</span>
					{sidebarExpanded && <span>Artigos</span>}
				</Link>
			</aside>

			{/* Main Content */}
			<main
				style={{
					padding: "2rem",
					overflowY: "auto",
				}}
			>
				{children}
			</main>
		</div>
	);
}
