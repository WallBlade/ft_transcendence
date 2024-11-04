import { defineConfig } from "vite";
import glsl from 'vite-plugin-glsl';
import fs from 'fs';

const certPath = '/etc/ssl/certs/cert.pem';
const keyPath = '/etc/ssl/certs/key.pem';
export default defineConfig({
	root: "./",
	server: {
		port: 3000,
		strictPort: true, // Vite will throw an error if the port is already in use
		watch: {
			usePolling: true,
		},
		https: {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath),
		},
	},
	plugins: [
		glsl(),
	],
});

// export default defineConfig({
//   server: {
//     proxy: {
//       // Proxying API requests to Django backend
//       '/api': {
//         target: 'httpss://backend:8000', // Replace with your Django backend URL
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, '')
//       }
//     }
//   }
// });
