import TTSInterface from "@/src/components/TTSInterface";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-900">
          Text to Speech con IA
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Genera voz realista con clonación de voz usando XTTS-v2
        </p>
        <TTSInterface />
      </div>
    </main>
  );
}
