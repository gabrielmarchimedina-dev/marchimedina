import { redirect } from "next/navigation";

// TODO: Descomentar quando o serviço de e-mail estiver pronto
// import { useLanguage } from "@/hooks/client/useLanguage";
// import { contactStaticData, contactStaticEnglishData } from "./contact.data";

export default function ContactPage() {
	// Página desabilitada temporariamente - redireciona para home
	redirect("/");

	/* TODO: Descomentar quando o serviço de e-mail estiver pronto
	const { language } = useLanguage();
	const data =
		language === "en" ? contactStaticEnglishData : contactStaticData;

	return (
		<main className="min-h-screen bg-background text-textPrimary pt-28 pb-16">
			<div className="mx-auto max-w-3xl px-6">
				<header className="mb-10 text-center">
					<p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">
						{data.label}
					</p>

					<h1 className="text-3xl md:text-4xl font-semibold text-gold mb-4">
						{data.title}
					</h1>

					<p className="text-sm md:text-base text-textSecondary max-w-xl mx-auto">
						{data.description}
					</p>
				</header>

				<form className="space-y-6">
					<div className="flex flex-col gap-2">
						<label htmlFor="name" className="text-sm font-medium">
							{data.nameInput}
						</label>
						<input
							id="name"
							name="name"
							className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gold"
							placeholder={data.nameInputPlaceholder}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="email" className="text-sm font-medium">
							{data.emailInput}
						</label>
						<input
							id="email"
							name="email"
							type="email"
							className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gold"
							placeholder={data.emailInputPlaceholder}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label
							htmlFor="message"
							className="text-sm font-medium"
						>
							{data.messageInput}
						</label>
						<textarea
							id="message"
							name="message"
							rows={4}
							className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-gold resize-none"
							placeholder={data.messageInputPlaceholder}
						/>
					</div>

					<button
						type="submit"
						className="mt-4 inline-flex items-center justify-center rounded-full bg-gold px-8 py-3 text-sm font-semibold text-black shadow-md shadow-gold/30 transition hover:bg-gold-light hover:shadow-gold/50"
					>
						{data.sendButtonMessage}
					</button>
				</form>

				<p className="mt-8 text-center text-xs text-textSecondary">
					{data.messageReason}
				</p>
			</div>
		</main>
	);
	*/
}
