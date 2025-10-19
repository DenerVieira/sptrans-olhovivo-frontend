// 1. Importar a biblioteca Workbox (link da CDN)
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

// 2. Configurações de debug (opcional, remova na produção)
workbox.setConfig({
    debug: false // Mude para false em produção
});

// 3. Verifica se a Workbox foi carregada
if (workbox.core) {
    console.log(`Workbox v${workbox.core.VERSION} carregado com sucesso.`);
} else {
    console.error('Falha ao carregar Workbox.');
}

// 4. PRE-CACHE: Lista de arquivos essenciais a serem armazenados em cache
// O Workbox fará o cache de todos esses arquivos no primeiro acesso.
workbox.precaching.precacheAndRoute([
    { url: '/index.html', revision: '1' }, // Mude a revisão a cada alteração no index.html
    // Inclua outros arquivos estáticos (CSS, JS) aqui:
    // { url: '/styles.css', revision: '1' }, 
    // { url: '/app.js', revision: '1' }, 
    { url: '/manifest.json', revision: '1' }
], {
    // Permite que a Workbox ignore strings de consulta na URL
    ignoreURLParametersMatching: [/.*/]
});

// 5. CACHE DE RECURSOS EXTERNOS (Estratégias de Cache)

// Cache para Google Fonts: rápido, com retorno ao cache
workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com' ||
               url.origin === 'https://fonts.gstatic.com',
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: 'google-fonts',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 dias
            }),
        ],
    }),
);

// Cache para o CDN do Tailwind (para garantir que funcione offline)
workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://cdn.tailwindcss.com',
    new workbox.strategies.CacheFirst({
        cacheName: 'tailwind-cdn',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 dias
            }),
        ],
    }),
);

// 6. Estratégia de Cache para o seu PROXY (API)
// Usar NetworkFirst para tentar sempre buscar a posição mais recente, mas retornar 
// um erro ou dados antigos se a rede falhar.
workbox.routing.registerRoute(
    // Substitua pelo seu PROXY_BASE_URL configurado no index.html
    ({url}) => url.pathname.startsWith('/api/proxy'), 
    new workbox.strategies.NetworkFirst({
        cacheName: 'api-proxy-cache',
        plugins: [
            new workbox.expiration.ExpirationPlugin({
                maxEntries: 5,
                maxAgeSeconds: 60 * 5, // 5 minutos de cache para a posição
            }),
        ],
    }),
);
