import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import PhoneJson from "~/utils/phone.json";
import { type PhonePrefixResponse } from "~/utils/types";

export const externalRouter = createTRPCRouter({
  phonePrefix: publicProcedure
    .input(
      z.enum([
        "BD",
        "BE",
        "BF",
        "BG",
        "BA",
        "BB",
        "WF",
        "BL",
        "BM",
        "BN",
        "BO",
        "BH",
        "BI",
        "BJ",
        "BT",
        "JM",
        "BV",
        "BW",
        "WS",
        "BQ",
        "BR",
        "BS",
        "JE",
        "BY",
        "BZ",
        "RU",
        "RW",
        "RS",
        "TL",
        "RE",
        "TM",
        "TJ",
        "RO",
        "TK",
        "GW",
        "GU",
        "GT",
        "GS",
        "GR",
        "GQ",
        "GP",
        "JP",
        "GY",
        "GG",
        "GF",
        "GE",
        "GD",
        "GB",
        "GA",
        "SV",
        "GN",
        "GM",
        "GL",
        "GI",
        "GH",
        "OM",
        "TN",
        "JO",
        "HR",
        "HT",
        "HU",
        "HK",
        "HN",
        "HM",
        "VE",
        "PR",
        "PS",
        "PW",
        "PT",
        "SJ",
        "PY",
        "IQ",
        "PA",
        "PF",
        "PG",
        "PE",
        "PK",
        "PH",
        "PN",
        "PL",
        "PM",
        "ZM",
        "EH",
        "EE",
        "EG",
        "ZA",
        "EC",
        "IT",
        "VN",
        "SB",
        "ET",
        "SO",
        "ZW",
        "SA",
        "ES",
        "ER",
        "ME",
        "MD",
        "MG",
        "MF",
        "MA",
        "MC",
        "UZ",
        "MM",
        "ML",
        "MO",
        "MN",
        "MH",
        "MK",
        "MU",
        "MT",
        "MW",
        "MV",
        "MQ",
        "MP",
        "MS",
        "MR",
        "IM",
        "UG",
        "TZ",
        "MY",
        "MX",
        "IL",
        "FR",
        "IO",
        "SH",
        "FI",
        "FJ",
        "FK",
        "FM",
        "FO",
        "NI",
        "NL",
        "NO",
        "NA",
        "VU",
        "NC",
        "NE",
        "NF",
        "NG",
        "NZ",
        "NP",
        "NR",
        "NU",
        "CK",
        "XK",
        "CI",
        "CH",
        "CO",
        "CN",
        "CM",
        "CL",
        "CC",
        "CA",
        "CG",
        "CF",
        "CD",
        "CZ",
        "CY",
        "CX",
        "CR",
        "CW",
        "CV",
        "CU",
        "SZ",
        "SY",
        "SX",
        "KG",
        "KE",
        "SS",
        "SR",
        "KI",
        "KH",
        "KN",
        "KM",
        "ST",
        "SK",
        "KR",
        "SI",
        "KP",
        "KW",
        "SN",
        "SM",
        "SL",
        "SC",
        "KZ",
        "KY",
        "SG",
        "SE",
        "SD",
        "DO",
        "DM",
        "DJ",
        "DK",
        "VG",
        "DE",
        "YE",
        "DZ",
        "US",
        "UY",
        "YT",
        "UM",
        "LB",
        "LC",
        "LA",
        "TV",
        "TW",
        "TT",
        "TR",
        "LK",
        "LI",
        "LV",
        "TO",
        "LT",
        "LU",
        "LR",
        "LS",
        "TH",
        "TF",
        "TG",
        "TD",
        "TC",
        "LY",
        "VA",
        "VC",
        "AE",
        "AD",
        "AG",
        "AF",
        "AI",
        "VI",
        "IS",
        "IR",
        "AM",
        "AL",
        "AO",
        "AQ",
        "AS",
        "AR",
        "AU",
        "AT",
        "AW",
        "IN",
        "AX",
        "AZ",
        "IE",
        "ID",
        "UA",
        "QA",
        "MZ",
      ])
    )
    .query(({ input }) => {
      const phonePrefixList = PhoneJson as PhonePrefixResponse;

      const country = input;

      if (!country || !phonePrefixList[country]) {
        return null;
      }

      const phonePrefix = phonePrefixList[country];
      return phonePrefix;
    }),
});
