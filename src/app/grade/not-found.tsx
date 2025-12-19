import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F1419] text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="mb-8">
          <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Coin Not Found</h1>
          <p className="text-gray-400 text-lg mb-6">
            The cryptocurrency you&apos;re looking for doesn&apos;t exist in our database or the name might be misspelled.
          </p>
        </div>
        
        <div className="bg-[#1A1F2E] rounded-lg p-6 border border-gray-800 mb-8">
          <h2 className="text-xl font-semibold mb-4">Try searching for:</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-gray-300">• Bitcoin (bitcoin)</div>
            <div className="text-gray-300">• Ethereum (ethereum)</div>
            <div className="text-gray-300">• Dogecoin (dogecoin)</div>
            <div className="text-gray-300">• Solana (solana)</div>
            <div className="text-gray-300">• Cardano (cardano)</div>
            <div className="text-gray-300">• Chainlink (chainlink)</div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            ← Back to All Coins
          </Link>
          <div className="text-sm text-gray-500">
            Or browse our top 100 cryptocurrencies above
          </div>
        </div>
      </div>
    </div>
  );
}
