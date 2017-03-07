var mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost/school_db");

var articleSchema = new mongoose.Schema({
   category: String,
   title: String,
   content: String,
   post_user: String,
   post_date: String,
   image: String,
   notification: {
       type: Boolean,
       default: false
   }
});

// var article = mongoose.model("article", articleSchema);

module.exports = mongoose.model("article", articleSchema);

// var temp = new article({
//    category: "最新消息",
//    title: "我們新網站上線",
//    content: "透過網站與老師聯繫，也可看見每日孩子作業細項",
//    post_user: "主任",
//    post_date: new Date("2017-01-16"),
//    notification: true
// });

// // save temp to database
// temp.save(function(err, article) {
//    if(err) {
//       console.log("Something goes wrong when the new article tried to save into DB")
//    } else {
//       console.log("Just save the new article to DB")
//       console.log(article);
//    }
// });

// article.create({
//     category: "國三數學班",
//     title: "歡迎家長透過message box與我們聯繫",
//     content: "家長有任何疑問都可以透過message box與我們聯繫",
//     post_user: "數學老師",
//     post_date: new Date("2017-01-18"),
//     notification: false
// }, function(err, article){
//     if(err) {
//          console.log("Error//" + err);
//     } else {
//          console.log(article);
//     }
// });

// article.find({}, function(err, articles){
//    if(err) {
//        console.log("Error//" + err);
//    } else {
//        console.log(articles);
//    }
// });
