export const metadata = {
  title: "Privacy Policy | Notezy",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-foreground">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: March 9, 2026
      </p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          1. Information We Collect
        </h2>
        <p>When you use Notezy, we may collect the following information:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Account information (name, email address)</li>
          <li>Content you create (notes, documents)</li>
          <li>Usage data (pages visited, features used)</li>
          <li>Device and browser information</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>To provide and maintain the Notezy service</li>
          <li>To improve user experience</li>
          <li>To communicate with you about updates</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Data Sharing</h2>
        <p>
          We do not sell your personal data. We may share data with third-party
          services (e.g., authentication providers) solely to operate the
          service.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Data Retention</h2>
        <p>
          We retain your data as long as your account is active. You may request
          deletion at any time by contacting us.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
        <p>
          You have the right to access, correct, or delete your personal data.
          Contact us at{" "}
          <a href="mailto:your-email@example.com" className="underline">
            your-email@example.com
          </a>
          .
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
        <p>
          We use cookies and local storage to maintain your session and
          preferences.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          7. Changes to This Policy
        </h2>
        <p>
          We may update this policy from time to time. We will notify you of
          significant changes via the application.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
        <p>
          If you have questions, contact us at{" "}
          <a href="mailto:your-email@example.com" className="underline">
            your-email@example.com
          </a>
          .
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicyPage;
