import Link from "next/link";

export default function CadastroLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<header
				style={{
					background: "#0a0a0a",
					borderBottom: "1px solid #333",
					padding: "1.5rem 2rem",
				}}
			>
				<Link
					href="/"
					style={{
						textDecoration: "none",
						color: "#d4af37",
					}}
				>
					<div>
						<h1
							style={{
								fontSize: "1.5rem",
								fontWeight: "600",
								margin: 0,
							}}
						>
							Marchi Medina
						</h1>
						<p
							style={{
								fontSize: "0.875rem",
								color: "#999",
								margin: 0,
							}}
						>
							Advocacia
						</p>
					</div>
				</Link>
			</header>
			{children}
		</>
	);
}
