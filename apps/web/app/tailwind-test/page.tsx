export default function TailwindTestPage() {
    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Tailwind v4 Test Page</h1>
            
            <div className="space-y-4">
                <div className="p-4 bg-blue-500 text-white shadow-xs rounded-xs">
                    Test shadow-xs and rounded-xs (deprecated in v4)
                </div>
                
                <div className="p-4 bg-red-500 text-white shadow-xs rounded-xs">
                    Test shadow-sm and rounded-sm (deprecated in v4)
                </div>
                
                <div className="p-4 bg-green-500 text-white ring-3 ring-blue-500">
                    Test ring-3 utility (deprecated in v4)
                </div>
                
                <div className="p-4 bg-purple-500 text-white shadow-xs rounded-xs">
                    Test shadow-xs and rounded-xs (new in v4)
                </div>
                
                <div className="p-4 bg-yellow-500 text-white ring-3 ring-red-500">
                    Test ring-3 (new in v4)
                </div>
                
                <button className="outline-hidden p-2 bg-gray-500 text-white">
                    Test outline-hidden (deprecated, should be outline-hidden)
                </button>
                
                <button className="outline-hidden p-2 bg-gray-700 text-white">
                    Test outline-hidden (new in v4)
                </button>
            </div>
        </div>
    );
}
