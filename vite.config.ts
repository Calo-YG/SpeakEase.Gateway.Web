import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import { resolve } from 'path'
import { createStyleImportPlugin } from 'vite-plugin-style-import'
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [vue(),
    vueJsx(),
    VueSetupExtend(),
    createStyleImportPlugin({
      libs: [
          {
              libraryName: 'element-plus',
              esModule: true,
              resolveStyle: (name) => {
                  return `element-plus/lib/theme-chalk/${name}.css`;
              },
              ensureStyleFile: true
          }
      ]
  }),
  Components({
    resolvers: [
      AntDesignVueResolver({
        importStyle: false,
      }),
    ],
  }),],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src')
      }
    ]
  },
  server: {
    port: 8080,
    hmr: {
        host: '127.0.0.1',
        port: 8080
    },
    proxy: {
        '/api': {
            target: 'your https address',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, '')
        }
    }
}})
