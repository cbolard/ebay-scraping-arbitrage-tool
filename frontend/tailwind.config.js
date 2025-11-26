/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                obsidian: '#0A0A0A',
                'off-white': '#EDEDED',
                muted: '#888888',
                'indigo-accent': '#6366f1', // Indigo-500
                'glass-border': 'rgba(255, 255, 255, 0.08)',
                'glass-bg': 'rgba(255, 255, 255, 0.03)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
            }
        },
    },
    plugins: [],
}
