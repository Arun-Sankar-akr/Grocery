// tailwind.config.js
module.exports = {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Outfit', 'sans-serif'],
                body: ['Poppins', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    900: '#14532d',
                },
                accent: '#f97316', // Vibrant orange for badges & CTAs
            }
        },
    },
    plugins: [],
}