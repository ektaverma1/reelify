import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import VideoUpload from "./components/VideoUpload"
import VideoFeed from "./components/VideoFeed"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-3"
            >
              <span className="text-xl font-bold text-indigo-600">REELIFY</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <SignedIn>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
              </SignedIn>
            </div>

            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </SignedIn>
              <SignedOut>
                <SignInButton>
                  <button className="px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors">
                    Sign in
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Share Your Moments
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Upload, watch, and share short videos with the world
          </p>
        </div>

        <SignedIn>
          <div className="mb-12">
            <h2 className="text-center text-2xl font-semibold text-gray-900 mb-6">Upload a Video</h2>
            <VideoUpload />
          </div>
        </SignedIn>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Trending Videos</h2>
          <VideoFeed />
        </div>
      </main>
    </div>
  )
}