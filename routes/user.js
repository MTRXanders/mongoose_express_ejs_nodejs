const express = require('express'),
  router = express.Router(),
  bcrypt = require('bcrypt-nodejs'),
  models = require('../models');

// GET verificate Email
router.get('/confirm/:str', async (req, res) => {
  const verificationString = req.params.str.trim().replace(/ +(?= )/g, '');
  try {
    const user = await models.User.findOneAndUpdate(
      { verificationString },
      { loginVerified: true },
      { new: true }
    );
    console.log(user)
    if (!user) {
      res.render('user/nonConfirmed');
    } else {
      if(!req.session){
        req.session.userId = user.id;
        req.session.userLogin = user.login;
        req.session.userName = user.name;
      }
      res.render('user/confirmed');
    }
  } catch (error) {
    res.json({
      ok: false,
      error: error
    });
  }
});


module.exports = router;
