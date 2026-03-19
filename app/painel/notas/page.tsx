import { NotesPage } from "@/components/product/notes-page";
import { getCurrentUserPanelData } from "@/lib/sara/panel";

export default async function NotesPageRoute() {
  const { data } = await getCurrentUserPanelData();
  return <NotesPage data={data} />;
}
