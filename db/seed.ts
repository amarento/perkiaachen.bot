import { db } from ".";
import { guests, type NewGuest } from "./schema";

const defaults: NewGuest[] = [
  {
    clientId: 1,
    invNames: "Felix Arjuna",
    waNumber: "4915237363126",
    nRSVPPlan: 2,
  },
  {
    clientId: 1,
    invNames: "Aaron Randy",
    waNumber: "4917634685672",
    nRSVPPlan: 1,
  },
  {
    clientId: 1,
    invNames: "Steffen Josua",
    waNumber: "4915901993904",
    nRSVPPlan: 2,
  },
  {
    clientId: 1,
    invNames: "Ricky Jonathan",
    waNumber: "4915256917547",
    nRSVPPlan: 3,
  },
  {
    clientId: 1,
    invNames: "Celine Gabrielle",
    waNumber: "62895324913833",
    nRSVPPlan: 2,
  },
  {
    clientId: 1,
    invNames: "Vionita Hartanto",
    waNumber: "6281231080808",
    nRSVPPlan: 3,
  },
];

async function seed() {
  console.log("Seeding ...");
  console.time("DB has been seeded!");

  /** seed database */
  console.log("Seeding done!");
  await db.insert(guests).values(defaults);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
