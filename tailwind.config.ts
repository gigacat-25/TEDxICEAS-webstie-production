import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This maps the Tailwind 'font-sans' class to the Next.js font variable
        sans: ['var(--font-inter)'],
        // This creates a new 'font-orbitron' class mapped to your custom font
        orbitron: ['var(--font-orbitron)'],
        clash: ['var(--font-clash)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;