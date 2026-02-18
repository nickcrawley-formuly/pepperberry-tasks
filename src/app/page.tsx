export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-tight text-stone-800">
            Pepperberry Farm
          </h1>
          <p className="mt-1 text-sm text-stone-400 tracking-wide">
            Task Board
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-stone-500 mb-1.5"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition"
              />
            </div>

            <div>
              <label
                htmlFor="pin"
                className="block text-xs font-medium text-stone-500 mb-1.5"
              >
                PIN
              </label>
              <input
                id="pin"
                type="password"
                maxLength={4}
                placeholder="4-digit PIN"
                className="w-full rounded-lg border border-stone-200 px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-300 focus:border-transparent transition tracking-[0.3em]"
              />
            </div>

            <button className="w-full rounded-lg bg-stone-800 py-2.5 text-sm font-medium text-white hover:bg-stone-700 active:bg-stone-900 transition">
              Sign in
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-300">
          Coolongatta, NSW
        </p>
      </div>
    </div>
  );
}
