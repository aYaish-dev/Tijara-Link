import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Poppins", "Segoe UI", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          subtle: "hsl(var(--accent-subtle))",
          soft: "hsl(var(--accent-soft))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        lg: "var(--shadow-lg)",
        md: "var(--shadow-md)",
      },
      backgroundImage: {
        "body-gradient":
          "linear-gradient(135deg, rgba(239, 246, 255, 1) 0%, rgba(224, 242, 254, 1) 50%, rgba(238, 242, 255, 1) 100%)",
        "body-radial":
          "radial-gradient(circle at top right, rgba(37, 99, 235, 0.14), transparent 45%), radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.18), transparent 40%)",
      },
    },
  },
  plugins: [animatePlugin],
};

export default config;
