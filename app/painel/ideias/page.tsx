import { IdeasPage } from "@/components/product/ideas-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function IdeiasPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <IdeasPage data={data} />;
}
