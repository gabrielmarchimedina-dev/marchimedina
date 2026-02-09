"use client";

import { useCallback, useEffect, useState } from "react";

export function useScrollAnimation(threshold = 0.3) {
	const [element, setElement] = useState<HTMLDivElement | null>(null);
	const [isVisible, setVisible] = useState(false);
	const ref = useCallback((node: HTMLDivElement | null) => {
		setElement(node);
	}, []);

	useEffect(() => {
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
				}
			},
			{ threshold },
		);

		observer.observe(element);

		return () => observer.disconnect();
	}, [element, threshold]);

	return { ref, isVisible };
}
