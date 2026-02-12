/**
 * Retorna a URL correta para exibir uma imagem.
 * Se a URL já é absoluta (começa com http), retorna como está.
 * Se é um path relativo, adiciona a barra inicial.
 */
export function getImageSrc(imageUrl: string | undefined): string {
	if (!imageUrl) {
		return "/assets/images/teamMembers/default.jpg";
	}

	// Se já é URL absoluta (Vercel Blob ou externa)
	if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
		return imageUrl;
	}

	// Path relativo - adiciona barra inicial
	return `/${imageUrl}`;
}
