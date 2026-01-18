import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#0B0F19',
                    800: '#111827',
                    700: '#1F2937',
                    text: '#F3F4F6',
                    muted: '#9CA3AF',
                },
                primary: {
                    DEFAULT: '#3B82F6',
                    hover: '#2563EB',
                }
            },
        },
    },
    plugins: [],
};
export default config;