const topics = require("../../models/topics");
const { default: mongoose } = require("mongoose");

module.exports.getTopic = async function (req, res) {
  let errors = null;
  if (req.session.errors) {
    errors = req.session.errors;
    req.session.errors = null;
  }
  console.log(errors);
  let topic_data = await topics.find(req.query);
  // res.render("./coordinator/modules",{module_data,errors})
  res.json({
    topic_data,
  });
};
