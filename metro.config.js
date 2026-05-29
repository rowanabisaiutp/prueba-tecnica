const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix para @shopify/flash-list — evita error de SHA-1 en archivos dist
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
