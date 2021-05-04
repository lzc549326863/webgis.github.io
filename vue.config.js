module.exports = {
  publicPath: './',
  devServer: {
    open: true
  },
  lintOnSave: false,
  productionSourceMap: false,
  chainWebpack: config => {
    config.performance.set('hints', false);
  },
  configureWebpack: {
    plugins: [],
    module: {
      rules: [
      ],
    },
  },
}
