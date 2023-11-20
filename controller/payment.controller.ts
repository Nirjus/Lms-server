import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandeler";
import { stripePublishKey, stripeScret } from "../secret/secret";
const stripe = require("stripe")(stripeScret);

export const sendStripepublishableKey = async (req:Request, res: Response, next: NextFunction) => {

    try {
        res.status(200).json({
            publishableKey: stripePublishKey
        })
    } catch (error:any) {
       return next(new ErrorHandler(error.massage,500));
    }
}
//    new payment
export const newPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const myPayment = await stripe.paymentIntents.create({
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
        })
    } catch (error:any) {
        return next(new ErrorHandler(error.massage,500));
    }
}