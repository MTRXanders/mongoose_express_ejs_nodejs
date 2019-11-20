const express = require('express'),
  router = express.Router(),
  bcrypt = require('bcrypt-nodejs'),
  models = require('../models'),
  { check, validationResult } = require('express-validator'),
  mailer = require('../utils/nodemailer'),
  randomStr = require('../utils/randomString'),
  config = require('../config');

// POST is register
router.post('/register', [check('login').isEmail()], (req, res) => {
  let validationErrors = validationResult(req),
    ob = {
      login: req.body.login,
      name: req.body.name,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm
    },
    arr = [];

  if (!ob.login || !ob.name || !ob.password || !ob.passwordConfirm) {
    for (let key in ob) {
      if (!ob[key]) {
        arr.push(key);
      }
    }
    res.json({
      ok: false,
      error: 'Все поля должны быть заполнены',
      fields: arr
    });
    //   } else if (!/^[a-zA-Z0-9]+$/.test(ob.login)) {
    //     res.json({
    //       ok: false,
    //       error: 'Только латинские буквы и цыфры',
    //       fields: ['login']
    //     });
  } else if (ob.login.length < 5 || ob.login.length > 50) {
    res.json({
      ok: false,
      error: 'Длина логина должна быть от 3 до 16 символов!',
      fields: ['login']
    });
  } else if (ob.password !== ob.passwordConfirm) {
    res.json({
      ok: false,
      error: 'Пароли не совпадают',
      fields: ['password', 'passwordConfirm']
    });
  } else if (ob.password.length < 5) {
    res.json({
      ok: false,
      error: 'Минимальная длина пароля 5 символов',
      fields: ['password']
    });
  } else if (!validationErrors.isEmpty()) {
    return res.json({
      ok: false,
      error: 'Некорректный E-mail адрес',
      fields: ['login']
    });
  } else {
    bcrypt.genSalt(10, (err, result) => {
      if(!err){
      bcrypt.hash(ob.password, result, null, (err, hash) => {
        models.User.create({
          login: ob.login,
          name: ob.name,
          password: hash,
          verificationString: randomStr(16, '#aA')
        })
          .then(user => {
            // console.log(user);
            req.session.userId = user.id;
            req.session.userLogin = user.login;
            req.session.userName = user.name;
            let confirm = user.verificationString;

            mailer(
              ob.login,
              'Регистрация прошла успешно',
              'views/mail/authConfirm.ejs',
              {
                login: ob.login,
                pass: ob.password,
                confirm: confirm
              }
            );
            res.json({
              ok: true
            });
          })
          .catch(err => {
            console.log(err);
            res.json({
              ok: false,
              error: 'Ошибка, невозможно создать такого пользователя!'
            });
          });
      });
    }else{
      console.log(err)
    }
    });
  }
});

// Post is login
router.post('/login', (req, res) => {
  let ob = {
      login: req.body.login,
      password: req.body.password
    },
    arr = [],
    login = ob.login;
  if(!ob.login || !ob.password) {
    for (let key in ob) {
      if (!ob[key]) {
        arr.push(key);
      }
    }
    res.json({
      ok: false,
      error: 'Все поля должны быть заполнены',
      fields: arr
    });
  } else {
    models.User.findOne({
      login
    })
      .then(user => {
        if (!user) {
          res.json({
            ok: false,
            error: 'Логин и пароль неверны',
            fields: [ob.login, ob.password]
          });
        } else {
          console.log(user);
          bcrypt.compare(ob.password, user.password, function(err, result) {
            if (!result) {
              res.json({
                ok: false,
                error: 'Логин и пароль неверны',
                fields: [ob.login, ob.password]
              });
            } else {
              req.session.userId = user.id;
              req.session.userLogin = user.login;
              req.session.userName = user.name;
              //   console.log(user.id);
              //   console.log(user.login);
              res.json({
                ok: true
              });
            }
          });
        }
      })
      .catch(err => {
        console.log(err);
        res.json({
          ok: false,
          error: 'Ошибка, попробуйте еще раз!'
        });
      });
  }
});

//GET for logout
router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});
module.exports = router;
