// Exclude heavy ML packages from install in Docker environments
const EXCLUDED = new Set([
  '@xenova/transformers',
  'onnxruntime-node',
  'onnxruntime-web',
  '@qdrant/js-client-rest',
]);

function readPackage(pkg, context) {
  for (const dep of Object.keys(pkg.optionalDependencies || {})) {
    if (EXCLUDED.has(dep)) {
      delete pkg.optionalDependencies[dep];
    }
  }
  for (const dep of Object.keys(pkg.dependencies || {})) {
    if (EXCLUDED.has(dep)) {
      delete pkg.dependencies[dep];
    }
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
