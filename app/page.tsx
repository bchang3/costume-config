import ConfigForm from "./config-form";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="temple-title mb-3 text-center text-4xl font-black">Costume Lights</h1>
      <p className="stone-plaque mb-6 rounded-lg px-3 py-2 text-center text-sm">
        Boards fetch settings on boot — press RESET after saving.
      </p>
      <ConfigForm />
    </main>
  );
}
