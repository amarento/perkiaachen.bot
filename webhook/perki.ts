import fs from "fs";
import { WhatsAppAPI } from "whatsapp-api-js";
import {
  BodyComponent,
  BodyParameter,
  HeaderComponent,
  HeaderParameter,
  Image,
  Language,
  Template,
  Text,
} from "whatsapp-api-js/messages";
import { ServerMedia, ServerMessage } from "whatsapp-api-js/types";
import { Client, Guest, GuestWithClient } from "../db/schema";
import { getGuestFromWhatsapp, updateRSVP } from "../db/webhook";
import { logger } from "../logging/winston";
import UserMessage from "../model/UserMessage";
import UserMessageStore from "../model/UserMessageStore";
import { generateInvitation, pathExist, toLocalTime } from "./utils";

export class Perki {
  private whatsappId: string;
  private api: WhatsAppAPI;

  constructor(business_phone_number_id: string, api: WhatsAppAPI) {
    this.whatsappId = business_phone_number_id;
    this.api = api;
  }

  /** method to send initialize message. */
  public sendInitalMessage = async (
    client: Client,
    guest: Guest
  ): Promise<void> => {
    /** construct template. */
    const message = new Template(
      "perki_christmas_hello",
      new Language("id"),
      new HeaderComponent(new HeaderParameter("NATAL PERKI AACHEN 2024")),
      new BodyComponent(
        new BodyParameter(guest.invNames),
        new BodyParameter(toLocalTime(client.dinnerTime ?? new Date()))
      )
    );

    /** send initial message. */
    const response = await this.api.sendMessage(
      this.whatsappId,
      guest.waNumber,
      message
    );

    logger.info(
      `Initial message sent with response. ${JSON.stringify(response)}`
    );
  };

  /** method to handle client rsvp. */
  public onMessage = async (message?: ServerMessage) => {
    if (message?.from === undefined) return;

    if (message && UserMessageStore.get(message.from) === undefined)
      UserMessageStore.set(message.from, new UserMessage());

    /** get the message state. It should not be empty. */
    const state = UserMessageStore.get(message!.from);
    if (state === undefined) {
      console.error(
        "An error ocurred while reading state for the user. User message state was not initialized."
      );
      return;
    }

    /** thank you message. */
    if (message?.type === "button" && state.getNextQuestionId() === 0) {
      await this.api.markAsRead(this.whatsappId, message.id);

      const isComing = message.button?.text.toUpperCase() === "YA";
      const response = new Text(
        `Thank you for confirming. ${
          isComing
            ? "You will get a message with qr code shortly! ❤️"
            : "Sad to hear that ... 🥲"
        }`
      );
      await this.api.sendMessage(this.whatsappId, message.from, response);

      const state = new UserMessage();
      if (!isComing) {
        /** confirm rsvp. */
        state.setIsAttendDinner(false);
        state.setNRsvpDinner(0);
        await updateRSVP(message.from, state);
        return;
      }

      /** confirm rsvp. */
      state.setIsAttendDinner(true);
      state.setNRsvpDinner(1);
      await updateRSVP(message.from, state);

      /** send reminder with qr code. */
      const guest = await getGuestFromWhatsapp(message.from);
      if (guest instanceof Error) return;
      await this.sendReminder(guest);
    }
  };

  /** method to send reminder with qr-code. */
  public sendReminder = async (guest: GuestWithClient) => {
    /** create qr code */
    logger.info(`Creating QR code for guest with id ${guest.id}`);
    const url = `https://amarento.id/clients/${guest.client.code}/${guest.id}`;
    const fileName = `./invitations/qr-${guest.client.code}-${guest.id}.png`;
    pathExist(fileName);

    /** generate invitation image. */
    const generateResponse = await generateInvitation(
      "./images/background.jpg",
      guest.invNames,
      guest.nRSVPPlan.toString(),
      url,
      fileName
    );
    if (!generateResponse.success) return generateResponse;

    try {
      /** upload invitation to whatsapp. */
      const form = new FormData();
      form.set(
        "file",
        new Blob([fs.readFileSync(fileName)], { type: "image/png" })
      );

      const { id } = (await this.api.uploadMedia(
        this.whatsappId,
        form
      )) as ServerMedia;
      logger.info(`Media with id ${id} was successfully uploaded.`);

      /** construct template. */
      const message = new Template(
        "perki_christmas_qr",
        new Language("id"),
        new HeaderComponent(new HeaderParameter(new Image(id, true)))
      );

      /** send template message. */
      const response = await this.api.sendMessage(
        this.whatsappId,
        guest.waNumber,
        message
      );
      logger.info(
        `Reminder message sent with response. ${JSON.stringify(response)}`
      );

      return { success: true, message: null };
    } catch (ex) {
      logger.error(`An error occured while sending reminder. Error: ${ex}`);
    }
  };
}
