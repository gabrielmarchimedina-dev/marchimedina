import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["pt", "en"];
const defaultLocale = "pt";

function getLocale(request: NextRequest): string {
	// Check if locale is in the pathname
	const pathname = request.nextUrl.pathname;
	const pathnameLocale = locales.find(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
	);

	if (pathnameLocale) return pathnameLocale;

	// Check Accept-Language header
	const acceptLanguage = request.headers.get("accept-language");
	if (acceptLanguage) {
		const preferredLocale = acceptLanguage
			.split(",")
			.map((lang) => lang.split(";")[0].trim().substring(0, 2))
			.find((lang) => locales.includes(lang));

		if (preferredLocale) return preferredLocale;
	}

	return defaultLocale;
}

export function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	// Skip middleware for API routes, admin, static files, etc.
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/admin") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/client") ||
		pathname.startsWith("/assets") ||
		pathname.includes(".") // static files
	) {
		return NextResponse.next();
	}

	// Check if pathname already has a locale
	const pathnameHasLocale = locales.some(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
	);

	if (pathnameHasLocale) {
		return NextResponse.next();
	}

	// Redirect to locale-prefixed path
	const locale = getLocale(request);
	const newUrl = new URL(`/${locale}${pathname}`, request.url);
	return NextResponse.redirect(newUrl);
}

export const config = {
	matcher: [
		// Match all paths except static files and api
		"/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
