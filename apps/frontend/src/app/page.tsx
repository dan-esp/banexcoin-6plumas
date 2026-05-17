import { ConsoleScreen } from "@/features/console/components";
import { getConsoleData } from "@/features/console/data";

export default async function Home() {
  const consoleData = await getConsoleData();

  return <ConsoleScreen {...consoleData} />;
}
