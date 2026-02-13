import { contactStaticData } from "./contact.data";

export default function ContactPage() {
	return (
		<main className="min-h-screen bg-background text-textPrimary pt-28 pb-16">
			<div className="mx-auto max-w-3xl px-6">
				<header className="mb-10 text-center">
					<p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
						{contactStaticData.label}
					</p>

					<h1 className="text-3xl md:text-4xl font-semibold text-gold mb-4">
						{contactStaticData.title}
					</h1>

					<p className="text-sm md:text-base text-textSecondary max-w-xl mx-auto">
						{contactStaticData.description}
					</p>
				</header>

				{/* Formulário simples demonstrativo */}
				<form className="space-y-6">
					<div className="flex flex-col gap-2">
						<label htmlFor="name" className="text-sm font-medium">
							{contactStaticData.nameInput}
						</label>
						<input
							id="name"
							name="name"
							className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gold"
							placeholder={contactStaticData.nameInputPlaceholder}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="email" className="text-sm font-medium">
							{contactStaticData.emailInput}
						</label>
						<input
							id="email"
							name="email"
							type="email"
							className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gold"
							placeholder={
								contactStaticData.emailInputPlaceholder
							}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label
							htmlFor="message"
							className="text-sm font-medium"
						>
							{contactStaticData.messageInput}
						</label>
						<textarea
							id="message"
							name="message"
							rows={4}
							className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gold resize-none"
							placeholder={
								contactStaticData.messageInputPlaceholder
							}
						/>
					</div>

					<button
						type="submit"
						className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-black shadow-md shadow-gold/30 transition hover:bg-gold-light hover:shadow-gold/50"
					>
						{contactStaticData.sendButtonMessage}
					</button>
				</form>

				{/* Texto de rodapé opcional */}
				<p className="mt-8 text-center text-xs text-textSecondary">
					{contactStaticData.messageReason}
				</p>
			</div>
		</main>
	);
}
