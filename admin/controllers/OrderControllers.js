let Order = require('../../models/OrderSchema')
let rejectError = require('../../mainUtils/rejectError')
const paginationHandler = require('../utils/paginationUtils')
const Visitor = require('../../models/VisitorSchema')
const Product = require('../../models/ProductSchema')
const Category = require('../../models/CategorySchema')
let orderControllers = {}

orderControllers.order_get_orders = (req, res) => {
  Order.updateMany({}, {userId: req.userId}).then(docs => console.log(docs, 88)).catch(err => console.log(err, 55))
    let {page, step, search_product, search_customer, status, from, to} = req.query
    
    let filters = {userId: req.userId}
    
    if(status) filters["current_status.name"] = status
    if(search_customer) {
        filters["$or"] = [
            {firstName: {"$regex" : new RegExp(`.*${search_customer}.*`, 'i')}},
            {lastName: {"$regex" : new RegExp(`.*${search_customer}.*`, 'i')}},
            {phone: {"$regex" : new RegExp(`.*${search_customer}.*`, 'i')}}
        ]
    }
    if(search_product) {
        filters["shoppingCart"] = {
            $elemMatch: {
                name: { $regex: new RegExp(`.*${search_product}.*`, 'i') }
            }
        };
    }
    if(from || req.query.to) {
        filters.createdAt = {}
        if(from) filters.createdAt["$gte"] = new Date(from).getTime()
        if(to) filters.createdAt["$lte"] = new Date(to).setHours(23, 59, 59, 999)
    }


    Order.find(filters).sort({ _id: -1 }).then(data => {
        res.status(200).json({...paginationHandler(data, {page, step}), query: req.query})
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_patch_status = (req, res) => {
    let status = {name: req.body.status, addedIn: Date.now()}
    Order.findByIdAndUpdate({_id: req.params.id, userId: req.userId}, {
        current_status: status,
        $push: { status }
    }).then((order) => {
        order.status = [...order.status, status];
        order.current_status = status
        res.status(200).json({message: "The status has been updated.", data: order})
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_delete_order = (req, res) => {
    Order.deleteOne({_id: req.params.id, userId: req.userId}).then(order => {
            res.status(200).json({message: "The product has been deleted."});
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_update_manyOrdersStatus = (req, res) => {
    let status = {name: req.body.status, addedIn: Date.now()}
    Order.updateMany({_id: req.body.itemsSelected, userId: req.userId}, {
        current_status: status,
        $push: { status }
    }).then((docs) => {
                res.status(200).json({message: `${req.body.itemsSelected.length} products has been changed to ${req.body.status}.`})
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_delete_manyOrders = (req, res) => {
    Order.deleteMany({ _id: req.body.itemsSelected, userId: req.userId}).then(async (docs) => {
        res.status(200).json({message: `${docs.deletedCount} orders has been deleted.`})
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_get_order = (req, res) => {
    Order.findOne({_id: req.params.id, userId: req.userId}).then(data => {
        res.status(200).json({data});
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_patch_personalNote = (req, res) => {
    Order.findOneAndUpdate({_id: req.params.id, userId: req.userId}, {
        $push: {personal_notes: req.body.personal_notes}
    }).then(data => {
        res.status(200).json({message: "The new personal note has been seved.", data: [...data.personal_notes, req.body.personal_notes]});
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_delete_status = (req , res) => {
    Order.findOne({_id: req.params.id, userId: req.userId}).then((order) => {
        order.status = order.status.filter((s,index) => index !== req.body.index)
        order.current_status = order.status[order.status.length - 1]
        order.save().then((docs) => {
            res.status(200).json({message: "Status has been removed." , data: docs})
        }).catch(err => rejectError(req, res, err))
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_get_trackingStatus = (req , res) => {
    Order.find({userId: req.userId}).then((orders) => {
        let allStatus = ["all","today","pending","confirmed","shipped","delivered","cancelled","on_hold","delayed","returned"]
        let resultObject = {}
        const todayStart = new Date().setHours(0, 0, 0, 0);
        allStatus.forEach(status => {
            if(status === "all") resultObject[status] = orders.length
            if(status === "today") resultObject[status] = orders.filter(o => o.createdAt >= todayStart).length
            if(status !== "all" && status !== "today") resultObject[status] = orders.filter(o => o.current_status.name === status).length
        })
        res.status(200).json({data: resultObject})
    }).catch(err => rejectError(req, res, err))
}
orderControllers.order_get_trackingDetails = (req , res) => {
    let filters = {userId: req.userId}
    let allStatus = ["pending","confirmed","shipped","delivered","cancelled","on_hold","delayed","returned"]
    if(allStatus.indexOf(req.query.status) !== -1) filters["current_status.name"] = req.query.status
    if(req.query.time === "today") filters.createdAt = {"$gte": new Date().setHours(0,0,0,0)}

    Order.find(filters).then((orders) => {
        let orderExist = orders.map((o , i) => o._id.toString() === req.params.id ? i : null).filter(a => a !== null)
        if(orderExist.length){
            let itemIndex = orderExist[0]
            res.json({data: {
                    previousItem: itemIndex === 0 ? null : orders[itemIndex - 1]._id,
                    currentItem: orders[itemIndex],
                    nextItem: itemIndex === (orders.length - 1) ? null : orders[itemIndex + 1]._id,
                    currentIndex: itemIndex+1,
                    numberOfItems: orders.length,
                    status: req.query.time === "today" ? req.query.time : req.query.status ? req.query.status: "all"
                }
            })
            return
        }
        res.json({success: true , data: {
            previousItem: null,
            currentItem: orders[0],
            nextItem: orders[1]?._id ? orders[1]._id : null,
            currentIndex: 1,
            numberOfItems: orders.length,
            status: req.query.time === "today" ? req.query.time : req.query.status ? req.query.status: "all"
        }})
    }).catch(err => rejectError(req , res , err , "Error: 404 Not Found"))
}
orderControllers.order_get_dashboardStatics = async (req, res) => {
    // Helper function to get date ranges
const getDateRange = (type) => {
    const now = new Date();
    switch (type) {
      case 'today':
        return {
          $gte: new Date(now.setHours(0, 0, 0, 0)), // start of today
          $lt: new Date(now.setHours(23, 59, 59, 999)), // end of today
        };
      case 'lastWeek':
        return {
          $gte: new Date(now.setDate(now.getDate() - 7)), // start of last week
          $lt: new Date(), // now
        };
      case 'lastMonth':
        return {
          $gte: new Date(now.setMonth(now.getMonth() - 1)), // start of last month
          $lt: new Date(), // now
        };
      case 'currentYear':
        return {
          $gte: new Date(now.getFullYear(), 0, 1), // start of current year
          $lt: new Date(), // now
        };
      default:
        return {};
    }
  };
  
  // Function to get total revenue for a date range
  const getRevenue = async (dateRange) => {
    const result = await Order.aggregate([
      {
        $match: { createdAt: dateRange, userId: req.userId } 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_price" },
        },
      },
    ]);
    return result[0]?.totalRevenue || 0;
  };
  
  // Function to get the number of orders for a date range
  const getOrdersCount = async (dateRange) => {
    return await Order.countDocuments({ createdAt: dateRange ,userId: req.userId });
  };
  
  const getVisitorsCount = async ({'$gte': startPeriod, '$lt': endPeriod}) => {
    let visitors = await Visitor.findOne({userId: req.userId});
    if(!visitors) return 0
    return visitors.visits.filter(v => new Date(v).getTime() >= startPeriod && new Date(v).getTime() <= endPeriod).length
}
const xTimesHandler = (dateRange) => {
  const start = dateRange['$gte'];
  const end = dateRange['$lt'];
  const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Array.from({ length: days+1}, (_, i) => new Date(new Date(start).setDate(start.getDate() + i)));
};
async function filterProductsHandler(orders) {
  let productsResult = [];
  let categoriesResult = [];
  let flatOrders = orders.flatMap(order => order.shoppingCart);

  for (const prod of flatOrders) {
    let prodExists = productsResult.find(p => prod._id === p.product_id);
    let catgExists = categoriesResult.find(c => prod.category._id === c.category_id);

    if (prodExists) {
      productsResult = productsResult.map(p => {
        if (prod._id === p.product_id) {
          return {
            ...p,
            quantity: p.quantity + prod.total_quantity,
            revenue: p.revenue + prod.total_price,
          };
        }
        return p;
      });
    } else {
      productsResult.push({
        product_id: prod._id,
        quantity: prod.total_quantity,
        revenue: prod.total_price,
      });
    }

    if (catgExists) {
      categoriesResult = categoriesResult.map(c => {
        if (prod.category._id === c.category_id) {
          return {
            ...c,
            quantity: c.quantity + prod.total_quantity,
            revenue: c.revenue + prod.total_price,
          };
        }
        return c;
      });
    } else {
      categoriesResult.push({
        category_id: prod.category._id,
        quantity: prod.total_quantity,
        revenue: prod.total_price,
      });
    }
  }

    const [products, categories] = await Promise.all([
      Product.find({ _id: productsResult.map((prod) => prod.product_id), userOwner: req.userId  }).select(["name", "media"]),
      Category.find({ _id: categoriesResult.map((cat) => cat.category_id) , userOwner: req.userId}),
    ]);
    const top_selling = products.map(prod => {
      let product = productsResult.find(p => p.product_id.toString() === prod._id.toString());
      return {
        _id: product.product_id,
        name: prod.name,
        image: prod.media.images[0],
        quantity: product.quantity,
        revenue: product.revenue,
      };
    }).sort((a, b) => b.quantity - a.quantity);

    const categories_statics = categories.map(catg => {
      let { category_id, quantity, revenue } = categoriesResult.find(c => c.category_id.toString() === catg._id.toString());
      return {
        _id: category_id,
        name: catg.name,
        quantity,
        revenue,
      };
    }).sort((a, b) => b.quantity - a.quantity);

  return { top_selling, categories_statics };
}

const chartData = async (dateRange) => {
    // orders_statics
    let orders = await Order.find({createdAt: dateRange, userId: req.userId}).select(["shoppingCart", "total_price", 'total_quantity', "createdAt"])
    let x_times = await xTimesHandler(dateRange)
    let orders_statics = x_times.map(time => {
      // start & end date
      let start = new Date(time).setHours(0,0,0,0)
      let end = new Date(time).setHours(24,0,0,0)
      let rangeOrders = orders.filter(order => start <= order.createdAt && end > order.createdAt)
      return {
        time: new Date(time), 
        orders: rangeOrders.length,
        revenue: rangeOrders.reduce((total, order) => total + (order.total_price || 0), 0),
        products: rangeOrders.reduce((total, order) => total + (order.total_quantity || 0), 0),
      }
    })
    // top selling
    let {top_selling, categories_statics} = await filterProductsHandler(orders)


    // let top_selling = 
    return {orders_statics, top_selling, categories_statics}
}

try {
  const [todayRevenue, lastWeekRevenue, lastMonthRevenue, currentYearRevenue, todayOrdersNumber, todayVisitorsNumber, monthChartData] =
    await Promise.all([
      getRevenue(getDateRange("today")),
      getRevenue(getDateRange("lastWeek")),
      getRevenue(getDateRange("lastMonth")),
      getRevenue(getDateRange("currentYear")),
      getOrdersCount(getDateRange("today")),
      getVisitorsCount(getDateRange("today")),
      chartData(getDateRange("lastMonth")),
    ]);

  res.json({
    data: {
      todayRevenue,
      lastWeekRevenue,
      lastMonthRevenue,
      currentYearRevenue,
      todayOrdersNumber,
      todayVisitorsNumber,
      conversionRate: Math.round((todayOrdersNumber / todayVisitorsNumber) * 100) || 0,
      monthChartData,
    },
  });
} catch (err) {
  return rejectError(req, res, err);
}
}
module.exports = orderControllers