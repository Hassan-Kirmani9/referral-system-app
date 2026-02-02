import { Loader2 } from 'lucide-react';

export const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <Loader2 className="mx-auto animate-spin text-primary" size={40} />
                <p className="mt-4 text-gray-600 font-medium">Loading...</p>
            </div>
        </div>
    );
};