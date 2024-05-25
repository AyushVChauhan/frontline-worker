const modules = require("../../models/modules");
const { default: mongoose } = require("mongoose");

module.exports.getModule = async function (req, res) {
  let errors = null;
  if (req.session.errors) {
    errors = req.session.errors;
    req.session.errors = null;
  }
  let module_data = await modules.find({ subjectId: req.params.id });
  // res.render("./coordinator/modules",{module_data,errors})
  res.json({
    module_data,
  });
};
