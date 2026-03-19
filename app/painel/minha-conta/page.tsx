import { AccountPage } from "@/components/product/account-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function MinhaContaPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <AccountPage data={data} />;
}
