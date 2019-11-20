const mongoose =require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema(
{
    login:{
        type:String,
        required:true,
        unique:true
    },
    loginVerified:{
        type:Boolean,
        default: false
    },
    verificationString:{
        type: String,
    },
    name:{
        type:String,
        unigue:true
    },
    password:{
        type:String,
        required:true,
    }  
},
{
    timestamps: true
}
)
schema.set('toJSON',{
    virtuals:true
});
module.exports = mongoose.model('User',schema);