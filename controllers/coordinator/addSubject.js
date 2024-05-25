const subjects = require("../../models/subjects");
const { default: mongoose } = require("mongoose");

module.exports.addSubject = async function (req, res) {
  let errors = null;
  if (req.session.errors) {
    errors = req.session.errors;
    req.session.errors = null;
  }
  let subject = new subjects({
    name: req.body.name,
  });
  console.log(req.body.name);
  await subject.save();
  console.log(errors);
  res.redirect("/coordinator/subject");
};
