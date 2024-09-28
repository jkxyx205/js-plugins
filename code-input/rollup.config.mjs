import terser from '@rollup/plugin-terser';

export default {
	input: 'src/code-input.js',
	output: {
		// file: 'dist/code-input.min.js',
		file: '/Users/rick/Space/Workspace/sharp-project/sharp-admin/src/main/resources/static/plugins/code-input/code-input.min.js',
		format: 'iife',
		name: 'CodeInput',
		plugins: [terser()]
	}
};