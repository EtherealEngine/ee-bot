export default () => {
    return {
        default: {
            build: {
                rollupOptions: {
                    external: ['puppeteer']
                }
            },
            plugins: []
        }
    }
}