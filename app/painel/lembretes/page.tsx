import { RemindersPage } from "@/components/product/reminders-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function LembretesPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <RemindersPage data={data} />;
}
