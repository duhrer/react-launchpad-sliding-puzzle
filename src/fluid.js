const fluid = {};

// Very naive replacement for `fluid.copy`.
fluid.copy = function (original) {
    return JSON.parse(JSON.stringify(original));
}

export default fluid;