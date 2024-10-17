import {
  WhatsappNotificationEntry,
  WhatsappNotificationStatusStatus,
  WhatsappNotificationValue,
} from "@daweto/whatsapp-api-types";
import cors, { CorsOptions } from "cors";
import express, { Request, Response } from "express";
import { WhatsAppAPI } from "whatsapp-api-js";
import { Node18 } from "whatsapp-api-js/setup/node";
import { GetParams, PostData } from "whatsapp-api-js/types";
import { ZodError } from "zod";
import { getClient, getClientIdFromWhatsapp } from "./db/webhook";
import { env } from "./env";
import { logger } from "./logging/winston";
import { SendMessageRequestSchema } from "./model/schema";
import { Perki } from "./webhook/perki";

const app = express();
app.use(express.json());

const options: CorsOptions = {
  origin: "http://localhost:3001", // Replace with your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 204,
};
app.use(cors(options));

const api = new WhatsAppAPI(
  Node18({
    token: env.GRAPH_API_TOKEN,
    appSecret: env.WEBHOOK_APP_SECRET,
    webhookVerifyToken: env.WEBHOOK_VERIFY_TOKEN,
    secure: true,
    v: "v21.0",
  })
);

const perki = new Perki(env.BUSINESS_PHONE_NUMBER_ID, api);

app.get("/", async (req: Request, res: Response) => {
  res.send("Welcome to amarento bot server.");
});

app.get("/health", async (_: Request, res: Response) => {
  res.status(200).send({ success: true });
});

app.get("/webhook", (req: Request, res: Response) => {
  const challenge = api.get(req.query as GetParams);
  res.status(200).send(challenge);
  logger.info("Webhook verified successfully!");
});

app.post("/webhook", async (req: Request, res: Response) => {
  /** request post data. */
  const data = req.body as PostData;

  /** message signature. please make sure APP_SECRET is correct. */
  const signature = req.headers["x-hub-signature-256"] as string;

  try {
    await api.post(data, JSON.stringify(req.body), signature);
    return res.sendStatus(200);
  } catch (ex) {
    logger.error(ex);
    return res.sendStatus(200);
  }
});

app.post("/api/send-initial-message", async (req: Request, res: Response) => {
  try {
    /** client code. */
    const request = SendMessageRequestSchema.parse(req.body);

    /** client. */
    const client = await getClient(request.clientCode);
    if (client instanceof Error)
      return res.status(500).send({ success: false, message: client.message });

    /** send initial messsage. */
    client.guests.map(
      async (guest) => await perki.sendInitalMessage(client, guest)
    );
    logger.info("Initial message sent successfully.");

    res.status(200).send({ success: true, message: null });
  } catch (error) {
    if (error instanceof ZodError)
      res.status(400).json({ success: false, errors: error.errors });
    else
      res.status(500).json({
        success: false,
        message: "Error occurs when sending initial message.",
      });
  }
});

api.on.message = async ({ from, message, raw }) => {
  const entry = raw.entry?.[0] as WhatsappNotificationEntry | undefined;
  const value = entry?.changes?.[0].value as
    | WhatsappNotificationValue
    | undefined;
  const status = value?.statuses?.at(0);

  /** ignore status sent and status read */
  if (
    status?.status === WhatsappNotificationStatusStatus.Sent ||
    status?.status === WhatsappNotificationStatusStatus.Read ||
    status?.status === WhatsappNotificationStatusStatus.Delivered
  ) {
    logger.info(`Ignoring message with status ${status?.status}.`);
    return;
  }

  try {
    const clientId = await getClientIdFromWhatsapp(from);
    if (clientId instanceof Error) {
      logger.info("User was not registered as a client in our database.");
      return;
    }

    perki.onMessage(message);
  } catch (ex) {
    logger.error(ex);
  }
};

app.listen(env.PORT, () => {
  logger.info(`Server is listening on port: http://localhost:${env.PORT}`);
});
