const express = require('express');
const router = express.Router();
const models = require('../models')
const config = require('../config');
const moment = require('moment');
moment.locale('ru');
const showdown = require('showdown');


 async function posts(req, res){
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    const perPage = +config.PER_PAGE;
    const page = req.params.page || 1;

    try{
    let posts = await  models.Post.find({
        status: 'published'
    })
    .skip(perPage*page-perPage)
    .limit(perPage)
    .populate('owner','login')// populate Post's property 'owner' by the reference object("User") in model
    .populate('uploads')
    .sort({createdAt:-1})
    
    const converter = new showdown.Converter()

    posts =posts.map(post=>{
        let body = post.body;
        if(post.uploads.length){
         post.uploads.forEach(upload =>{
             body = body.replace(`image${upload.id}`, 
             `/${config.DESTINATION}${upload.path}`)
         })
        }
        return Object.assign(post, {
            body: converter.makeHtml(body)
        })

    })
    console.log(posts)
    const count = await models.Post.countDocuments()
    
    res.render('archive/index',{
    posts,
    current:page,
    pages:Math.ceil(count/perPage),
    user:{
        id:userId,
        login: userLogin
    }
    })
    } catch(error){
        console.log(error)
        throw new Error('Server Error');
    }
   
}
// routes 
//index
router.get('/', (req,res)=>posts(req,res));
// history posts
router.get('/archive/:page', (req, res)=> posts(req,res));

// ref to the post page
router.get('/posts/:post', async (req,res,next)=>{
    const url = req.params.post.trim().replace(/ +(?= )/g, '');
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    if(!url){
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    }else{
        try{
            const post = await models.Post.findOne({
                url,
                status: 'published'
            }).populate('uploads');
            if(!post){
                const err = new Error('Not Found');
                err.status = 404;
                next(err);
            }else{
                const comments = await models.Comment.find({
                  post: post.id,
                  parent:{$exists:false}  
                })
                //image id convert to path in html
                const converter = new showdown.Converter();
                let body = post.body;
                if(post.uploads.length){
                 post.uploads.forEach(upload =>{
                     body = body.replace(`image${upload.id}`, 
                     `/${config.DESTINATION}${upload.path}`)
                 })
                }
                res.render('post/post',{
                    post: Object.assign(post, {
                        body: converter.makeHtml(body)
                    }),
                    comments,
                    moment,
                    user:{
                        id: userId,
                        login: userLogin
                    }
                })
            }
        }catch(error){
            throw new Error(error);
        }
    }
})

//users posts page
router.get('/users/:login/:page*?', (req,res)=>{// *? - Can exist or not
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    const perPage = +config.PER_PAGE;
    const page = req.params.page || 1;
    const login = req.params.login;

    models.User.findOne({login})
    .then(user=>{
        models.Post.find({
            owner: user.id
        })
        .skip(perPage*page-perPage)
        .limit(perPage)
        .populate('owner','login')// populate Post's property 'owner' by the reference object("User") in model & get only LOGIN prop
        .populate('uploads')
        .sort({createdAt:-1})
        .then(posts =>{
            models.Post.countDocuments({owner:user.id}).then(count=>{
               
                const converter = new showdown.Converter()
                posts =posts.map(post=>{
                    let body = post.body;
                    if(post.uploads.length){
                     post.uploads.forEach(upload =>{
                         body = body.replace(`image${upload.id}`, 
                         `/${config.DESTINATION}${upload.path}`)
                     })
                    }
                    return Object.assign(post, {
                        body: converter.makeHtml(body)
                    })
                })
                res.render('archive/user',{
                    posts,
                    current:page,
                    pages:Math.ceil(count/perPage),
                    user:{
                        id:userId,
                        login: userLogin
                    }
                })
            }).catch(()=>{
                throw new Error('Server Error');
            });
        }).catch(()=>{
            throw new Error('Server Error');
        });
    })
})

module.exports = router;