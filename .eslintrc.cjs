module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: { project: './tsconfig.json' },
  
    plugins: [
      '@typescript-eslint',
      'react',
      'react-hooks',
      'jsx-a11y',
      'import',
      'unused-imports',
    ],
  
    extends: [
      'airbnb',
      'airbnb-typescript',
      'airbnb/hooks',
      'plugin:prettier/recommended',
    ],
  
    settings: {
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      react: { version: 'detect' },
    },

    rules: {
      'react/react-in-jsx-scope': 'off',
      'import/prefer-default-export': 'off',
      'react/jsx-props-no-spreading': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      'unused-imports/no-unused-imports': 'error',
      // TypeScript specific rules
      '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false, variables: false }],
      // React rules for TypeScript
      'react/require-default-props': 'off', // TypeScript handles this with optional props
      'react/prop-types': 'off', // Using TypeScript for prop validation
      // Accessibility
      'jsx-a11y/img-redundant-alt': 'warn',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      // Code quality
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      'react/no-array-index-key': 'warn', // Sometimes index is acceptable
    },
  };
  