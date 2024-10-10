const paginationHandler = (data=[], query) => {
    const page = +query?.page || 1
    const step = +query?.step || 5

    if(query?.step === "all") return {
        data: data,
        pagination: {
            length: data.length,
            page: 1,
            step: "all",
            pages: 1,
        }
    }

    let start = +step * (+page - 1)
    let end = start + +step
    const pages = Math.ceil(data.length / step) || 1

    const finalyData =  !isNaN(start + end) ? data.filter((_,i) => i >= start && i < end) : data
    
    return {
        data: finalyData,
        pagination: {
            length: data.length,
            page: step === "all" ? 1 : page,
            step,
            pages,
        }
    }
}
module.exports = paginationHandler