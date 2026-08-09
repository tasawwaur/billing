import React from "react";
import { Bill } from "@/types/bill";
import { StoreSettings } from "@/types/store";
import { BillTemplateLuxuryGold } from "./BillTemplateLuxuryGold";
import { BillTemplateLuxuryBlack } from "./BillTemplateLuxuryBlack";
import { BillTemplateModern } from "./BillTemplateModern";
import { BillTemplateClassic } from "./BillTemplateClassic";
import { BillTemplateRetail } from "./BillTemplateRetail";
import { BillTemplateThermal80 } from "./BillTemplateThermal80";
import { BillTemplateThermal58 } from "./BillTemplateThermal58";

interface BillTemplateA4Props {
  bill: Bill;
  settings: StoreSettings;
  templateOverride?: string;
}

export const BillTemplateA4: React.FC<BillTemplateA4Props> = ({
  bill,
  settings,
  templateOverride,
}) => {
  const activeTemplate = templateOverride || bill.templateId || settings.activeTemplate || "luxury_gold";

  switch (activeTemplate) {
    case "luxury_black":
      return <BillTemplateLuxuryBlack bill={bill} settings={settings} />;
    case "modern_white":
    case "modern":
    case "corporate_a4":
      return <BillTemplateModern bill={bill} settings={settings} />;
    case "classic_retail":
    case "classic":
    case "premium_gst":
      return <BillTemplateClassic bill={bill} settings={settings} />;
    case "retail_premium":
    case "retail":
      return <BillTemplateRetail bill={bill} settings={settings} />;
    case "thermal80":
      return <BillTemplateThermal80 bill={bill} settings={settings} />;
    case "thermal58":
      return <BillTemplateThermal58 bill={bill} settings={settings} />;
    case "luxury_gold":
    case "luxury":
    default:
      return <BillTemplateLuxuryGold bill={bill} settings={settings} />;
  }
};
