// express
const express = require("express");
const products = require("../../models/admin/product_schema");
const orders = require("../../models/admin/order_schema");
const ordersModule = express.Router();
const jwt = require("jsonwebtoken");
const rejectError = require("../../utils/rejectError");
const auth = require("../../utils/auth");
// admin/orders/......
    // s * c     s*c+s
// count 0     1      2
// step  5     5      5
// ====  0 5   5 10   10 15
// pagination items : for => start , =< end
// length = 40
// const numberOfItems = length / step = 40 / 5 = 8
ordersModule.get("/", auth , async (req , res) => {
    console.log(req.query,111);
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error , "error authentication 5 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 5 ....");

    let filters = {userId: req.userId}

    if(req.query.status) filters["current_status.name"] = req.query.status
    if(req.query.from || req.query.to) filters.createdAt = {}
    if(req.query.from) filters.createdAt["$gte"] = req.query.from
    if(req.query.to) filters.createdAt["$lte"] = new Date(req.query.to).setHours(24 , 60 , 60 , 60)
    if(req.query.search) filters["shoppingCard.name"] = {"$regex" : new RegExp(`.*${req.query.search}.*`, 'i')}
    
    console.log("filters : " , filters);
    orders.find({...filters}).then((orders) => {
        if (req.query.count && req.query.step && req.query.step !== "all") {
            console.log(req.query);
            let start = +req.query.step * (+req.query.count - 1)
            let end = (+req.query.step * (+req.query.count - 1)) + +req.query.step

            const numberOfItems = Math.ceil(orders.length / req.query.step)

            res.json({
                success: true,
                pagination: {
                    step: req.query.step,
                    numberOfItems,
                    currentPagination: req.query.count
                },
                filterValues: {
                    status: req.query.status || null,
                    from: req.query.from || null,
                    to: req.query.to || null,
                    search: req.query.search || null,
                },
                sub_data: {
                    numberTotal: orders.length
                },
                data: orders.filter((o,i) => i >= start && i < end)
            })
            console.log(start , end , 222222222)
    }else{
        console.log(orders , 3333333333)

        res.json({success: true, 
            sub_data: {
                numberTotal: orders.length
            },
             data: orders,
              pagination: {
                    step: "all",
                    numberOfItems: 1,
                    currentPagination: 1
                },
                filterValues: {
                    status: req.query.status || null,
                    from: req.query.from || null,
                    to: req.query.to || null,
                    search: req.query.search || null,
                },
            })
    }
    }).catch(err => console.log(err))
    // orders.find({userId: _id}).then((orders) => {
    //     if (req.query.count && req.query.step) {
    //             let start = +req.query.step * (+req.query.count - 1)
    //             let end = (+req.query.step * (+req.query.count - 1)) + +req.query.step
    
    //             const numberOfItems = Math.ceil(orders.length / req.query.step)
    
    //             res.json({success: true,  pagination: {
    //                 step: req.query.step,
    //                 numberOfItems,
    //                 currentPagination: req.query.count
    //             } , data: orders.filter((o,i) => i >= start && i < end)})
    //     }else{
    //         res.json({success: true , data: orders , pagination: {
    //                     step: "all",
    //                     numberOfItems: 1,
    //                     currentPagination: 1
    //                 }})
    //     }
    // }).catch(err => console.log(err))
})
ordersModule.get("/orders-tracking-status", auth , async (req , res) => {
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error , "error authentication 5 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 5 ....");
    orders.find({userId: req.userId}).then((orders) => {
        let allStatus = ["all","today","pending","confirmed","shipped","delivered","cancelled","on_hold","delayed","returned"]
        let resultObject = {}
        allStatus.forEach(status => {
            if(status === "all") resultObject[status] = orders.length
            if(status === "today") resultObject[status] = orders.filter(o => o.createdAt >= new Date().setHours(0,0,0,0)).length
            if(status !== "all" && status !== "today") resultObject[status] = orders.filter(o => o.current_status.name === status).length
        })
        res.json({success: true , data: resultObject})
    }).catch(err => console.log(err))
})
ordersModule.get("/dashboard-order-data1" , auth , async (req , res) => {
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error , "error authentication 6 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 6 ....");
    orders.find({userId: req.userId}).then(async (orders) => {
        // Get the current date
        let currentDate = new Date();

        // Calculate the date for seven days ago
        let lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        let lastWeek_orders = orders.filter(order => order.addedIn >= lastWeekDate)
        let lastWeekRevenue = [0,...lastWeek_orders.map(o => o.order_total_price)].reduce((a,b) => a + b)

        // Get the month and year of the current date
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        // Calculate the last month's year and month
        let lastMonthYear = currentYear;
        let lastMonth = currentMonth - 1;

        // Adjust the year if the last month is December of the previous year
        if (lastMonth === -1) {
        lastMonth = 11; // December (JavaScript months are 0-indexed)
        lastMonthYear--;
        }

        // Create a new date for the last month
        let lastMonthDate = new Date(lastMonthYear, lastMonth);
        let lastMonth_orders = orders.filter(order => order.addedIn >= lastMonthDate)
        let lastMonthRevenue = [0,...lastMonth_orders.map(o => o.order_total_price)].reduce((a,b) => a + b)

        // Get the current year
        let currentYear_orders = orders.filter(order => order.addedIn >= currentYear)
        let currentYearRevenue = [0,...currentYear_orders.map(o => o.order_total_price)].reduce((a,b) => a + b)
        // res.json({lastWeekRevenue})
        // chat gpt ^^^^^^^^^^^^^^^^

        let today = await new Date().setHours(0,0,0,0)
        let todayOrders = await orders.filter(order => order.addedIn >= today)
        let todayRevenue = await [0,...todayOrders.map(o => o.order_total_price)].reduce((a,b) => a + b)
        let todayOrdersNumber = await todayOrders.length
        
        
        let month = await new Date(new Date(new Date().setDate(1)).setHours(0,0,0,0))
        let monthOrders = await orders.filter(order => order.addedIn >= month)
        let monthRevenue = await [0,...todayOrders.map(o => o.order_total_price)].reduce((a,b) => a + b)
        
        let monthChartData = await monthOrders.map(o => {return {date: o.addedIn , count: o.shoppingCard.map(o => o.variants.map(v => {return {q:v.quantiteUser , p:v.salePrice , c:o.categorie }}))}})
        // let monthChartData_Sales = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => o.q).reduce((a,b) => a + b)).reduce((a,b) => a + b)}})
        let monthChartData_Sales = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => o.q).reduce((a,b) => a + b)).reduce((a,b) => a + b)}})
        let monthChartData_Revenue = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => o.q * o.p).reduce((a,b) => a + b)).reduce((a,b) => a + b)}})
        let monthChartData_Categorie = await monthChartData.map(o => {return {date: {day: new Date(o.date).getDate() , month: new Date(o.date).getMonth()+1}, count: o.count.map(o => o.map(o => {
            let count = []
            for (let i = 0; i < o.q; i++) {
                count.push(o.c)                
            }
            return count
        }).reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])).reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])}})
        let monthTopProductsSaling = await monthOrders.map(o => {
            return o.shoppingCard.map(s => {
                return {
                    _id: s._id,
                    image: s.main_image,
                    // image: s.media.images[0], for delete
                    name: s.name,
                    categorie: s.categorie,
                    numberOfSales: s.variants.map(v => v.quantiteUser).reduce((a,b) => a + b)
                }
            }).reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])
        })
        .reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])])
        let totalRevenue = await orders.map(o => o.shoppingCard.map(o => o.variants.map(v => v.quantiteUser * v.salePrice).reduce((a,b) => a + b)).reduce((a,b) => a + b)).reduce((a,b) => a + b)
        
        let final_dataChart_Sales = []
        let final_dataChart_Revenue = []
        let final_dataChart_Categorie = []
        let monthChartData_maxDay = await monthChartData_Sales.reduce((a,b) => a.date.day > b.date.day ? a : b).date.day

        for (let i = 1; i <= monthChartData_maxDay; i++) {
            final_dataChart_Sales.push({
                day: i,
                count: [0,...monthChartData_Sales.map(o => o.date.day === i && o.count).filter(o => o !== false)].reduce((a, b) => a+b)
            })
            final_dataChart_Revenue.push({
                day: i,
                count: [0,...monthChartData_Revenue.map(o => o.date.day === i && o.count).filter(o => o !== false)].reduce((a, b) => a+b)
            })
            final_dataChart_Categorie.push({
                day: i,
                count: ([[],...monthChartData_Categorie.map(o => o.date.day === i && o.count).filter(o => o !== false)].reduce((a,b) => [...(Array.isArray(a) ? a : [a]) , ...(Array.isArray(b) ? b : [b])]))
            })
        }
        // .map(o => o.date.day === 13 ? o.count : false)
        // res.json({m : final_dataChart})
        // console.log(at)
    
        
        let categorie_count = {}
         final_dataChart_Categorie.forEach(item => {
            // categorie_count = {}
            item.count.forEach(a => {
                if (Object.keys(categorie_count).indexOf(a) === -1) {
                    categorie_count[a] = 1
                } else {
                    categorie_count[a] += 1
                }
                
            })
            
        })

        let topProductsSaling_count = []

        console.log(monthTopProductsSaling)
        monthTopProductsSaling.forEach(item => {
            let checkIfExist = topProductsSaling_count.filter(p => p._id+"" === item._id+"")
            if (checkIfExist.length === 0) {
                // topProductsSaling_count.push(checkIfExist)
                topProductsSaling_count.push(item)
            } else {
                let result = topProductsSaling_count.map((p,i) => {
                    if (p._id+"" === item._id+"") {
                        return {
                            ...p,
                            numberOfSales: p.numberOfSales + item.numberOfSales
                        }
                    }
                    return p
                })
                topProductsSaling_count = result
            }
            
        })

        // Sorting numbers in descending order
        topProductsSaling_count.sort(function(a, b) {
        return b.numberOfSales - a.numberOfSales;
        });


    //    res.json({            monthChartData_Sales:{
    //     month,
    //     data: final_dataChart_Sales
    // },})
    //    return 
        await res.json({success: true , data: {    
            lastWeekRevenue,
            lastMonthRevenue,
            currentYearRevenue,
            todayRevenue,
            monthRevenue,
            totalRevenue,
            todayOrdersNumber,
            todayVisitors: "//5",
            convetionRate: "//6",
            monthChartData_Sales:{
                month,
                data: final_dataChart_Sales
            },
            monthChartData_Revenue:{
                month,
                data: final_dataChart_Revenue
            },
            monthChartData_Categorie:{
                month,
                // data: final_dataChart_Categorie,
                data: categorie_count
            },
            monthChartData_TopProductsSaling:{
                month,
                data: topProductsSaling_count
            },
            
        }})

    }).catch(err => console.log(err))
})
ordersModule.get("/dashboard-order-data", auth , async (req, res) => {
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error , "error authentication 7 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 7 ....");
    orders.find({userId: req.userId}).then((orders) => {
        function filterOrdersByPeriods(startPeriod, endPeriod) {
            if (startPeriod && endPeriod) {
                return orders.filter(order => order.addedIn >= startPeriod && order.addedIn <= endPeriod)
            }else{
                if (startPeriod) {
                    return orders.filter(order => order.addedIn >= startPeriod)
                }
                if (endPeriod) {
                    return orders.filter(order => order.addedIn <= endPeriod)
                }
            }
        }
        function period_revenue(startPeriod, endPeriod) {
            let lastPeriodRevenue = [0,...filterOrdersByPeriods(startPeriod, endPeriod).map(o => o.order_total_price)].reduce((a,b) => a + b)
            return lastPeriodRevenue
        }
        function period_ordersNumber(startPeriod, endPeriod) {
            return filterOrdersByPeriods(startPeriod, endPeriod).length
        }
        function chartData(startPeriod, endPeriod) {
            let orders =  filterOrdersByPeriods(startPeriod, endPeriod)
            // Example dates (replace these with your actual startDate and endDate)
            const startDate = startPeriod// new Date('2023-01-01');
            const endDate = endPeriod || new Date();

            // Calculate the difference in milliseconds between the two dates
            const differenceInMilliseconds = endDate - startDate;

            // Convert milliseconds to days
            const millisecondsInADay = 1000 * 60 * 60 * 24; // 1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
            const differenceInDays = Math.floor(differenceInMilliseconds / millisecondsInADay);
            let allDay = []
            for (let i = 0; i <= differenceInDays; i++) {
                const nextDay = new Date(startDate).setDate(startDate.getDate() + i);
                // let time = new Date(nextDay).getFullYear() + '-' + (new Date(nextDay).getMonth()+1) + '-' + new Date(nextDay).getDate() 
                let time = nextDay
                allDay.push(time);
            }
            // Add one day to the current date
            let global_data = {
                global_revenu: 0,
                global_number_of_Orders: 0,
                global_number_of_products: 0,
                global_top_selling_products: [],
                global_categorie: {}
            }
            let data_for_each_items = allDay.map(day => {
                // start & end date
                let start = new Date(day).setHours(0,0,0,0)
                let end = new Date(day).setHours(24,0,0,0)

                // filter orders by date selected
                let ordersSelected = orders.filter(order => start <= order.addedIn && end > order.addedIn)
                
                // handle categories data
                let object_categorie = {}
                ordersSelected.forEach(order => {
                    order.shoppingCard.forEach(prod => {
                        object_categorie[prod.categorie._id] ? 
                        object_categorie[prod.categorie._id] = {
                            name: prod.categorie.name,
                            total_quantite: object_categorie[prod.categorie._id].total_quantite + prod.product_total_quantite
                            } : 
                        object_categorie[prod.categorie._id] = {
                            name: prod.categorie.name,
                            total_quantite:prod.product_total_quantite
                        }    
                        // global
                        global_data.global_categorie[prod.categorie._id] ? 
                            global_data.global_categorie[prod.categorie._id] = {
                                name: prod.categorie.name,
                                total_quantite: global_data.global_categorie[prod.categorie._id].total_quantite + prod.product_total_quantite
                             } : 
                            global_data.global_categorie[prod.categorie._id] = {
                                name: prod.categorie.name,
                                total_quantite:prod.product_total_quantite
                            }
                    })
                })

                // handle top produdcts selling
                let top_products_selling = []
                ordersSelected.forEach(order => {
                    order.shoppingCard.forEach(prod => {
                        // unique
                        let prodExist = top_products_selling.filter(p => p._id.toString() === prod._id.toString())
                        if(prodExist.length > 0) {
                            top_products_selling = top_products_selling.map(p => {
                                if (p._id.toString() === prod._id.toString()) {
                                    // console.log(prod.product_total_quantite,5555);
                                    return {
                                        ...p,
                                        number_of_sales: p.number_of_sales + prod.product_total_quantite
                                    }
                                }
                                return p
                            }).sort(function(a, b) {
                                return b.number_of_sales - a.number_of_sales;
                                });
                        }
                        else{
                            top_products_selling.push({
                                _id: prod._id,
                                name: prod.name,
                                main_image: prod.main_image,
                                number_of_sales: prod.product_total_quantite
                            });
                            top_products_selling = top_products_selling.sort(function(a, b) {
                                return b.number_of_sales - a.number_of_sales;
                                });
                        }
                        // unique
                        // top_products_selling[prod._id] ?
                        // top_products_selling[prod._id] = {
                        //     ...top_products_selling[prod._id],
                        //     number_of_sales: top_products_selling[prod._id].number_of_sales + prod.product_total_quantite
                        // } : 
                        // top_products_selling[prod._id] = {
                        //     name: prod.name,
                        //     main_image: prod.main_image,
                        //     number_of_sales: prod.product_total_quantite
                        // }
                        // global
                        let prodExistGlobal = global_data.global_top_selling_products.filter(p => p._id.toString() === prod._id.toString())
                        if(prodExistGlobal.length > 0) {
                            global_data.global_top_selling_products = global_data.global_top_selling_products.map(p => {
                                if (p._id.toString() === prod._id.toString()) {
                                    // console.log(prod.product_total_quantite,5555);
                                    return {
                                        ...p,
                                        number_of_sales: p.number_of_sales + prod.product_total_quantite
                                    }
                                }
                                return p
                            }).sort(function(a, b) {
                                return b.number_of_sales - a.number_of_sales;
                                });
                        }
                        else{
                            global_data.global_top_selling_products.push({
                                _id: prod._id,
                                name: prod.name,
                                main_image: prod.main_image,
                                number_of_sales: prod.product_total_quantite
                            })
                            global_data.global_top_selling_products = global_data.global_top_selling_products.sort(function(a, b) {
                                return b.number_of_sales - a.number_of_sales;
                                });
                        }
                        // global
                        // global_data.global_top_selling_products[prod._id] ? 
                        // global_data.global_top_selling_products[prod._id] = {
                        //     ...global_data.global_top_selling_products[prod._id],
                        //     number_of_sales: global_data.global_top_selling_products[prod._id].number_of_sales + prod.product_total_quantite
                        // } : 
                        // global_data.global_top_selling_products[prod._id] = {
                        //     name: prod.name,
                        //     main_image: prod.main_image,
                        //     number_of_sales: prod.product_total_quantite
                        // }
                    })
                })
                
                // number of orders
                    // global
                global_data.global_number_of_Orders += ordersSelected.length
                    // unique
                let number_of_orders = ordersSelected.length

                // number of products
                let number_of_products = [0, ...ordersSelected].map(order => {
                    // global
                    global_data.global_number_of_products += order?.order_total_quantite || 0
                    // unique
                    return order?.order_total_quantite || 0
                }).reduce((a , b) => a + b)

                // total revenue
                let total_revenue = [0, ...ordersSelected].map(order => {
                    // global
                    global_data.global_revenu += order?.order_total_price || 0
                    // unique
                    return order?.order_total_price || 0
                }).reduce((a , b) => a + b)

                    return {
                        date: day,
                        number_of_orders,
                        number_of_products,
                        categorie: object_categorie,
                        total_revenue,
                        top_products_selling,
                    }
            })

            return {
                global_data,
                data_for_each_items,
            }
            // return {differenceInDays,allData}
        }
        // n9der nakhdam biha ji haja khra
        function handleLastMonthDate() {
            // Calculate the last month's year and month
            let lastMonthYear = currentYear;
            let lastMonth = currentMonth - 1;
            
            // Adjust the year if the last month is December of the previous year
            if (lastMonth === -1) {
                lastMonth = 11; // December (JavaScript months are 0-indexed)
                lastMonthYear--;
            }
            return new Date(lastMonthYear, lastMonth);
        }
        // Many Periods
        let currentDate = new Date(new Date().setHours(0,0,0,0));
        let currentMonth = new Date(new Date(currentDate.getMonth()).setHours(0,0,0,0));
        let currentYear = new Date(new Date(currentDate.getFullYear()).setHours(0,0,0,0));

        let todayDate = new Date().setHours(0,0,0,0)

        // let lastWeekDate = new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000); // -1
        let lastWeekDate = new Date(new Date(currentDate).setDate(currentDate.getDate() - 7)) // wach khasni ndir 7 days exactly or from monday to monday
        let lastMonthDate = new Date(new Date(currentDate).setDate(currentDate.getDate() - 30)) // -1 // handleLastMonthDate()
        // res.json({monthChartData: chartData(lastMonthDate)})
        // return 
        res.json({
            success: true, 
            data: {
                todayRevenue: period_revenue(todayDate),
                lastWeekRevenue: period_revenue(lastWeekDate),
                lastMonthRevenue: period_revenue(lastMonthDate),
                currentYearRevenue: period_revenue(currentYear),
                todayOrdersNumber: period_ordersNumber(todayDate),
                todayVisitors: "//5",
                convetionRate: "//6",
                monthChartData: chartData(lastMonthDate),
            }
    })
        // return
        
        // res.json({success: true , data: {    
        //     // lastWeekRevenue,
        //     // lastMonthRevenue,
        //     // currentYearRevenue,
        //     // todayRevenue,
        //     // monthRevenue,
        //     // totalRevenue,
        //     // todayOrdersNumber,
        //     todayVisitors: "//5",
        //     convetionRate: "//6",
        //     monthChartData_Sales:{
        //         month,
        //         data: final_dataChart_Sales
        //     },
        //     monthChartData_Revenue:{
        //         month,
        //         data: final_dataChart_Revenue
        //     },
        //     monthChartData_Categorie:{
        //         month,
        //         // data: final_dataChart_Categorie,
        //         data: categorie_count
        //     },
        //     monthChartData_TopProductsSaling:{
        //         month,
        //         data: topProductsSaling_count
        //     },
            
        // }})
    }).catch(err => console.log(err))
})
ordersModule.get("/filter", auth , async (req , res) => {
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error , "error authentication 8 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 8 ....");
    console.log(req.query);
    let filters = {userId: req.userId}

    if(req.query.status) filters["current_status.name"] = req.query.status
    if(req.query.from || req.query.to) filters.createdAt = {}
    if(req.query.from) filters.createdAt["$gte"] = req.query.from
    if(req.query.to) filters.createdAt["$lte"] = new Date(req.query.to).setHours(24 , 60 , 60 , 60)
    
    console.log("filters : " , filters);
    orders.find({...filters}).then((orders) => {
        res.json({success: true ,
            //  subData: orders,
              data: orders})
    }).catch(err => console.log(err))
    // let startTime = new Date().setHours(0,0,0,0)
    // // let filterObject = {userId: _id}
    // // // || {$in:  ["pending" , "confirmed" , "shipped" , "delivered" , "cancelled" , "on_hold" , "delayed" , "returned"]}
    // // if(req.query.status && req.query.status !== "false") {
    // //     filterObject["current_status.name"] = req.query.status
    // // }
    // // if(req.query.time === "today"){
    // //     filterObject.addedIn = {
    // //             $gte: startTime // || 0
    // //     }
    // // }
    // // orders.find(filterObject).then((order_filters) => {
    // //     res.json({success: true , subData: orders, data: order_filters})
    // // }).catch(err => console.log(err))
    // orders.find({userId: _id}).then((orders) => {

    //     if(req.query.status && req.query.status !== "false"){
    //         // status[order.status.length - 1]
    //         res.json({success: true , subData: orders, data: orders.filter(order => order.current_status.name === req.query.status)})
    //         return
    //     }

    //     if(req.query.time === "today"){
    //         let startTime = new Date().setHours(0,0,0,0)
    //         console.log(startTime , 1202);
    //         res.json({success: true , subData: orders, data: orders.filter(order => order.addedIn >= startTime)})
    //         return
    //     }
    //     res.json({success: true , subData: orders, data: orders})
    // }).catch(err => console.log(err))
})
ordersModule.get("/:id", auth , async (req , res) => {
    console.log(req.cookies._auth);
    console.log(req.params , 888)
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     console.log(error , "error authentication 9 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 9 ....");
    orders.findById(req.params.id).then((order) => {
        // console.log(order);
        if(!order){
            return res.json({success: false , error: "Error 404: Not Found"})
        }
        // if(order.userId !== _id){
        //     return res.json({success: false , error: "Error 504: Authorisation falied"})
        // }
        res.json({success: true , data: order , pagination: {
            step: "all",
            numberOfItems: 1,
            currentPagination: 1
        }})
    }).catch(err => res.json({success: false , error: "Error 404: Not Found"}))
})
ordersModule.get("/orders-tracking/details/:id", auth , async (req , res) => {
    // console.log(7777);
    // try {
    //     await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // } catch (error) {
    //     // console.log(error , "error authentication 9 ....");
    //     return res.json({success: false , error: "Authorization is not valid"})
    // }
    // const {_id} = await jwt.verify(req.cookies?._auth,process.env.JWT_SECRET)
    // console.log(_id , "success authentication 9 ....");

    let filters = {userId: req.userId}
    console.log(req.query,req.params, "body");
    // console.log(req.params.status , req.body.id);
    // return 
    let allStatus = ["pending","confirmed","shipped","delivered","cancelled","on_hold","delayed","returned"]
    if(allStatus.indexOf(req.query.status) !== -1) filters["current_status.name"] = req.query.status
    if(req.query.time === "today") filters.createdAt = {"$gte": new Date().setHours(0,0,0,0)}

    orders.find(filters).then((orders) => {
        console.log(orders.length , "orders found");
        // if(!orders){
        //     return res.json({success: false , error: "Error 404: Not Found"})
        // }
        // if(order.userId !== _id){
        //     return res.json({success: false , error: "Error 504: Authorisation falied"})
        // }
        let orderExist = orders.map((o , i) => o._id.toString() === req.params.id ? i : null).filter(a => a !== null)
        // console.log(orderExist  ,"exist");
        if(orderExist.length){
            let itemIndex = orderExist[0]
            res.json({success: true , data: {
                    previousItem: itemIndex === 0 ? null : orders[itemIndex - 1]._id,
                    currentItem: orders[itemIndex],
                    nextItem: itemIndex === (orders.length - 1) ? null : orders[itemIndex + 1]._id,
                    currentIndex: itemIndex+1,
                    numberOfItems: orders.length
                }
            })
            return
        }
        console.log("not Exist");
        res.json({success: true , data: {
            previousItem: null,
            currentItem: orders[0],
            nextItem: orders[1]?._id ? orders[1]._id : null,
            currentIndex: 1,
            numberOfItems: orders.length
        }})
    }).catch(err => rejectError(req , res , err , "Error: 404 Not Found"))
})
ordersModule.post("/new-order" ,async (req , res) => {
    products.find({"_id": req.body.shoppingProducts.map(p => p.productId)}).then(async (productsSelect) => {
        let finalyProducts = productsSelect.map( prod => {
            let userProduct = req.body.shoppingProducts.find(up => up.productId === prod._id.toString())
            let variantsSelect = []
            console.log(123456,userProduct,654321);
            if(userProduct.productId !== userProduct.variants[0].variantId){
                prod.variants.forEach(v => {
                    userProduct.variants.forEach(userV => {
                        if(v.variantId === userV.variantId){
                            variantsSelect.push({
                                ...v,
                                quantiteUser: userV.quantiteUser, // for delete
                                totalPrice: userV.quantiteUser * v.salePrice, // for delete
                                variant_total_quantite: userV.quantiteUser,
                                variant_total_price: userV.quantiteUser * v.salePrice,
                            })
                        }
                })
            })
            }else{
                console.log(prod,36);
                variantsSelect.push({
                    ...userProduct.variants[0],
                    salePrice: prod.prices.salePrice, // for delete && quantiteUser inside userProduct
                    variant_total_quantite: userProduct.variants[0].quantiteUser,
                    variant_total_price: userProduct.variants[0].quantiteUser * prod.prices.salePrice,
                    // unique_price: prod.prices.salePrice
                })
            }
            console.log(variantsSelect,123);
            // prod.variants = variantsSelect
            // return prod
            let {_id, name, categorie, addedIn, variants, userId , media} = prod
            return {
                _id,
                name,
                categorie,
                addedIn,
                variants: variantsSelect,
                userId,
                main_image: media.images[0],
                product_total_quantite: variantsSelect.map(v => {
                    return v.variant_total_quantite
                    // return v.quantiteUser
                }).reduce((a , b) => a + b),
                product_total_price: variantsSelect.map(v => {
                    return v.variant_total_price
                    // return v.totalPrice
                }).reduce((a , b) => a + b) 
            }
            // return {
            //     ...prod,
            //     variantsSelect: "ddd"
            // }
            
        })
        console.log("-------------------------",finalyProducts,"!!!!!!!!!!!!!!!!!!!!!");

        // let finalyProducts_1 = finalyProducts.map(({_id, name, categorie, addedIn, variants, userId}) => {
        //     return {
        //         _id,
        //         name,
        //         categorie,
        //         addedIn,
        //         variants,
        //         userId,
        //         total_quantite: variants.map(v => {
        //             return v.quantiteUser
        //         }).reduce((a , b) => a + b),
        //         total_price: variants.map(v => {
        //             return v.totalPrice
        //         }).reduce((a , b) => a + b) 
        //     }
        // })
        // console.log("ssstttttttttttttaaaaaaaaaaaaaaaaaaarrrrrrrrr",
        //                     finalyProducts_1[0],
        //             "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
       
        let myUsers = []
        finalyProducts.forEach(prod => {
            let userExist = myUsers.find(user => user.userId === prod.userId)
            if (userExist) {
                myUsers = myUsers.map((user) => {
                    if (user.userId === prod.userId) {
                        return {
                            ...user,
                            products : [...user.products , prod]
                        }
                    } return user
                })
            } else {
                myUsers.push({
                    userId: prod.userId,
                    products : [prod]
                })
            }
        });
        console.log(myUsers[0].products);
        myUsers.forEach((user,index) => {
            // console.log("staaaaaaaaaaaaaaaaaaaaar", {
            //     shoppingCard: user.products,
            //     order_total_price: user.products.map(p => p.total_price).reduce((a, b) => a + b),
            //     order_total_quantite: user.products.map(p => p.total_quantite).reduce((a, b) => a + b),
            //     userId: user.userId,
            //     ...req.body.userInformation,
            //     addedIn: Date.now(),
            //     status: [{
            //         name: "pending",
            //         addedIn: Date.now()
            //     }],
            //     current_status: {
            //         name: "pending",
            //         addedIn: Date.now()
            //     }
            // } , "ennnnnnnnnnnnnnnnnnd");
            // res.json({success: false, error: "makayn waloo ", data: myUsers})
            // return
            new orders({
                shoppingCard: user.products,
                order_total_price: user.products.map(p => p.product_total_price).reduce((a, b) => a + b),
                order_total_quantite: user.products.map(p => p.product_total_quantite).reduce((a, b) => a + b),
                userId: user.userId,
                ...req.body.userInformation,
                addedIn: Date.now(),
                status: [{
                    name: "pending",
                    addedIn: Date.now()
                }],
                current_status: {
                    name: "pending",
                    addedIn: Date.now()
                }
            }).save().then((docs) => {
                console.log(docs,9999);
                if (myUsers.length - 1 === index) {
                    res.json({success: true, data: myUsers})
                }
            })
        })
    }).catch((err) => console.log(err))
    // Handle users
    // let myUsers = []
    // await req.body.product.forEach(prod => {
    //     let userExist = myUsers.find(user => user.userId === prod.userId)
    //     if (userExist) {
    //         myUsers = myUsers.map((user) => {
    //             if (user.userId === prod.userId) {
    //                 return {
    //                     ...user,
    //                     products : [...user.products , prod]
    //                 }
    //             } return user
    //         })
    //     } else {
    //         myUsers.push({
    //             userId: prod.userId,
    //             products : [prod]
    //         })
    //     }
    // });
    // console.log(myUsers,88888);



    // myUsers.forEach(async user => {
    //     // console.log(user,1111);
    //     async function aaa(a){
    //        let lastProducts = []
    //     await user.products.forEach(async userP =>  {
    //         // console.log(userP,2222);
    //         await products.find({"_id": user.products.map(p => p.productId)}).then(async prds => {
    //             // console.log(prds,3333);
    //             await prds.forEach(prod => {
    //                 console.log(prod._id.toString() === userP.productId,4444);
    //                 if(prod._id.toString() === userP.productId){
    //                   let lastVariants = userP.variants.map(v => v.variantId)
    //                   console.log(lastVariants,5555);
    //                   let prod1 = prod
    //                   let lastProd = {
    //                       ...prod1,
    //                       variants: prod1.variants.map(v => {
    //                         if(lastVariants.indexOf(v.variantId) !== -1) {
    //                           return {...v, quantiteUser:  userP.variants[lastVariants.indexOf(v.variantId)].quantiteUser}
    //                         //   return v
    //                           }
    //                           return  false
    //                         }).filter(e => e !== false)
    //                   }
    //                   console.log(lastProd,6666);
    //                   a.push(lastProd)
    //                 // lastProducts = [...lastProducts , lastProd]
    //                 }
    //               })
    //         }).catch(err => console.log(err))
    //         return a
    //     })
    //    }
    //    let b = aaa()
    //     await console.log(b,7777);
    //     await res.json({success: true, data: await aaa()})
    //     console.log("-------------------")

    //   })
    // myUsers.forEach(async (user) => {
    //     let AllProducts = []
    //     products.find({"_id": user.products.map(p => p.productId)}).then(prds => {
    //         //  let result = prds.map(prod => {
    //         //      return user.products.map(userProd => {
    //         //          if(prod._id === userProd.productId){
    //         //             console.log("******************",prod._id, userProd.productId,"*******************")
    //         //             let userVariants = userProd.variants.map(v => variantId)
    //         //              return {
    //         //                 ...prod,
    //         //                 variants: prod.variants.map(v => {
    //         //                     if (userVariants.indexOf(v.variantId) === -1) {
    //         //                         return false
    //         //                     }
    //         //                     return v
    //         //                 }).filter(v => v !== false)
    //         //             }
    //         //         }
    //         //         return false

    //         //     }).filter(p => p !== false)
            
    //         })
            
    //         res.json({success: true, data: myUsers})
    //         // let products = prds.map(prod => {
    //             // return {
    //                 // ...prod,
    //                 // variants: prod.variants.map(v => {
    //                 //     if (userVariants.indexOf(v.variantId) === -1) {
    //                 //         return false
    //                 //     }
    //                 //     return v
    //                 // }).filter(v => v !== false)
    //             // }
    //         // })
    //     }).catch(err => console.log(err,3.355))

        // let allProduct = []
        // await user.products.forEach(async prod => {
            //     await products.findById(prod.productId)
            // .then(async (p) => {
                //     allProduct = [...allProduct , p]
                // }).catch(err => res.json({success: false , error: "Failed To Place Order", err}))
                // })
                // console.log("################### start :" , allProduct, "################ end1");
            // })
            // res.json({success: true, data: myUsers})
            // products.findById(req.body.product.productId).then(product => {
        // if(!product) return res.json({success: false , error: "Failed To Place Order"})
        // console.log(product);
    // }).catch(err => res.json({success: false , error: "Failed To Place Order"}))
})
ordersModule.put("/change-order-status", auth , (req , res) => {
    console.log(req.body);
    orders.findById(req.body.orderId).then((order) => {
        order.status = [ ...order.status ,{
            name: req.body.status,
            addedIn: Date.now()
        }]
        order.current_status = {
            name: req.body.status,
            addedIn: Date.now()
        }
        // order.status = [{name: "pending" , addedIn: Date.now()}]
        // order.status = []
        order.save().then((docs) => {
            res.json({success: true , data: docs})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})
ordersModule.put("/delete-order-status", auth , (req , res) => {
    console.log(req.body);
    orders.findById(req.body.orderId).then((order) => {
        order.status = order.status.filter((s,index) => index !== req.body.statusIndex)
        order.current_status = order.status[order.status.length - 1]
        // order.status = [{name: "pending" , addedIn: Date.now()}]
        // order.status = []
        order.save().then((docs) => {
            res.json({success: true , data: docs})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})

ordersModule.put("/new-personal-note", auth , (req , res) => {
    console.log(req.body,5);
    orders.findById(req.body.orderId).then((order) => {
        order.personal_Notes = [...order.personal_Notes , req.body.personalNotes]
        // order.status = [{name: "pending" , addedIn: Date.now()}]
        // order.status = []
        order.save().then((docs) => {
            res.json({success: true , data: docs})
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))
})
ordersModule.delete("/delete-order/:id" , auth , (req , res) => {
    console.log(req.params.id);
    orders.deleteOne({_id: req.params.id}).then((docs) => {
            res.json({success: true , data: docs})
    }).catch(err => console.log(err))
})
ordersModule.put("/update-many-status" , auth , (req , res) => {
    orders.updateMany({"_id": req.body.items} , {
         $push: { status: {
            name: req.body.status,
            addedIn: Date.now()
          } } 
          ,
          current_status: {
            name: req.body.status,
            addedIn: Date.now()
          }
    }).then((prdcs) => {
      res.json({success: true , data: req.body})
    }).catch(err => console.log(err))
  })
ordersModule.put("/delete-many-status" , auth , (req , res) => {
    orders.deleteMany({"_id": req.body.items}).then((prdcs) => {
        res.json({success: true , data: req.body})
    }).catch(err => console.log(err))
})
module.exports = ordersModule;
