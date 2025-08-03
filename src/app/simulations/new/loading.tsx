export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-4 mb-8">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-zinc-700 border-t-blue-500 rounded-full animate-spin"></div>
          <div
            className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin"
            style={{ animationDuration: '1.5s' }}
          ></div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-zinc-300 mb-2">Creating New Simulation</h2>
          <p className="text-sm text-zinc-500">Please wait while we prepare your simulation...</p>
        </div>
      </div>
    </div>
  )
}
