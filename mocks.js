const faker = require('faker');
const models = require('./models');
const owner = "5dbafdaf77675d00e0b1be2c";
const tr = require('transliter');


module.exports= async ()=>{
    try{
        await  models.Post.deleteMany()
        Array.from({length:20}).forEach( async()=>{
            const title = faker.lorem.words(5);
            const url =`${tr.slugify(title)}-${Date.now().toString(36)}`;
            const post = await models.Post.create({
                title,
                url,
                body: faker.lorem.words(100),
                owner
            })
            console.log(post)
        })
    }catch(error){
        console.log(error)
    }
    

}