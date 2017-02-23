var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/school_db");

var insideClassSchema = new mongoose.Schema({
   className: String,
   username:String
});

module.exports = mongoose.model("insideClass", insideClassSchema);
// var insideClass = mongoose.model("insideClass", insideClassSchema);

// insideClass.find({}, function(err, classes){
//    if(err) {
//        console.log("Error//" + err);
//    } else {
//        console.log(classes);
//    }
// });

