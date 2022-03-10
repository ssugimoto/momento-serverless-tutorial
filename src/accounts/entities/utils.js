const slugify = require("slugify");

const slugifyName = (name) => {
  return slugify(name, { lower: true });
};

module.exports = {
  slugifyName,
};
