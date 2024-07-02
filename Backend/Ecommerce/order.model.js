import mongoose from 'mongoose'

const orderItemSchema=new mongoose.Schema({
  productId:{
    type=mongoose.Schema.Types.ObjectId,
    ref='Product'
  },
  quantity:{
    required:true,
    type:Number
    
  }

})
const OrderSchema=new mongoose.Schema({
  OrderPrice:{
    type:Number,
    required:true
  },
  Customer:{
    type:mongoose.Scehma.Types.ObjectId,
    ref='User'
  },
  OrderItem:{
    type:[orderItemSchema]
  },
  Address:{
    type:String,
    required:true
  },
  status:{
    type:String,
    enum:['PENDING','CANCELLED','DELIVERED'],
    default:"PENDING"
  }
},{timestamps:true})

export const Order=mongoose.model('Order',OrderSchema)