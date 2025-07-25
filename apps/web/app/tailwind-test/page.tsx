export default function TailwindTestPage() {
    return (
        <div className="space-y-4 p-8">
            <h1 className="text-2xl font-bold">Tailwind v4 Test Page</h1>

            <div className="space-y-4">
                <div className="shadow-xs rounded-xs bg-blue-500 p-4 text-white">
                    Test shadow-xs and rounded-xs (deprecated in v4)
                </div>

                <div className="shadow-xs rounded-xs bg-red-500 p-4 text-white">
                    Test shadow-sm and rounded-sm (deprecated in v4)
                </div>

                <div className="ring-3 bg-green-500 p-4 text-white ring-blue-500">
                    Test ring-3 utility (deprecated in v4)
                </div>

                <div className="shadow-xs rounded-xs bg-purple-500 p-4 text-white">
                    Test shadow-xs and rounded-xs (new in v4)
                </div>

                <div className="ring-3 bg-yellow-500 p-4 text-white ring-red-500">
                    Test ring-3 (new in v4)
                </div>

                <button className="outline-hidden bg-gray-500 p-2 text-white">
                    Test outline-hidden (deprecated, should be outline-hidden)
                </button>

                <button className="outline-hidden bg-gray-700 p-2 text-white">
                    Test outline-hidden (new in v4)
                </button>
            </div>
        </div>
    );
}
