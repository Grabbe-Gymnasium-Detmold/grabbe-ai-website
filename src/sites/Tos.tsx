import {BlueLink} from "@/components/BlueLink.tsx";

const Tos: React.FC = () => {
    return (
        <div className="bg-white text-gray-800 flex justify-center items-center min-h-screen dark:bg-gray-800 dark:text-white">
            <div className="container mx-auto max-w-4xl p-10">
                <div className="title text-3xl font-semibold mb-4">Terms of Service</div>
                <div className="text-gray-600 dark:text-gray-300">
                    <p className="mb-6">
                        Welcome to GrabbeAI! By using our services, you agree to comply with and be bound by the following
                        Terms of Service. Please read them carefully.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
                    <p className="mb-6">
                        By accessing and using the services of GrabbeAI, you agree to the terms outlined in this agreement.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">2. Changes to Terms</h2>
                    <p className="mb-6">
                        We reserve the right to modify or update these terms at any time. Any changes will be reflected
                        on this page with the updated date.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">3. User Responsibilities</h2>
                    <p className="mb-6">
                        As a user, you are responsible for maintaining the confidentiality of your account and password,
                        and for all activities that occur under your account.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">4. Prohibited Activities</h2>
                    <p className="mb-6">
                        You agree not to engage in any activities that could harm the integrity of our services, including
                        but not limited to hacking, spamming, or any form of unauthorized access.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
                    <p className="mb-6">
                        We are not responsible for any damages arising from the use or inability to use our services.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">6. Governing Law</h2>
                    <p className="mb-6">
                        These terms shall be governed by the laws of the country in which we operate.
                    </p>
                </div>
                <BlueLink href="/">Go back to Home</BlueLink>
            </div>
        </div>
    );
};
export { Tos };