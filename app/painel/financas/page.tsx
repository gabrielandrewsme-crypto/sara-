import { FinancePage } from "@/components/product/finance-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function FinancePageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <FinancePage data={data} />;
}
