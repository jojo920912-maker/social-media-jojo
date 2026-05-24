import eslint from '@eslint/js'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'
import importPlugin from 'eslint-plugin-import-x'

export default [
  eslint.configs.recommended,
  ...eslintPluginVue.configs['flat/recommended'],

  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
  },

  {
    plugins: {
      'import-x': importPlugin,
    },
    rules: {
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'never'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'eol-last': ['error', 'always'],
      'brace-style': ['error', '1tbs', { allowSingleLine: false }],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      eqeqeq: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-useless-return': 'warn',
      'no-else-return': 'warn',
      'no-unexpected-multiline': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'vue/html-quotes': ['error', 'single', { avoidEscape: true }],
      'vue/html-indent': ['error', 2],
      'vue/attributes-order': ['error', { alphabetical: true }],
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-components': 'warn',
      'no-undef': 'off',
      'no-restricted-imports': ['error', { patterns: ['../*', './*'] }],
      'import-x/no-relative-parent-imports': 'error',
      'import-x/no-relative-packages': 'error',
    },
  },
]
