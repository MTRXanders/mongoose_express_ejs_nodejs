const mongoose =require('mongoose');
const Schema = mongoose.Schema;
const autopopulate = require('mongoose-autoPopulate');

const Post = require('./post');
const schema = new Schema(
{
    body:{
        type:String,
        required:true,
    },
    post:{
        type: Schema.Types.ObjectId,
        ref:'Post',
    }, 
    parent:{
        type:Schema.Types.ObjectId,
        ref: 'Comment'
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref:'User',
        autopopulate: {select:['_id','login', 'createdAt']}
    },
    children:[
        {
            type:Schema.Types.ObjectId,
            ref:'Comment',
            autopopulate: true
        }
    ],
    class:{
        type: String,
        default:''
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
},
{
    timestamps: false
}
);

schema.pre('save', async function (next){
  if(this.isNew){
    await Post.incCommentCount(this.post);
  }
  next();
});
schema.plugin(autopopulate);
schema.set('toJSON',{
    virtuals:true
});
module.exports = mongoose.model('Comment',schema);