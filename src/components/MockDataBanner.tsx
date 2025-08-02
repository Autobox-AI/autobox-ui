'use client'

export function MockDataBanner() {
  if (process.env.NEXT_PUBLIC_MOCKS_ENABLED !== 'true') {
    return null
  }

  return (
    <div className="sticky top-0 z-50 bg-yellow-500 text-black px-4 py-2 text-center text-sm font-medium">
      <span className="inline-flex items-center gap-2">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <strong>Mock Mode:</strong> This environment is using mock data. AI agents are not connected
        to any LLM services.{' '}
        <a
          href="https://margostino.com/posts/the-next-layer-of-intelligence-part-1"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          Read More
        </a>
      </span>
    </div>
  )
}
