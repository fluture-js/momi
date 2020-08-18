export default {
  input: 'index.js',
  external: [
    'fluture/index.js',
    'http',
    'monastic',
    'sanctuary-type-classes',
  ],
  output: {
    format: 'cjs',
    name: 'momi',
    file: 'index.cjs',
    interop: false,
    paths: {
      'fluture/index.js': 'fluture',
    },
    globals: {
      'fluture/index.js': 'Fluture',
    },
  },
};
