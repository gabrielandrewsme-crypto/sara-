import { RoutinePage } from "@/components/product/routine-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function RotinaPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <RoutinePage data={data} />;
}
