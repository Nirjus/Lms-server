import nodemailer from "nodemailer";

import { smtpPassword, smtpUserName } from "../secret/secret";

interface EmailOptions{
    email: string,
    subject: string,
    html: string,
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    
    user: smtpUserName,
    pass: smtpPassword,
  },
});

// async..await is not allowed in global scope, must use a wrapper
export const sendMail = async (emailData:EmailOptions) => {
  // send mail with defined transport object
 try {
    
    const info = await transporter.sendMail({
        from: smtpUserName, // sender address
        to: emailData.email, // list of receivers
        subject: emailData.subject, // Subject line
        html: emailData.html, // html body
      });
    
      console.log("Message sent: %s", info.response);
 } catch (error) {
    console.log("Error occured while sending mail", error);
    throw error;  
 }
  
}


