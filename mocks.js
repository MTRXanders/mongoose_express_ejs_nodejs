const faker = require('faker');
const models = require('./models');
const owner = '5dd2820ec9163f2e90da2974';
const tr = require('transliter');

module.exports = async () => {
  try {
    await models.Post.deleteMany();
    for (let i = 0; i < 20; i++) {
      setTimeout(function() {
        const title = faker.lorem.words(5);
        const url =`${tr.slugify(title)}-${Date.now().toString(36)}`;
        const post = models.Post.create({
            title,
            url,
            body: faker.lorem.words(100),
            owner
        })
        console.log(post)
      }, 6000);
    }
  } catch (error) {
    console.log(error);
  }
};
