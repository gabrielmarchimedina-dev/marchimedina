"use client";

import { useEffect, useState } from "react";

export function useTypewriter(
	text: string,
	speed = 80,
	startDelay = 0,
	enabled = true,
) {
	const [typed, setTyped] = useState("");

	useEffect(() => {
		if (!enabled) return;

		let index = 0;
		let interval: NodeJS.Timeout;

		setTyped("");

		const timeout = setTimeout(() => {
			interval = setInterval(() => {
				setTyped(text.slice(0, index + 1));
				index++;

				if (index === text.length) {
					clearInterval(interval);
				}
			}, speed);
		}, startDelay);

		return () => {
			clearTimeout(timeout);
			clearInterval(interval);
		};
	}, [text, speed, startDelay, enabled]);

	return typed;
}
