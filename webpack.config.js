const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const fs = require('fs')

const getDirs = (url = 'src') => {
  const result = {}
  fs.readdirSync(resolve(url)).forEach((name) => {
    const path_url = resolve(url, name)
    if (fs.statSync(path_url).isDirectory()) {
      result[name] = path_url
    }
  })
  return result
}

module.exports = (_, { mode }) => {
  const isDev = mode === 'development'

  return {
    entry: './src/main.js',

    output: {
      path: resolve(__dirname, 'dist'),
      filename: `js/[name]_[${isDev ? 'hash' : 'chunkhash'}:8].js`
    },

    resolve: {
      alias: {
        svelte: resolve('node_modules', 'svelte'),
        ...getDirs(), ...getDirs('src/assets')
      },
      extensions: ['.mjs', '.js', '.svelte'],
      mainFields: ['svelte', 'browser', 'module', 'main']
    },
    module: {
      rules: [
        {
          test: /\.(html|svelte)$/,
          exclude: /node_modules/,
          loader: 'svelte-loader',
          options: {
            preprocess: require('svelte-preprocess')({
              scss: true
            }),
            emitCss: isDev ? false : true
          }
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          loader: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader']
        },
        {
          test: /\.(gif|png|jpg|jpeg|svg)$/,
          loader: 'url-loader',
          options: {
            limit: 2048,
            name: 'images/[name]_[hash:2].[ext]'
          },
          include: /src/
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          loader: 'url-loader',
          options: {
            name: 'fonts/[name]_[hash:2].[ext]'
          },
          include: /src/
        }
      ]
    },

    devServer: {
      hot: true,
      stats: 'errors-only',
      host: '0.0.0.0',
      clientLogLevel: 'none'
    },

    stats: 'errors-only',

    plugins: [
      new HtmlWebpackPlugin({
        template: resolve(__dirname, 'public/template.ejs')
      }),
      ...(isDev ? [] : [new MiniCssExtractPlugin({
        filename: 'css/[chunkhash:8].[ext]'
      }), new CleanWebpackPlugin()])
    ]
  }
}
