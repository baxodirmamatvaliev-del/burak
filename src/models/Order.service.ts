import { shapeIntMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Order, OrderItemInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import {ObjectId} from "mongoose"



 class OrderService {
    private readonly orderModel;
    private readonly orderItemModel;

    constructor(){
        this.orderModel = OrderModel;
        this.orderItemModel = OrderItemModel;
    }

   public async createOrder(
    member: Member,
     input:  OrderItemInput[]
    ): Promise<Order> {
    const memberId = shapeIntMongooseObjectId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
        return accumulator + item.itemPrice * item.itemQuantity;  //TODO: shu yerni korishim kerak!
    },0);
    const delivery = amount < 100 ? 5 : 0;
    console.log("values", amount ,delivery)

    try{
    const newOrder : Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId
    });


    const orderId = newOrder._id
    console.log("orderId:", orderId);
    await this.recordOrdeItem(orderId, input);
    return newOrder;
    }catch(err){
    console.log("ERROR!, model:createOrder:", err)
    throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
    }

   }


   private async recordOrdeItem(
    orderId: ObjectId,
     input: OrderItemInput[]): 
     Promise<void> {
    const promisedList = input.map( async (item:OrderItemInput) => {
      item.orderId = orderId
      item.productId= shapeIntMongooseObjectId(item.productId);
      await this.orderItemModel.create(item)
      return "INSERTED";
     });
   
     console.log("promisedLisd:", promisedList)
     const orderItemsStae = await Promise.all(promisedList)

   }

 }

 export default OrderService;
