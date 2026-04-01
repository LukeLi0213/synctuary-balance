import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfUsePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Terms of Use (EULA)</h1>
        </div>

        <div className="prose prose-sm text-muted-foreground space-y-4">
          <p><strong>Last updated:</strong> April 1, 2026</p>

          <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>
            By downloading, installing, or using Synctuary, you agree to be bound by these Terms of Use. 
            If you do not agree, do not use the app.
          </p>

          <h2 className="text-lg font-semibold text-foreground">2. Subscription Terms</h2>
          <p>
            Synctuary Pro is available as a monthly subscription at $5.00/month. Payment will be charged 
            to your Apple ID account at confirmation of purchase. Subscription automatically renews unless 
            auto-renew is turned off at least 24 hours before the end of the current period. Your account 
            will be charged for renewal within 24 hours prior to the end of the current period at the rate 
            of $5.00/month.
          </p>

          <h2 className="text-lg font-semibold text-foreground">3. Managing Subscriptions</h2>
          <p>
            Subscriptions may be managed by the user, and auto-renewal may be turned off by going to the 
            user's Account Settings on the device after purchase.
          </p>

          <h2 className="text-lg font-semibold text-foreground">4. No Refunds</h2>
          <p>
            All sales are final. No refunds will be issued for subscription payments. You may cancel your 
            subscription at any time to prevent future charges, but you will retain access until the end 
            of the current billing period.
          </p>

          <h2 className="text-lg font-semibold text-foreground">5. User Conduct</h2>
          <p>
            You agree to use Synctuary only for lawful purposes and in accordance with these Terms. 
            You must not misuse the app or attempt to gain unauthorized access to any part of the service.
          </p>

          <h2 className="text-lg font-semibold text-foreground">6. Intellectual Property</h2>
          <p>
            All content, features, and functionality of Synctuary are owned by the Synctuary team 
            and are protected by copyright and other intellectual property laws.
          </p>

          <h2 className="text-lg font-semibold text-foreground">7. Limitation of Liability</h2>
          <p>
            Synctuary is provided "as is" without warranties of any kind. We shall not be liable for 
            any indirect, incidental, special, or consequential damages arising from your use of the app.
          </p>

          <h2 className="text-lg font-semibold text-foreground">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account at our sole discretion, without 
            notice, for conduct that we determine violates these Terms.
          </p>

          <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:synctuary0@gmail.com" className="text-primary hover:underline">synctuary0@gmail.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
