export default function getRequestOrigin() {
	const envOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
	if (envOrigin) {
		return envOrigin.replace(/\/$/, "");
	}

	const vercelUrl = process.env.VERCEL_URL?.trim();
	if (vercelUrl) {
		return `https://${vercelUrl}`;
	}

	return "http://localhost:3000";
}
