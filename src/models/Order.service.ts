import { shapeIntMongooseObjectId } from "../libs/config";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import {ObjectId} from "mongoose"
import MemberService from "./Member.service";



 class OrderService {
    private readonly orderModel;
    private readonly orderItemModel;
    private readonly memberService;

    constructor(){
        this.orderModel = OrderModel;
        this.orderItemModel = OrderItemModel;
        this.memberService = new MemberService();
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

   public async  getMyOrders(
    members: Member, 
    inquiry: OrderInquiry
   ): Promise<Order[]>{
    const memberId = shapeIntMongooseObjectId(members._id);
    const matches = {memberId: memberId, orderStatus: inquiry.orderStatus}; // jarayondagi orderlarni chiqarishni talab qilamiz!, req qilayotgan memberni statusi PAUSE bolgan orderlarni topib ber!

    const result = await this.orderModel.aggregate([
        { $match: matches },
        { $sort: {updateAt: -1} }, // eng oxirgi ozgarish bolganlarni yuqorida korsat deyapmiz:
        { $skip: (inquiry.page -1)*inquiry.limit},
        { $limit: inquiry.limit },
        {
            $lookup: {
                from: "orderItems",
                localField: "_id",
                foreignField: "orderId",
                as: "orderItems",
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "orderItems.productId",
                foreignField: "_id",
                as: "productData"
            }
        }
    ])
    .exec();
    if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    return result; 
   }


   public async updateOrder(
    member: Member, 
    input: OrderUpdateInput
   ): Promise<Order>{
   const memberId =shapeIntMongooseObjectId(member._id),
   orderId = shapeIntMongooseObjectId(input.orderId),
   orderStatus = input.orderStatus;


   const result = await this.orderModel.findByIdAndUpdate({
    memberId: memberId, 
    _id: orderId,
   },
   {orderStatus: orderStatus},
   { new: true}
   )
    .exec();
    if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if(orderStatus === OrderStatus.PROCESS) { // PAUSES dan ~ PROCESS ga otayotgan bolsa , user pointini 1 ga oshirramiz:
        await this.memberService.addUserPoint(member, 1)
    }
    
    return result;

   }
    
 }

 export default OrderService;
