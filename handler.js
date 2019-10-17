const handler = require("serverless-express/handler");
const app = require("./index");
const update = require("./update");
exports.api = handler(app);
exports.update = update;
