"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const checkout_controller_1 = require("../controllers/checkout.controller");
const controller = new checkout_controller_1.CheckoutController();
const checkout_router = (0, express_1.Router)();
checkout_router.post('/:user_id', controller.checkout);
exports.default = checkout_router;
