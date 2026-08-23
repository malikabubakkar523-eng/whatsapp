import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        ios: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      colors: {
        ios: {
          bg: {
            light: "#F2F2F7", // iOS System Grouped Background Light
            dark: "#000000",  // iOS System Grouped Background Dark
          },
          card: {
            light: "#FFFFFF", // iOS Secondary System Grouped Background Light
            dark: "#1C1C1E",  // iOS Secondary System Grouped Background Dark
          },
          elevated: {
            light: "#FFFFFF",
            dark: "#2C2C2E",
          },
          nav: {
            light: "rgba(246, 246, 246, 0.85)",
            dark: "rgba(28, 28, 30, 0.85)",
          },
          tabbar: {
            light: "rgba(255, 255, 255, 0.88)",
            dark: "rgba(22, 22, 24, 0.88)",
          },
          search: {
            light: "rgba(118, 118, 128, 0.12)",
            dark: "rgba(118, 118, 128, 0.24)",
          },
          separator: {
            light: "rgba(60, 60, 67, 0.14)",
            dark: "rgba(84, 84, 88, 0.28)",
          },
          blue: "#007AFF",
          green: "#34C759",
          red: "#FF3B30",
          orange: "#FF9500",
          yellow: "#FFCC00",
          purple: "#AF52DE",
          teal: "#30B0C7",
          indigo: "#5856D6",
          gray: {
            1: "#8E8E93",
            2: "#AEAEB2",
            3: "#C7C7CC",
            4: "#D1D1D6",
            5: "#E5E5EA",
            6: "#F2F2F7",
          },
        },
        brand: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981", // WhatsApp vibrant green
          600: "#00A884", // WhatsApp Primary Green (iOS)
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
        },
        wa: {
          teal: "#008069",
          tealDark: "#00A884",
          lightGreen: "#25D366",
          iosGreen: "#34C759",
          iosBlue: "#007AFF",
          bgLight: "#F2F2F7",
          bgDark: "#0B141A",
          cardLight: "#FFFFFF",
          cardDark: "#1F2C34",
          bubbleSentLight: "#D9FDD3",
          bubbleSentDark: "#005C4B",
          bubbleRecvLight: "#FFFFFF",
          bubbleRecvDark: "#202C33",
          headerLight: "#F6F6F6",
          headerDark: "#1C1C1E",
          borderLight: "rgba(60, 60, 67, 0.12)",
          borderDark: "rgba(84, 84, 88, 0.25)",
          textLight: "#000000",
          textDark: "#FFFFFF",
          mutedLight: "#8E8E93",
          mutedDark: "#8696A0",
          tickBlue: "#53BDEB",
        },
        chat: {
          bg: {
            light: "#EFEAE2",
            dark: "#0B141A",
          },
          panel: {
            light: "#FFFFFF",
            dark: "#1C1C1E",
          },
          card: {
            light: "#FFFFFF",
            dark: "#202C33",
          },
          hover: {
            light: "#F5F5F7",
            dark: "#2C2C2E",
          },
          border: {
            light: "rgba(60, 60, 67, 0.12)",
            dark: "rgba(84, 84, 88, 0.25)",
          },
          text: {
            light: "#000000",
            dark: "#FFFFFF",
          },
          muted: {
            light: "#8E8E93",
            dark: "#8696A0",
          },
          bubble: {
            sent: "#00A884",
            sentLight: "#D9FDD3",
            sentDark: "#005C4B",
            receivedLight: "#FFFFFF",
            receivedDark: "#202C33",
          },
        },
      },
      borderRadius: {
        "ios-sm": "8px",
        "ios-md": "12px",
        "ios-lg": "16px",
        "ios-xl": "20px",
        "ios-2xl": "24px",
      },
      boxShadow: {
        "ios-sm": "0 1px 2px rgba(0, 0, 0, 0.04)",
        "ios-md": "0 4px 12px rgba(0, 0, 0, 0.08)",
        "ios-lg": "0 8px 24px rgba(0, 0, 0, 0.12)",
        "ios-sheet": "0 -4px 24px rgba(0, 0, 0, 0.12)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.85)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slide-in-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
        "sheet-up": "sheet-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "pop-in": "pop-in 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-subtle": "pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
