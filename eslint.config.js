import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  // Configuração para arquivos de frontend (React)
  {
    files: ['**/*.{js,jsx}', '!backend/**'], // Aplica-se a todos os .js e .jsx, exceto na pasta backend
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        // Você pode adicionar outros globals específicos do navegador aqui
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  // Configuração para arquivos de backend
  {
    files: ['backend/**/*.{js,mjs,cjs}'], // Aplica-se a arquivos .js, .mjs e .cjs dentro da pasta backend
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        // Você pode adicionar outros globals específicos do Node.js aqui
      },
      parserOptions: {
        sourceType: 'script', // CommonJS é comum no backend
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-undef': 'error', // Garante que variáveis não declaradas causem erro
      // Adicione ou sobrescreva outras regras específicas do backend aqui
    },
  },
];