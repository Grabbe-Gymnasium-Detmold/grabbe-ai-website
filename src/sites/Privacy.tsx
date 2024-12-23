import {BlueLink} from "@/components/BlueLink.tsx";

const Privacy: React.FC = () => {
    return (
        <div className="bg-white text-gray-800 flex justify-center items-center min-h-screen dark:bg-gray-800 dark:text-white">
            <div className="container mx-auto max-w-4xl p-10">
                <div className="title text-3xl font-semibold mb-4">Privacy Policy</div>
                <div className="text-gray-600 dark:text-gray-300">
                    <p className="mb-6">
                        Your privacy is important to us. This Privacy Policy explains the types of data we collect and how
                        it is used.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
                    <p className="mb-6">
                        We collect personal information when you use our services, including your name, email address,
                        and usage data.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
                    <p className="mb-6">
                        We use your information to provide, maintain, and improve our services. We may also use it to
                        communicate with you about updates or changes to the services.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">3. Data Security</h2>
                    <p className="mb-6">
                        We implement reasonable security measures to protect your personal data. However, no system is
                        completely secure, and we cannot guarantee absolute security.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">4. Sharing Your Information</h2>
                    <p className="mb-6">
                        We do not sell or rent your personal information to third parties. However, we may share your data
                        with trusted service providers for the purpose of providing our services.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
                    <p className="mb-6">
                        You have the right to access, correct, or delete your personal information at any time. You may
                        also withdraw consent where applicable.
                    </p>
                    <h2 className="text-2xl font-semibold mb-3">6. Changes to This Policy</h2>
                    <p className="mb-6">
                        We may update this privacy policy from time to time. Any changes will be posted on this page with
                        an updated date.
                    </p>
                </div>
                <BlueLink href="/">Go back to Home</BlueLink>
            </div>
        </div>
    );
};

export { Privacy };