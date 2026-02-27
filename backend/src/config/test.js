const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://Sandeep_980:Sandy2004@cluster0.qtw5y0q.mongodb.net/test", {
  family: 4
})
.then(() => console.log("Connected"))
.catch(err => console.log(err));