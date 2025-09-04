
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx}",
        "./src/components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    light: '#693B00',
                    DEFAULT: '#000000',
                    dark: '#403727',
                },
                accent: '#F43F5E',
            },
        },
    },
    plugins: [],
};