module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/vue3-essential',
        '@vue/standard',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        indent: 0,
        'space-before-function-paren': 0,
        semi: 0,
        'comma-dangle': 0,
        quotes: 0,
        'no-var-requires': "off",
        'no-unused-vars': 'off',
        "prefer-const": ["off", {
            destructuring: "any",
            ignoreReadBeforeAssign: true
        }]
    }
}
