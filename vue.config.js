
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

module.exports = {
  configureWebpack: {
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
    ],
  },
  css: {
    loaderOptions: {
      // pass options to sass-loader
      sass: {
        // @/ is an alias to src/
        // so this assumes you have a file named `src/variables.scss`
        data: `
            @import "@/scss/global.scss";
          `,
      },
    },
  },
};

