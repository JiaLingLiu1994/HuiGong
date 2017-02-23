var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/school_db");

var classSchema = new mongoose.Schema({
   grade: String,
   category: String,
   class_day: String,
   class_time: String,
   teacher: String
});

module.exports = mongoose.model("classList", classSchema);
// var classList = mongoose.model("classList", classSchema);

// classList.find({}, function(err, classes){
//    if(err) {
//        console.log("Error//" + err);
//    } else {
//        console.log(classes);
//    }
// });


// classList.create(
//     {
//          grade:"國中",
//          category:"數學班",
//          class_day:"禮拜五",
//          class_time:"18:00~22:00",
//          teacher:"張小明"
//     },function(err, classlist){
//       if(err){
//           console.log(err);
//       } else {
//           console.log("success created");
//           console.log(classlist);
//       }
       
//     });