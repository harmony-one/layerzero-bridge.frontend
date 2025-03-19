const { prepareProxy, prepareUrls } = require('react-dev-utils/WebpackDevServerUtils');
const paths = require('./paths');

const port = 3000;
const host = process.env.HOST || 'localhost';
const apiUrl = process.env.PROXY_API_URL || 'localhost';
const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const urls = prepareUrls(protocol, host, port);
const proxySetting = require(paths.appPackageJson).proxy;
const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
const proxy = proxyConfig;
const allowedHosts = urls.lanUrlForConfig;

function onProxyRes(proxyResponse) {
  if (proxyResponse.headers['set-cookie']) {
    const cookies = proxyResponse.headers['set-cookie'].map(cookie =>
      cookie.replace(/; (secure|HttpOnly|SameSite=Strict)/gi, '')
    );

    proxyResponse.headers['set-cookie'] = cookies;
  }
}

function onProxyReq(proxyResponse, req) {
  if (req.headers.cookie) {
    proxyResponse.setHeader('cookie', req.headers.cookie);
  }
}

module.exports = function() {
  return {
    // disableHostCheck: !proxy ||
    //   process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
    compress: false,
    client: {
      logging: 'none'
    },
    hot: true,
    static: {
      directory: paths.appPublic,
      publicPath: '/',
    },
    server: protocol,
    watchFiles: ['src/**/*'],
    host,
    port: 3000,
    client: {
      overlay: false,
    },
    historyApiFallback: {
      disableDotRule: true,
    },
    allowedHosts,
  };
};
