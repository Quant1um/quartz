const schedulers = [
    require("./schedule/generic")
];

module.exports = (context) => {

    for(let scheduler of schedulers) {
        let result = scheduler(context);
        if(result) return result;
    }

    throw new Error("No scheduled track");
};