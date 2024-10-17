import fs from "fs";
import Jimp from "jimp";
import { DateTime } from "luxon";
import path from "path";
import QRCode from "qrcode";
import { logger } from "../logging/winston";

/** method to validate path existence. */
export function pathExist(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/** method to generate invitation. */
export async function generateInvitation(
  backgroundImage: string,
  guestName: string,
  nRSVP: string,
  url: string,
  fileName: string
) {
  try {
    /** load background. */
    const bg = await Jimp.read(backgroundImage);

    /** generate qr code. */
    const size = Math.min(bg.getWidth(), bg.getHeight()) / 2;
    const dataURL = await QRCode.toDataURL(url, {
      width: size,
    });
    const qr = await Jimp.read(Buffer.from(dataURL.split(",")[1], "base64"));

    /** calculate positions. */
    const x = (bg.getWidth() - size) / 2;
    const y = (bg.getHeight() - size) / 2;

    /** composite qr code into the background. */
    bg.composite(qr, x, y - 50);

    /** load font */
    const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    /** add guest name. */
    bg.print(
      smallFont,
      0,
      y + size - 60,
      {
        text: `${guestName}`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      bg.getWidth()
    );

    /** add rsvp pax. */
    bg.print(
      smallFont,
      0,
      y + size,
      {
        text: `Valid for ${nRSVP} pax`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      bg.getWidth()
    );

    /** save the invitation as iamge file. */
    await bg.writeAsync(fileName);
    logger.info(
      `Invitation with the name ${fileName} was successfully generated.`
    );
    return {
      success: true,
      message: null,
    };
  } catch (error) {
    logger.error(
      `An error occured while generating the invitation. Error: ${error}`
    );
    return {
      success: false,
      message: "Error occurs when generating invitation.",
    };
  }
}

/** method to convert javascript datetime to pretty local time */
export function toLocalTime(date: Date) {
  return DateTime.fromJSDate(date)
    .setZone("Asia/Jakarta")
    .setLocale("id-ID")
    .toFormat("EEEE, dd MMMM yyyy 'pukul' HH:mm 'WIB'");
}
