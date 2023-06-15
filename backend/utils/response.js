/**
 * Returns response object
 * @param {string} message Response message
 * @param {*} data Data to be returned
 * @param {boolean} success Status of the request
 */

function response(message, data, success) {
    return {
        message: message,
        data: data || null,
        success: success == null ? true : success
    };
}

module.exports = response;
