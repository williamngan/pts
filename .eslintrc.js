module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "@stylistic"
    ],
    "rules": {
        "no-prototype-builtins": "off",
        "prefer-spread": "off",
        "prefer-const": "off",
        "no-control-regex": "off",

        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-this-alias": "off",
        "@typescript-eslint/no-unused-vars": "off",

        "@stylistic/indent": ["error", 2],
        "@stylistic/semi": ["error", "always"],
        "@stylistic/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "@stylistic/arrow-spacing": ["error", { "before": true, "after": true }],
        "@stylistic/space-in-parens": ["error", "always"],
        "@stylistic/array-bracket-spacing": ["error", "never"],
        "@stylistic/space-infix-ops": ["error", { "int32Hint": true }],
    }
};
