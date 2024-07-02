import mongoose, { mongo } from 'mongoose'

const ProductSchema=new mongooose.Schema({
  name:{
    type:String,
    required:true,
  },
  productImage:{
    type:String
  },
  price:{
    type:Number,
    default:0
  },
  stock:{
    type:Number,
    default:0
  },
  category:{
    type=mongoose.Schema.Types.ObjectId,
    ref='Category'
  },
  owner:{
    type=mongoose.Schema.Types.ObjectId,
    ref='User'
  }
},{timestamps:true})

export const Product=mongoose.model('Product',ProductSchema)