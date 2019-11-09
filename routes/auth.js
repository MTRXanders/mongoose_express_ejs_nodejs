const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt-nodejs');
const models = require('../models');


// POST is register 
router.post('/register',(req,res)=>{
    let ob ={
    login:req.body.login,
    password:req.body.password,
    passwordConfirm: req.body.passwordConfirm
    },arr = [];

   if(!ob.login || !ob.password || !ob.passwordConfirm){
        for(let key in ob){
            if(!ob[key]){arr.push(key)};
        }
        res.json({
          ok:false,
          error: 'Все поля должны быть заполнены',
          fields: arr
       });
   } else if(!/^[a-zA-Z0-9]+$/.test(ob.login)){
    res.json({
        ok:false,
        error: 'Только латинские буквы и цыфры',
        fields: ['login']
    });
   } else if(ob.login.length < 3 || ob.login.length >16){
        res.json({
            ok:false,
            error: 'Длина логина должна быть от 3 до 16 символов!',
            fields: ['login']
        });
   } else if(ob.password !== ob.passwordConfirm){
       res.json({
           ok:false,
           error: 'Пароли не совпадают',
           fields: ['password','passwordConfirm']
       });

   } else if(ob.password.length < 5){
    res.json({
        ok:false,
        error: 'Минимальная длина пароля 5 символов',
        fields: ['password']
    });

    }else{
    // models.User.findOne({
    //     login
    // }).then(user =>{
    //     if(!user){
        let login =ob.login;
            bcrypt.hash(ob.password, null, null, (err, hash) => {
                models.User.create({
                    login,
                    password:hash
                }).then(user =>{
                    console.log(user);
                    req.session.userId =user.id;
                    req.session.userLogin = user.login;
                    res.json({
                        ok:true
                    });
                }).catch(err =>{
                    console.log(err);
                    res.json({
                        ok:false,
                        error: 'Ошибка, невозможно создать такого пользователя!'
                    })
                });
            });
        // }else{
        //     res.json({
        //         ok:false,
        //         error: 'Имя занято!',
        //         fields:[login]
        //     })
        // }
        // })
  
   }
});


// Post is login
router.post('/login',(req,res)=>{
    let ob ={
        login:req.body.login,
        password:req.body.password,
        },arr = [],login =ob.login;

        if(!ob.login || !ob.password){
            for(let key in ob){
                if(!ob[key]){arr.push(key)};
            }
            res.json({
              ok:false,
              error: 'Все поля должны быть заполнены',
              fields: arr
           });
       }else{
           models.User.findOne({
               login
           }).then(user=>{
            if(!user){
                res.json({
                    ok:false,
                    error:'Логин и пароль неверны',
                    fields:[ob.login, ob.password]
                })
            }else{
                console.log(user);
                bcrypt.compare(ob.password, user.password, function(err,result){
                    if(!result){
                        res.json({
                            ok:false,
                            error:'Логин и пароль неверны',
                            fields:[ob.login, ob.password]
                        })
                    }else{
                        req.session.userId =user.id;
                        req.session.userLogin = user.login;
                        console.log(user.id)
                        console.log(user.login)
                        res.json({
                           ok:true,
                       })
                    }
                })
            }
           }).catch(err =>{
               console.log(err);
               res.json({
                   ok:false,
                   error:'Ошибка, попробуйте еще раз!'
               })
           })
       }
});

 //GET for logout
 router.get('/logout',(req,res)=>{
     if(req.session){
         req.session.destroy(()=>{
             res.redirect('/');
         })
     }else{
         res.redirect('/');
     }
 })
module.exports= router;