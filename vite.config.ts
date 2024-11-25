import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
	VitePWA({
	  registerType: 'autoUpdate',
	  workbox: {
		globPatterns: ['**/*.{js,css,html,png,svg}'], // Cache all relevant files
	  },
	  manifest: {
		name: 'SketchSlides',
		short_name: 'sketchslides',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#000000',
		icons: [
			{
				src: "/icons/sketchslides.png",
				sizes: "1024x1024",
				type: "image/png"
			},
			{
				src: "/icons/sketchslides_small.png",
				sizes: "144x144",
				type: "image/png"
			}
		],
		screenshots: [
			{
				src: "/screenshots/desktop.png",
				sizes: "2560x1440",
				type: "image/png",
				form_factor: "wide"
			},
			{
				src: "/screenshots/mobile.png",
				sizes: "1080x2400",
				type: "image/png",
				form_factor: "narrow"
			}
		],
	  },
	}),
  ],
})
