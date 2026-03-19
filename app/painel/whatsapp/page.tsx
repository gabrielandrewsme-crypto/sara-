import { WhatsAppLinkPage } from "@/components/product/whatsapp-link-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function WhatsAppPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <WhatsAppLinkPage data={data} />;
}
