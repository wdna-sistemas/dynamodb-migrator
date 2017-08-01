module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "script"
    },
    "extends": "airbnb-base",
    "rules": {
        "no-underscore-dangle": [
            0,
            {
                "allowAfterThis": true,
                "allowAfterSuper": true
            }
        ],
        "class-methods-use-this": [
            0
        ],
        "import/no-extraneous-dependencies": [
            "error",
            {
                "devDependencies": true
            }
        ],
        "comma-dangle": [
            "error",
            {
                "arrays": "always-multiline",
                "objects": "always-multiline",
                "imports": "always-multiline",
                "exports": "always-multiline",
                "functions": "ignore",
            }
        ],
        "no-param-reassign": [
            0
        ],
        "prefer-rest-params": [
            0
        ],
        "object-shorthand": [
            "error",
            "properties"
        ],
        "arrow-body-style": [
            0,
            "always"
        ],
        "indent": [
            "error",
            4,
            {
                SwitchCase: 1,
            }
        ],
        "linebreak-style": [
            0
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "max-len": [
            0,
            120,
            4
        ]
    }
};