export default {
  npmClient: "cnpm",
  history: { type: "hash" },
  publicPath:
    process.env.NODE_ENV === "development" ? `http://localhost:8000/` : "./",
  outputPath: "../../release/app/renderer",
};