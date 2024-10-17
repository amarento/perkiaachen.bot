import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `amarento.id_${name}`);

export const clients = createTable("clients", {
  id: serial("id").primaryKey(),
  code: varchar("client_code", { length: 256 }).unique().notNull(),
  nameGroom: varchar("name_groom", { length: 256 }),
  nameBride: varchar("name_bride", { length: 256 }),
  parentsNameGroom: varchar("parents_name_groom", { length: 256 }),
  parentsNameBride: varchar("parents_name_bride", { length: 256 }),
  weddingDay: timestamp("wedding_day", { mode: "date", withTimezone: true }),
  holmatLocation: varchar("holmat_location", { length: 256 }),
  holmatTime: timestamp("holmat_time", { mode: "date", withTimezone: true }),
  dinnerLocation: varchar("dinner_location", { length: 256 }),
  dinnerTime: timestamp("dinner_time", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
    () => new Date()
  ),
});

export const clientRelations = relations(clients, ({ many }) => ({
  guests: many(guests),
}));

export type NewClient = typeof clients.$inferInsert;
export type Client = typeof clients.$inferSelect;

export const guests = createTable(
  "guests",
  {
    id: serial("id").primaryKey(),
    clientId: integer("client_id")
      .references(() => clients.id)
      .notNull(),
    invNames: varchar("inv_names", { length: 256 }).notNull(),
    guestNames: varchar("guest_names", { length: 256 }),
    waNumber: varchar("wa_number", { length: 256 }).notNull(),
    nRSVPPlan: integer("n_rsvp_plan").notNull(),
    side: varchar("side", { length: 256 }),

    rsvpHolmat: boolean("rsvp_holmat").default(false),
    nRSVPHolmatWA: integer("n_rsvp_holmat_wa"),
    rsvpDinner: boolean("rsvp_dinner").default(false),
    nRSVPDinnerWA: integer("n_rsvp_dinner_wa"),

    nRSVPHolmatAct: integer("n_rsvp_holmat_act"),
    nRSVPDinnerAct: integer("n_rsvp_dinner_act"),
    tableName: varchar("table_name", { length: 256 }),
    _angpaoGiven: boolean("_angpaoGiven").default(false),
    _souvenirTaken: boolean("_souvenirTaken").default(false),
    _angpaoTitipan: boolean("_angpaoTitipan").default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (guest) => ({
    nameIndex: index("name_idx").on(guest.invNames),
  })
);

export const guestsRelations = relations(guests, ({ one }) => ({
  client: one(clients, {
    fields: [guests.clientId],
    references: [clients.id],
  }),
}));

export type NewGuest = typeof guests.$inferInsert;
export type Guest = typeof guests.$inferSelect;
export type GuestWithClient = Guest & {
  client: Client;
};
export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  })
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);
