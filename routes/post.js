const express = require('express');
const router = express.Router();;
const models = require('../models');
// const TurndownService = require('turndown');

const tr = require('transliter');

 //GET for add
 router.get('/add', async (req,res)=>{
   const userId = req.session.userId;
   const userLogin = req.session.userLogin;
   if(!userId || !userLogin){
       res.redirect('/');
    }else{
        try{
            const post = await models.Post.findOne({
                owner :userId,
                status:'draft'
            })
            if(post){
                res.redirect(`/post/edit/${post.id}`);
            }else{
                const post =await models.Post.create({
                    owner :userId,
                    status:'draft' 
                })
                res.redirect(`/post/edit/${post.id}`);
            }
        }catch(error){
            console.log(error)
        }
    }
})

 //GET for edit
 router.get('/edit/:id', async (req,res, next)=>{
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    const id = req.params.id.trim().replace(/ +(?= )/g, '');//clear from spaces
    if(!userId || !userLogin){
        res.redirect('/');
    }else{
         try{
            const post= await models.Post.findById(id).populate('uploads');
            if(!post){
                const err = new Error('Not Found');
                err.status = 404;
                next(err);
            }
            res.render('post/edit',{
                post,
                user:{
                    id: userId,
                    login: userLogin
                }
            });
         }catch(error){
            console.log(error);
         }
     }
 })

//POST is add
router.post('/add', async (req,res)=>{
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;

    // console.log(req.body)
    if(!userId || !userLogin){
        res.redirect('/');
    }else{
    const ob ={
        title:req.body.title.trim().replace(/ +(?= )/g, ''),
        body: req.body.body.trim(),
        isDraft: !!req.body.isDraft,
        postId: req.body.postId
    },url=`${tr.slugify(ob.title)}-${Date.now().toString(36)}`,arr=[];
  //  const turndownService = new TurndownService(); markdown
    if(!ob.title || !ob.body ){
        for(let key in ob){
            if(!ob[key]){arr.push(key)};
        }
        res.json({
          ok:false,
          error: 'Все поля должны быть заполнены',
          fields: arr
       });
   }
   else if(ob.title.length < 3 || ob.title.lenght >64){
    res.json({
        ok:false,
        error: 'Длина заголовка должна быть от 3 до 64 символов!',
        fields: ['title']
    });
    }  else if(ob.body.length < 3 ){
    res.json({
        ok:false,
        error: 'Текст не менее 3 символов!',
        fields: ['body']
    });

    } else if( !ob.postId){
        res.json({
            ok: false
        })
    } else{
        try{
                const post = await models.Post.findOneAndUpdate({
                    _id: ob.postId,
                    owner:userId
                },
                {
                    title: ob.title,
                    body:ob.body,
                    url: url,
                    owner: userId,
                    status: ob.isDraft ? 'draft': 'published'
                },
                function(err, doc){
                    doc.save();
                    if(err) return console.log(err)
                }
                );
                if(!post){
                    res.json({
                        ok:false,
                        error:'Пост не твой!'
                    })
                }else{
                 //   console.log(post)
                    res.json({
                        ok:true,
                        post
                    });
                }
        }catch(error){
            console.log(error)
            res.json({
                ok:false,
                error:error
            });
        }
 //       models.Post.create({
 //         title:ob.title,
 //         body: ob.body,
 //         owner:userId
 //       }).then(post=>{
 //          console.log(post);
 //          res.json({
 //           ok:true
 //           })
 //       }).catch(err=>{
 //           console.log(err);
 //           res.json({
 //               ok:false
 //               })
 //       })
    
   }
    }
   
})

module.exports= router;