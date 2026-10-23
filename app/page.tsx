import ConfigForm from "./config-form";
import { FireboyIcon, WatergirlIcon } from "./icons";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-2 flex justify-center gap-4">
        <FireboyIcon className="h-24 w-auto drop-shadow-lg" />
        <WatergirlIcon className="h-24 w-auto drop-shadow-lg" />
      </div>
      <h1 className="temple-title mb-3 text-center text-4xl font-black">Costume Lights</h1>
      <ConfigForm />
    </main>
  );
}
