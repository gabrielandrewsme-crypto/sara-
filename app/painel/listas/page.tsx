import { ListsPage } from "@/components/product/lists-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function ListasPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <ListsPage data={data} />;
}
