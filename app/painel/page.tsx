import { DashboardAutoRefresh } from "@/components/product/dashboard-auto-refresh";
import { DashboardPage } from "@/components/product/dashboard-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function PainelHomePage() {
  const { data } = await getCurrentUserPanelData();
  return (
    <>
      <DashboardAutoRefresh />
      <DashboardPage data={data} />
    </>
  );
}
