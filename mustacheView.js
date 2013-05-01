var view = {
    "host": function () {
        // simple_name can either be:
        // "dylan", "nathan", or "local"
        var simple_name = "dylan";

        if (simple_name === 'local') {
            return 'http://localhost:3000';
        } else if (simple_name === 'dylan') {
            return 'http://198.199.85.62:3000';
        } else if (simple_name === 'nathan') {
            return 'http://198.199.82.58:3000';
        } else {
            // we will just assume that it is localhost
            return 'http://localhost:3000';
        }
    }
}

module.exports.view = view;
