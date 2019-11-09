const express = require('express');
const router = express.Router();
const multer = require('multer');
const models = require('../models');
const path = require('path');
const config = require('../config');
const Sharp = require('sharp');
const mkdirp = require('mkdirp');
const diskStorage = require('../utils/diskStorage');
const rs =()=> Math.random().toString(36).slice(-3);


const storage = diskStorage({
    destination:(req, file, cb)=>{
      const dir = '/'+ rs()+'/'+rs()
      req.dir = dir;
      mkdirp(config.DESTINATION +dir, err => cb(err, config.DESTINATION + dir));
    },
    filename: async (req, file, cb)=>{
        const userId = req.session.userId;
        const fileName = Date.now().toString(36) + path.extname(file.originalname);
        const dir = req.dir;
        console.log(req.body); //{ postId: '5dc51e64f320e74a78fd911e' }
        const post = await models.Post.findById(req.body.postId);
        if(!post){
            const err = new Error('No Post');
            err.code ='No post';
            return cb(err);
        } 
        //upload
        const upload = await models.Upload.create({
            owner: userId,
            path:dir + "/" + fileName
        })
        //write to Post 
        const uploads = post.uploads;
        uploads.push(upload.id);
        post.uploads = uploads;
        await post.save();
        //
        req.filePath = dir + "/" + fileName;
        cb(null,fileName);
    },
    sharp: (req,res,cb)=>{
        const resizer = Sharp()
    .resize(1024,768,{
        withoutEnlargement:true
    })
    .toFormat('jpg')
    .jpeg({
        quality:40,
        progressive: true
    });
    cb(null, resizer);

    }
})
const upload= multer({
    storage,
    limit:{ filesize: 2 *1024 *1024},
    fileFilter: (req,file,cb)=>{
        const ext= path.extname(file.originalname);
        if(ext !=='.jpg' && ext!=='.jpeg' && ext !=='.png'){
            const err = new Error('Extension');
            err.code ='EXTENSION';
            return cb(err);
        }
        cb(null,true)
    }
}).single('file');



router.post('/image',(req,res)=>{
    upload(req,res,err=>{
       let error='';
       if(err){
        if(err.code ==='LIMIT_FILE_SIZE'){
            error ="Картинка не более 2MB"; 
        }       
        if(err.code ==='EXTENSION'){
            error = 'Только jpeg и png';
        }
        if(err.code ==='NO_POST'){
            error = 'Обнови страницу'
        }
       }
       res.json({
        ok: !error,
        error,
        filePath: req.filePath
       })
   });

   

})

module.exports = router;