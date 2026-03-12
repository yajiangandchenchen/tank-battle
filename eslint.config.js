import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: ['dist/**', 'node_modules/**'],
	},
	{
		rules: {
			// 忽略以下划线开头的未使用变量
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			// any 类型警告而非错误
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	}
);
