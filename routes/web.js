function initroutes(app) {

  app.get("/login",function(req,res) {

    res.render("login")
  })
  app.get("/signup",function(req,res) {
    res.render("signup")
  })


}
module.exports=initroutes
