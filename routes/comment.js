const express = require('express');
const router = express.Router();;
const models = require('../models');
const TurndownService = require('turndown');

//POST is add
router.post('/add', async (req,res)=>{
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    if(!userId || !userLogin){
    //    console.log(req.params)
        res.json({
            ok:false
        })
    }else{
        const post = req.body.post;
        const body = req.body.body;
        const parent = req.body.parent;
        try{
            if(!body){
                res.json({
                    ok:false,
                    error: 'Необходимо заполнить поле',
                    fields: ['body']
                })
            }else{
            if(!parent){
                    await models.Comment.create({
                    post,
                    body,
                    owner:userId
                })
                res.json({
                    ok:true,
                    body,
                    login:userLogin
                });
            }else{
                const parentComment = await models.Comment.findById(parent)
                if(!parentComment){
                    res.json({
                        ok:false
                    });  
                }
                    const comment = await models.Comment.create({
                       post,
                       body,
                       parent,
                       owner:userId
                   });
                   const children = parentComment.children;
                   children.push(comment.id);
                   parentComment.children =children;
                   await parentComment.save();
                   res.json({
                       ok:true,
                       body,
                       login:userLogin
                   });
            }
        }
        }catch(error){
            console.log(error);
            res.json({
                ok:false
            });
        }
    }
})

router.post('/delete', async (req,res) =>{
      const userId = req.session.userId;
      const userLogin = req.session.userLogin;
      const commentId = req.body.commentId;
      if(!userId || !userLogin){
          res.json({
              ok:false
          })
      }else{
          try{
            const comment = await models.Comment.findById(commentId);
            const parentPost = comment.post;
            if( userId == comment.owner.id ){
                if(comment.children.length > 0){
                    if(comment.class == ''){
                    await models.Post.findByIdAndUpdate(
                         parentPost,
                         {$inc:{commentCount: -1}},
                         {new:true}
                    )
                    await models.Comment.findOneAndUpdate({_id:commentId},{body:'Автор удалил комментарий',class:'deleted'}, function(err,doc){
                        doc.save(function(k){
                        // if(k)return console.log(k)
                        res.json({
                            ok:true
                        });
                        })
                    })
                   
                    }else{
                        if(comment.class != 'deleted'){
                        await models.Comment.findByIdAndDelete(comment.id,function(err,doc){
                        if(err) return console.log(err);
                        //  console.log('Удален комментарий',doc)
                        res.json({
                            ok:true
                        });
                        });
                    }
                    }
                }else{
                    if(comment.class != 'deleted'){
                     await models.Post.findByIdAndUpdate(
                        parentPost,
                        {$inc:{commentCount: -1}},
                        {new:true}
                    )
                    }
                    await models.Comment.findByIdAndDelete(comment.id,function(err,doc){
                        if(err) return console.log(err);
                       //  console.log('Удален комментарий',doc)
                       res.json({
                           ok:true
                       });
                    });
                }
            }else{
                res.json({
                    ok:false
                });
            }
          }catch(error){
              console.log(error);
              res.json({
                  ok:false
              });
          }
      }
})

module.exports= router;