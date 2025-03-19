const webpack = require('webpack');
const path = require('path');
const paths = require('./paths');
const getClientEnvironment = require('./env');

// variables
const srcDir = 'src';
const buildDir = 'build';
const isProduction = process.env.MODE !== 'development';
const sourcePath = path.join(__dirname, '..', `./${srcDir}`);
const outPath = path.join(__dirname, '..', `./${buildDir}`);
const publicUrl = '';
const env = getClientEnvironment(publicUrl);
const TerserPlugin = require('terser-webpack-plugin');

// plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CSSMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ignoredFiles = require('react-dev-utils/ignoredFiles');

// dev server proxy
const createDevServerConfig = require('./webpackDevServer.config');
const serverConfig = createDevServerConfig();

// rules
const codeRules = require('./rules/code');
const styleRules = require('./rules/styles');
const otherRules = require('./rules/other');

//PROD
const configProd = {
  app: [`${sourcePath}/index.tsx`],
  appFilename: 'static/js/app-[hash].js',
  vendorFilename: 'static/js/vendor-[contenthash].js',
  plugins: [
    new CleanWebpackPlugin(),
    // Minify the code.
    new WebpackManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public', to: '' }]
    }),
  ],
  maxAssetSize: 10 * 1048576,
};

// DEV
const configDev = {
  app: ['react-dev-utils/webpackHotDevClient', `${sourcePath}/index.tsx`],
  appFilename: 'app-debug-[name].js',
  vendorFilename: 'vendor-debug.js',
  devtool: 'eval-cheap-source-map',
  cssUse: [],
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: 'public', to: '' }]
    }),
  ],
  maxAssetSize: 40 * 1048576,
};

console.log(`isProduction = ${isProduction}`);
const config = isProduction ? configProd : configDev;

module.exports = {
  // context: sourcePath,
  entry: config.app,
  output: {
    filename: config.appFilename,
    path: outPath,
    publicPath: '/',
  },
  devtool: config.devtool,
  resolve: {
    extensions: [
      '.mjs',
      '.web.ts',
      '.ts',
      '.web.tsx',
      '.tsx',
      '.web.js',
      '.js',
      '.json',
      '.web.jsx',
      '.jsx',
      '.css',
      'scss',
    ],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    mainFields: ['module', 'browser', 'main'],
    alias: {
      src: `${sourcePath}/`,
      components: `${sourcePath}/components`,
      assets: `${sourcePath}/assets`,
      interfaces: `${sourcePath}/interfaces`,
      constants: `${sourcePath}/constants`,
      contexts: `${sourcePath}/contexts`,
      models: `${sourcePath}/models`,
      modalPages: `${sourcePath}/modalPages`,
      pages: `${sourcePath}/pages`,
      stores: `${sourcePath}/stores`,
      services: `${sourcePath}/services`,
      themes: `${sourcePath}/themes`,
      ui: `${sourcePath}/ui`,
      utils: `${sourcePath}/utils`,
    },
  },
  module: {
    rules: [...codeRules(), ...styleRules(), ...otherRules()],
  },
  optimization: {
    minimizer: [
      new CSSMinimizerWebpackPlugin({}),
      new TerserPlugin({
        terserOptions: {
          sourceMap: true, // Must be set to true if using source-maps in production
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      minSize: 1000000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: false,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: 'vendors',
          maxSize: 240000,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
  },
  performance: {
    hints: 'warning', // enum
    maxAssetSize: config.maxAssetSize, // int (in bytes),
    maxEntrypointSize: config.maxAssetSize, // int (in bytes)
    assetFilter: function(assetFilename) {
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    },
  },
  stats: 'errors-only',
  devServer: serverConfig,
  watchOptions: {
    ignored: ignoredFiles(paths.appSrc),
  },
  plugins: (function() {
    let plugins = [];
    plugins.push(
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
      new webpack.ProvidePlugin({
        React: 'react',
        Promise: 'es6-promise', //add Promises for IE !!!
      }),
      new webpack.DefinePlugin(env.stringified),
      // new BundleAnalyzerPlugin()
    );
    if (config.plugins) {
      plugins = plugins.concat(config.plugins);
    }
    return plugins;
  })(),
};
