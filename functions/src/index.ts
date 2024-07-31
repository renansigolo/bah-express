import {
  SESClient,
  SendEmailCommand,
  SendEmailRequest,
} from "@aws-sdk/client-ses";
import { log } from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

type CateringEnquiryBody = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  dob: string;
  event_date: string;
  event_type: string;
  time: string;
  location: string;
  menu_option:
    | "Bah Express"
    | "Bah Gaucho"
    | "Bah Prime"
    | "Bah Ribs Experience"
    | "Bah Veggie";
  number_of_guests: number;
  message: string;
};

const sesClient = new SESClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY),
  },
});

export const sendCateringEnquiry = onRequest(
  { cors: true },
  async (req, res) => {
    req.body as CateringEnquiryBody;

    const emailText = `
    Catering Enquiry
    Personal Details
    First Name: ${req.body.first_name}
    Last Name: ${req.body.last_name}
    Email: ${req.body.email}
    Phone: ${req.body.phone_number}
    Date of Birth: ${req.body.dob}
    Event Details
    Menu Options: ${req.body.menu_option}
    Event Date: ${req.body.event_date}
    Event Type: ${req.body.event_type}
    Event Time: ${req.body.time}
    Event Location: ${req.body.location}
    Number of Guests: ${req.body.number_of_guests}
    Message: ${req.body.message}
    `;

    const emailHtml = `
    <h1>Catering Enquiry</h1>
    <h2>Personal Details</h2>
    <p><b>First Name:</b> ${req.body.first_name}</p>
    <p><b>Last Name:</b> ${req.body.last_name}</p>
    <p><b>Email:</b> ${req.body.email}</p>
    <p><b>Phone:</b> ${req.body.phone_number}</p>
    <p><b>Date of Birth:</b> ${req.body.dob}</p>
    <h2>Event Details</h2>
    <p><b>Menu Option:</b> ${req.body.menu_option}</p>
    <p><b>Event Date:</b> ${req.body.event_date}</p>
    <p><b>Event Type:</b> ${req.body.event_type}</p>
    <p><b>Event Time:</b> ${req.body.time}</p>
    <p><b>Event Location:</b> ${req.body.location}</p>
    <p><b>Number of Guests:</b> ${req.body.number_of_guests}</p>
    <p><b>Message:</b> ${req.body.message}</p>
    `;

    const emailParams: SendEmailRequest = {
      Source: "no-reply@bahexpressbbq.com",
      ReplyToAddresses: [req.body.email],
      Destination: {
        ToAddresses: ["catering@bahexpressbbq.com"],
      },
      Message: {
        Subject: {
          Data: "Catering Enquiry",
          Charset: "UTF-8",
        },
        Body: {
          Text: {
            Data: emailText,
            Charset: "UTF-8",
          },
          Html: {
            Data: emailHtml,
            Charset: "UTF-8",
          },
        },
      },
    };

    try {
      await sesClient.send(new SendEmailCommand(emailParams));
      res.status(200).json({ message: "OK" });
    } catch (error) {
      log("Error sending email", error);
      res.status(500).json({ message: "Error sending email" });
    }
  }
);
