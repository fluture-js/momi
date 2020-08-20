export default {
  input: 'index.js',
  external: [
    'fluture',
    'http',
    'monastic',
    'sanctuary-type-classes',
  ],
  output: {
    format: 'cjs',
    name: 'momi',
    file: 'index.cjs',
    interop: false,
  },
};
