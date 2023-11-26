module.exports = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.node = {
                net: 'empty',
                zlib: false,
            };
        }
        return config;
    }
}