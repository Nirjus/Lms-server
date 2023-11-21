"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newPayment = exports.sendStripepublishableKey = void 0;
const errorHandeler_1 = __importDefault(require("../utils/errorHandeler"));
const secret_1 = require("../secret/secret");
const stripe = require("stripe")(secret_1.stripeScret);
const sendStripepublishableKey = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({
            publishableKey: secret_1.stripePublishKey
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.massage, 500));
    }
});
exports.sendStripepublishableKey = sendStripepublishableKey;
//    new payment
const newPayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const myPayment = yield stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "USD",
            description: 'Software development services',
            shipping: {
                name: 'Jenny Rosen',
                address: {
                    line1: '510 Townsend St',
                    postal_code: '98140',
                    city: 'San Francisco',
                    state: 'CA',
                    country: 'US',
                },
            },
            metadata: {
                company: "ALASKA",
            },
            automatic_payment_methods: {
                enabled: true,
            }
        });
        res.status(201).json({
            success: true,
            client_secret: myPayment.client_secret
        });
    }
    catch (error) {
        return next(new errorHandeler_1.default(error.massage, 500));
    }
});
exports.newPayment = newPayment;
