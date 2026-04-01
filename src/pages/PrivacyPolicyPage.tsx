import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        </div>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> April 1, 2026</p>

          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>
            Synctuary collects account information (email address, display name), app usage data 
            (tasks, check-ins, avatar customization), and subscription/payment data processed securely 
            through Stripe. We do not sell your personal information to third parties.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>
            We use your data to provide and improve the Synctuary experience, manage your account and 
            subscription, send transactional emails, and ensure application security.
          </p>

          <h2 className="text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption and cloud infrastructure. 
            We implement appropriate technical and organizational measures to protect your personal data.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. Third-Party Services</h2>
          <p>
            We use Stripe for payment processing. Stripe's privacy policy governs payment data handling. 
            We may use analytics services to improve app performance.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time 
            by contacting us at <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">synctuary0@gmail.com</a>.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Children's Privacy</h2>
          <p>
            Synctuary is not intended for children under 13. We do not knowingly collect personal 
            information from children under 13.
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new policy on this page.
          </p>

          <h2 className="text-lg font-semibold text-foreground">8. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at{" "}
            <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">synctuary0@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
