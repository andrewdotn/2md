const toc = require("remark-toc");
const slug = require("remark-slug");

module.exports = {
  remarkPlugins: [[toc, { maxDepth: 3 }], slug]
};
