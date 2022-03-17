/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  serverBuildTarget: "aws-amplify",
  server: "./server.js",
  ignoredRouteFiles: [".*"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "amplify/hosting-compute/api/remix/index.js",
  // publicPath: "/build/",
  // devServerPort: 8002
};
