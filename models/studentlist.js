var mongoose                   = require("mongoose"),
    passportLocalMongoose      = require("passport-local-mongoose");
// mongoose.connect("mongodb://localhost/school_db");

var studentSchema = new mongoose.Schema({
   name: String,
   username: String,
   student_phone: String,
   father_name: String,
   father_phone: String,
   mother_name: String,
   mother_phone: String,
   home_phone:String,
   grade: String,
   category: String,
   last_login:String,
   point:String
});

studentSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("studentList", studentSchema);
// var studentList = mongoose.model("studentList", studentSchema);

// studentList.find({}, function(err, students){
//    if(err) {
//        console.log("Error//" + err);
//    } else {
//        console.log(students);
//    }
// });

// studentList.create(
//     {
//       name: "陳阿惠",
//       username: "12345",
//       student_phone: "0912345678",
//       father_name: "陳功",
//       father_phone: "0998765432",
//       mother_name: "黃惠欣",
//       mother_phone: "0921333333",
//       grade: "國一",
//       category: "數學班"
//     },function(err, studentlist){
//       if(err){
//           console.log(err);
//       } else {
//           console.log("success");
//           console.log(studentlist);
//       }
       
//     });
    
// studentList.create(
//     {
//       name: "張飛",
//       username: "67890",
//       student_phone: "098765433",
//       father_name: "張清方",
//       father_phone: "0999999999",
//       mother_name: "王阿玉",
//       mother_phone: "0955555555",
//       grade: "國一",
//       category: "英文班"
//     },function(err, studentlist){
//       if(err){
//           console.log(err);
//       } else {
//           console.log("success");
//           console.log(studentlist);
//       }
       
//     });    