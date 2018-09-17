module.exports = {
    "extends": "airbnb",
    "rules": {
        "linebreak-style": ["error", process.env.NODE_ENV === 'prod' ? "unix" : "windows"],
        "no-multiple-empty-lines": [2, {"max": 3, "maxEOF": 1}],
		"indent": ["error", "tab"],
		"no-tabs": "off",
		"space-in-parens": ["error", "always"],
    }
};
