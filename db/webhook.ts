import { eq } from "drizzle-orm";
import { db } from ".";
import UserMessage from "../model/UserMessage";
import { clients, guests, GuestWithClient } from "./schema";

/** method to get client id from whatsapp number. */
export async function getClientIdFromWhatsapp(
  number: string
): Promise<Error | number> {
  const result = await db
    .select({ clientId: guests.clientId })
    .from(guests)
    .where(eq(guests.waNumber, number))
    .then((res) => res.at(0));

  if (result === undefined)
    return new Error(`[${number}] Error occurs while client id from database.`);
  return result.clientId;
}

/** method to get client code from client id. */
export async function getClientCode(clientId: number): Promise<Error | string> {
  const result = await db
    .select({ clientCode: clients.code })
    .from(clients)
    .where(eq(clients.id, clientId))
    .then((res) => res.at(0));

  if (result === undefined)
    return new Error(
      `[${clientId}] Error occurs while client id from database.`
    );
  return result.clientCode;
}

/** method to get the number of rsvp from whatsapp number. */
export async function getRSVP(number: string): Promise<Error | number> {
  const result = await db
    .select({ nRSVP: guests.nRSVPPlan })
    .from(guests)
    .where(eq(guests.waNumber, number))
    .then((res) => res.at(0));

  if (result === undefined)
    return new Error(
      `[${number}] Error occurs while loading rsvp number from database.`
    );
  return result.nRSVP;
}

/** method to update guest RSVP.  */
export async function updateRSVP(
  number: string,
  state: UserMessage
): Promise<Error | void> {
  const result = await db
    .update(guests)
    .set({
      rsvpHolmat: state.getIsAttendHolmat(),
      nRSVPHolmatWA: state.getNRsvpHolmat(),
      rsvpDinner: state.getIsAttendDinner(),
      nRSVPDinnerWA: state.getNRsvpDinner(),
      guestNames: state.getDinnerNames().toString(),
      updatedAt: new Date(),
    })
    .where(eq(guests.waNumber, number));

  if (result.count === 0)
    return new Error(
      `[${number}] Error occurs while updating rsvp number from database.`
    );
}

/** method to get client from client code. */
export async function getClient(clientCode: string) {
  const result = await db.query.clients.findFirst({
    where: eq(clients.code, clientCode),
    with: { guests: true },
  });

  if (result === undefined)
    return new Error(
      `[${clientCode}] Error occurs while fetching client from client code.`
    );
  return result;
}

/** method to get client from whatsapp number. */

export async function getGuestFromWhatsapp(number: string) {
  const result: GuestWithClient | undefined = await db.query.guests.findFirst({
    where: eq(guests.waNumber, number),
    with: { client: true },
  });

  if (result === undefined)
    return new Error(
      `[${number}] Error occurs while fetching client from whatsapp number.`
    );
  return result;
}
