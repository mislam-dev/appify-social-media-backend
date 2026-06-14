/**
 * Custom Jest resolver that handles pnpm's symlinked node_modules structure.
 * Jest's default resolver (the `resolve` npm package) doesn't follow pnpm symlinks
 * correctly with Jest 30, so we fall back to Node's native require.resolve.
 */
module.exports = (request, options) => {
  try {
    return require.resolve(request, { paths: [options.basedir, ...((options.paths) || [])] });
  } catch (_) {
    return options.defaultResolver(request, options);
  }
};
