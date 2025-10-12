const webpack = require('webpack');
const path = require('path');

module.exports = function override(config, env) {
  // Disable auto-refresh and hot reload completely - CRA specific
  if (config.watchOptions) {
    config.watchOptions.ignored = [
      path.resolve(__dirname, "node_modules"),
      path.resolve(__dirname, "build"),
      path.resolve(__dirname, ".git"),
      path.resolve(__dirname, ".env"),
      path.resolve(__dirname, ".env.local"),
      path.resolve(__dirname, ".env.production"),
      path.resolve(__dirname, "backend"),
      path.resolve(__dirname, "logs"),
      /\.log$/,
    ];
    config.watchOptions.poll = false;
    config.watchOptions.aggregateTimeout = 5000;
  } else {
    config.watchOptions = {
      ignored: [
        "**/node_modules/**",
        "**/build/**",
        "**/.git/**",
        "**/.env",
        "**/.env.local",
        "**/backend/**",
        "**/logs/**",
        "**/*.log",
      ],
      poll: false,
      aggregateTimeout: 5000,
    };
  }
  
  // Keep Fast Refresh but disable overlay (don't remove the plugin or $RefreshReg$ will be undefined)
  // The watchOptions above will prevent unnecessary rebuilds

  // Webpack 5 polyfills with fully specified paths
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    assert: require.resolve('assert'),
    http: require.resolve('stream-http'),
    https: require.resolve('https-browserify'),
    os: require.resolve('os-browserify'),
    url: require.resolve('url'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
    vm: require.resolve('vm-browserify'),
    zlib: false,
    path: false,
    fs: false,
  };
  
  // Fix for xlsx/amcharts modules
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];
  
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};
