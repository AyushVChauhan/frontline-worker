const subjects = require("../../models/subjects");
const { default: mongoose } = require("mongoose");

module.exports.getSubject = async function (req, res) {
  let errors = null;
  if (req.session.errors) {
    errors = req.session.errors;
    req.session.errors = null;
  }
  let sub_data = await subjects.find({});
  // console.log(errors);
  // res.render("./coordinator/subjects", { sub_data, errors });
  res.json({
    sub_data,
  });
};
