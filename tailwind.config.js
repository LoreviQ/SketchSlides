/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html", // Include HTML files
        "./src/**/*.{js,jsx,ts,tsx}", // Include React files
    ],
    theme: {
        extend: {
            colors: {
                "custom-dark": "#222124",
            },
            fontFamily: {
                sans: [
                    "Inter",
                    "ui-sans-serif",
                    "system-ui",
                    "sans-serif",
                    "Apple Color Emoji",
                    "Segoe UI Emoji",
                    "Segoe UI Symbol",
                    "Noto Color Emoji",
                ],
                kalam: ["Kalam", "cursive"],
            },
            textStroke: {
                1: "1px",
                2: "2px",
            },
            textStrokeColor: {
                black: "#000",
            },
        },
    },
    plugins: [
        function ({ addUtilities }) {
            const newUtilities = {
                ".text-stroke-1": {
                    "-webkit-text-stroke-width": "1px",
                },
                ".text-stroke-2": {
                    "-webkit-text-stroke-width": "2px",
                },
                ".text-stroke-black": {
                    "-webkit-text-stroke-color": "#000",
                },
            };
            addUtilities(newUtilities);
        },
    ],
};
