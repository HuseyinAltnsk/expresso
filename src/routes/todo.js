const router = require("express").Router();

todolist = []
router.get("/", (req, res, next) => {
  res.render("todo", { todolist });   /*same as { todolist }    it completes the rhs*/
});

router.post('/', function(req,res){
<!-- -->
  var todoitem = req.todo;
  todolist.push(todoitem);
  console.log(req.body.todo);
  res.render("todo", {todolist});
});


router.post('/', function remove(req,res){
  var
});
module.exports = router;
