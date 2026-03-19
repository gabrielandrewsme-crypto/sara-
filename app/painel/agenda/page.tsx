import { AgendaPage } from "@/components/product/agenda-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function AgendaPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <AgendaPage data={data} />;
}
