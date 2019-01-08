const merge = require("lodash/merge");
const util = require("util");
const request = util.promisify(require("request"));

module.exports = (userOptions, requestId) => {
    if (!requestId) {
        throw new TypeError(`HTTP Client requires requestId`);
    }
    const options = merge(
        {
            json: true
        },
        userOptions
    );
    options.headers = merge(options.headers, { "X-Request-ID": requestId });
    return request(options);
};
