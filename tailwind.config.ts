import type { Config } from "tailwindcss";

export default {
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: "var(--background)",
				material: "var(--material)",
				accent: "var(--accent)",
				tint: "var(--tint)",
				foreground: "var(--foreground)",
			},
			backgroundImage: {
				bg: "url('/bg.jpg')",
			},
		},
	},
	plugins: [],
} satisfies Config;
