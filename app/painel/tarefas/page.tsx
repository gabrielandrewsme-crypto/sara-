import { TasksPage } from "@/components/product/tasks-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function TarefasPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <TasksPage data={data} />;
}
