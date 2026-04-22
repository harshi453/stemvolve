@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Caveat:wght@400;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-script: "Caveat", cursive;
  
  /* Theme Variables */
  --color-brand: var(--brand-color);
  --color-brand-dark: var(--brand-color-dark);
  --color-brand-light: var(--brand-color-light);
  --color-accent: var(--accent-color);
  --color-app-bg: var(--bg-main);
  --color-app-surface: var(--bg-surface);
  --color-app-text: var(--text-main);
  --color-app-border: var(--border-color);
}

:root {
  --brand-color: #3B82F6; /* Electric */
  --brand-color-dark: #2563EB;
  --brand-color-light: #60A5FA;
  --accent-color: #EC4899; /* Vibrant */
  --bg-main: #F8FAFC;
  --bg-surface: #FFFFFF;
  --text-main: #0F172A;
  --border-color: #E2E8F0;
}

.dark {
  --brand-color: #8BA888; /* Sage */
  --brand-color-dark: #6B8269;
  --brand-color-light: #A8C2A5;
  --accent-color: #C2A588; /* Nude/Tan accent */
  --bg-main: #2C2420; /* Brown */
  --bg-surface: #3D322C; /* Brown Dark */
  --text-main: #FFFFFF;
  --border-color: rgba(255, 255, 255, 0.1);
}

@layer base {
  body {
    @apply font-sans antialiased bg-app-bg text-app-text transition-colors duration-300;
  }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--brand-color);
}

