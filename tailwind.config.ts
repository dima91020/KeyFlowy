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
                primary: {
                    DEFAULT: '#0F172A',
                    hover: '#1E293B',
                    blue: '#2563EB',
                    'blue-hover': '#1D4ED8',
                }
            },
        },
    },
    plugins: [],
};
export default config;