{
  "sideEffects": [
    "*.less",
    "*.scss",
    "*.css"
  ],
  "dependencies": {
    "antd-mobile": "2.3.4",
    "amfe-flexible": "2.2.1",
    "axios": "0.28.0",
    "classnames": "^2.2.6",
    "lodash": "4.17.21",
    "mobx": "5.15.7",
    "mobx-react": "6.3.1",
    "moment": "2.29.2",
    "qs": "6.11.2",
    "react": "17.0.1",
    "react-dom": "17.0.1",
    "react-router-dom": "5.2.0"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.165",
    "@types/mockjs": "^1.0.3",
    "@types/node": "^14.14.31",
    "@types/qs": "^6.9.5",
    "@types/react": "^17.0.0",
    "@types/react-dom": "^17.0.0",
    "@types/react-router": "^5.1.8",
    "@types/react-router-dom": "^5.1.6",
    "cross-env": "^7.0.3",
    "jumai-bundler-cli": "2.3.2",
    "jumai-code-style": "2.3.2",
    "mockjs": "^1.1.0",
    "typescript": "4.2.4"
  },
  "resolutions": {
    "@types/react": "^17.0.0",
    "@types/react-dom": "^17.0.0"
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS && validate-commit-msg"
    }
  },
  "lint-staged": {
    "**/*.less": [
      "npm run lint:style-less",
      "git add ."
    ],
    "**/*.{js,jsx,ts,tsx}": [
      "npm run lint:js",
      "git add ."
    ],
    "**/*.{css,md,html,json}": [
      "prettier --write",
      "git add ."
    ]
  },
  "scripts": {
    "dev-vite": "jumai-bundler-cli dev --vite --open",
    "dev-webpack": "jumai-bundler-cli dev --open",
    "build": "jumai-bundler-cli build",
    "lint-staged": "lint-staged --allow-empty",
    "lint:style-less": "stylelint --cache --quiet --fix \"src/**/*.less\" --syntax less",
    "lint:js": "eslint --fix --cache --quiet --ext .js,.jsx,.ts,.tsx .",
    "prettier": "prettier --cache --cache-strategy metadata -c --write \"**/*.{css,md,html,json}\""
  }
}