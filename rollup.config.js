export default {
  input: 'index.js',
  external: [
    'fluture/index.js',
    'http',
    'monastic/index.js',
    'sanctuary-type-classes',
  ],
  output: {
    format: 'cjs',
    name: 'momi',
    file: 'index.cjs',
    interop: false,
    paths: {
      'monastic/index.js': 'monastic',
      'fluture/index.js': 'fluture',
    },
    globals: {
      'fluture/index.js': 'Fluture',
      'monastic/index.js': 'monastic',
    },
  },
};
