module.exports = {
    root: true,
    env: {
        node: true,
        'vue/setup-compiler-macros': true
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
        'no-console': 'off',
        'no-debugger': 'off',
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
        }],
    }
}
