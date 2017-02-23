var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/school_db");

var contactbookSchema = new mongoose.Schema({
   grade: String,    
   category: String,
   content: String,
   post_user: String,
   post_date: String,
   notification: {
       type: Boolean,
       default: false
   }
});

// var contactbook = mongoose.model("contactbook", contactbookSchema);
module.exports = mongoose.model("contactbook", contactbookSchema);

// contactbook.find({}, function(err, contactbooks){
//    if(err) {
//        console.log("Error//" + err);
//    } else {
//        console.log(contactbooks);
//    }
// });

// contactbook.create({
//     grade: "國三",
//     category: "數學班",
//     content: "1. 數學講義 p.18~p.25 \r\n 2. 考卷訂正 \r\n 3. 複習第一冊全",
//     post_user: "數學老師",
//     notification: false
// }, function(err, article){
//     if(err) {
//          console.log("Error//" + err);
//     } else {
//          console.log(contactbook);
//     }
// });
