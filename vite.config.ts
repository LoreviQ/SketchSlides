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
				id: 'sketchslides',
				name: 'SketchSlides',
				short_name: 'sketchslides',
				start_url: '/',
				display: 'standalone',
				description: 'A slideshow app for sketching and gesture drawing',
				orientation: "portrait-primary",
				background_color: '#222124',
				theme_color: '#000000',
				icons: [
					{
						src: "/icons/sketchslides.webp",
						sizes: "1024x1024",
						type: "image/webp",
						purpose: "any maskable"
					},
					{
						src: "/icons/sketchslides_small.webp",
						sizes: "144x144",
						type: "image/webp",
						purpose: "any maskable"
					}
				],
				screenshots: [
					{
						src: "/screenshots/desktop.webp",
						sizes: "2560x1440",
						type: "image/webp",
						form_factor: "wide"
					},
					{
						src: "/screenshots/mobile.webp",
						sizes: "1080x2400",
						type: "image/webp",
						form_factor: "narrow"
					}
				],
				launch_handler: {
					client_mode: ["navigate-existing", "auto"]
				},
				file_handlers: [
					{
						"action": "/",
						"accept": {
							"image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"]
						}
					}
				]
			},
    	}),
  	],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
			vendor: ['react', 'react-dom'],
        },
      },
    },
    cssCodeSplit: true,
    // Minify CSS
    cssMinify: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
