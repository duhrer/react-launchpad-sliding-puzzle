var createReactClass = require('create-react-class');

var Symbiote = createReactClass({
    getInitialState: function () {
        if (window.fluid) {
            window.fluid.log("Hello, fluid world.");
        }
        else {
            console.log("Couldn't locate fluid.");
        }
        return {};
    },
    render: function () {
        return "Hello, Symbiote";
    }
})

module.exports = Symbiote;
