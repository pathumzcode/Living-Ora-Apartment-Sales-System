import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        apartments: resolve(__dirname, 'apartments.html'),
        apartmentDetail: resolve(__dirname, 'apartment-detail.html'),
        promotions: resolve(__dirname, 'promotions.html'),
        external: resolve(__dirname, 'external-apartments.html'),
        auth: resolve(__dirname, 'auth.html'),
        internalLogin: resolve(__dirname, 'internal-login.html'),
        customerDashboard: resolve(__dirname, 'customer-dashboard.html'),
        staffDashboard: resolve(__dirname, 'staff-dashboard.html'),
        adminDashboard: resolve(__dirname, 'admin-dashboard.html')
      }
    }
  }
});
