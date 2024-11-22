/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html", // Include HTML files
        "./src/**/*.{js,jsx,ts,tsx}", // Include React files
    ],
    theme: {
        extend: {
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
            },
        },
    },
    plugins: [],
};
