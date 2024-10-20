// @ts-check

const config = {
  parser: '@typescript-eslint/parser',
  extends: [
    'standard',
    'standard-jsx',
    'prettier',
    'prettier/react',
    'prettier/standard',
    'plugin:@typescript-eslint/recommended',

    // Uses eslint-config-prettier to disable ESLint rules from
    // @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',

    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    'plugin:prettier/recommended',
    'plugin:security/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  plugins: ['react', 'prettier', 'standard', 'jest', 'security', 'import-casing', 'import', 'node'],
  overrides: [
    {
      // We don't want to apply prettier to automatically generated files
      files: ['./generated/*'],
      rules: {
        'prettier/prettier': 0,
      },
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 0,
      },
    },
    {
      files: ['**/*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      files: ['**/*.spec.js'],
      rules: {
        'import/first': 'off',
        'security/detect-non-literal-regexp': 'off',
      },
    },
    {
      files: ['clients/src/**/*.js'],
      rules: {
        'import/no-commonjs': 'error',
      },
    },
    {
      files: ['**/*.spec.ts'],
      rules: {
        'import/first': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    {
      files: ['**/*.ts'],
      rules: {
        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 'error',
        '@typescript-eslint/explicit-member-accessibility': [
          'error',
          { overrides: { constructors: 'no-public' } },
        ],
      },
    },
    {
      files: ['**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
    {
      files: ['services/**/peak/**/*.js'],
      rules: {
        'import/extensions': ['error', 'ignorePackages'],
        'import/no-unresolved': 'off',
        'no-restricted-globals': 'off',
      },
      globals: {
        __ENV: 'readonly',
      },
    },
  ],
  settings: {
    react: { version: '16.6' },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
  rules: {
    'import-casing/no-case-mismatch': 'error',
    'jest/no-focused-tests': 'error',
    'import/default': 2,
    'import/no-named-default': 'off',
    camelcase: 'off',
    'max-len': [
      'off',
      {
        code: 100,
        ignoreUrls: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'prettier/prettier': 'error',
    'standard/no-callback-literal': 'off',
    'no-unexpected-multiline': 'off',
    'no-return-await': 'off',
    'node/no-deprecated-api': 'off',
    'new-cap': 'off',
    'lines-between-class-members': 'off',
    'spaced-comment': [
      'error',
      'always',
      {
        line: {
          markers: [
            '#region',
            '#endregion',
            // Ignore TypeScript triple-slash directives
            '/',
          ],
        },
      },
    ],

    // React
    'react/jsx-handler-names': 'off',

    // Security specific
    'security/detect-non-literal-fs-filename': 'off',
    'security/detect-object-injection': 'off',
    'security/detect-child-process': 'off',

    // TypeScript-specific
    'no-unused-vars': 'off',
    'import/export': 'off',
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'none',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-empty-interface': [
      'error',
      {
        allowSingleExtends: true,
      },
    ],
    '@typescript-eslint/no-use-before-define': ['error', { functions: false, typedefs: false }],
    '@typescript-eslint/no-duplicate-enum-values': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unsafe-declaration-merging': 'off',
    '@typescript-eslint/no-var-requires': 'off',

    // Import order rules
    'import/order': [
      'warn',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: ['builtin', 'external', 'internal'],
        'newlines-between': 'always',
        pathGroups: [
          {
            group: 'external',
            pattern: 'react+(|-native)',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
  },
  env: {
    'jest/globals': true,
    browser: true,
  },
  globals: {
    fetch: false,
  },
};

module.exports = config;