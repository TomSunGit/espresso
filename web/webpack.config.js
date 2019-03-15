const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devServer: {
        proxy: {
            '/api': 'http://localhost:7071/'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'awesome-typescript-loader?declaration=false',
                exclude: [/\.(spec|e2e)\.ts$/]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: false,
            template: require('html-webpack-template'),
            title: 'Espresso',
            meta: [
                {
                    name: "google-signin-scope",
                    content: "profile email"
                },
                {
                    name: "google-signin-client_id",
                    content: "416677073471-cmp44c8ua8bqgv71tjuo8g0tqfb5mh8j.apps.googleusercontent.com"
                }
            ],
            window: {
                instrumentationKey: '<%INSTRUMENTATION_KEY%>',
                functionsCode: '<%FUNCTIONS_CODE%>',
                functionsHostname: '<%FUNCTIONS_HOSTNAME%>'
            },
            scripts: [
                {
                    src:"https://apis.google.com/js/platform.js?onload=renderButton",
                    async: "true",
                    defer: "true"
                }
            ]
        }),
    ]
};
