import { motion } from "framer-motion";
import { Heart, Calendar, BookOpen, ExternalLink } from "lucide-react";

const resources = [
  {
    category: "Campus Wellness",
    items: [
      { title: "Counseling & Psychological Services", desc: "Free confidential support for students", icon: Heart },
      { title: "Student Health Center", desc: "Medical care and wellness programs", icon: Heart },
      { title: "Recreation & Fitness Center", desc: "Group classes, gym access, and intramurals", icon: Heart },
    ],
  },
  {
    category: "Campus Events",
    items: [
      { title: "Mindfulness Meditation (Wednesdays)", desc: "Weekly guided meditation, 12pm Student Center", icon: Calendar },
      { title: "Wellness Week", desc: "Annual campus-wide wellness programming", icon: Calendar },
      { title: "Study Break Socials", desc: "Friday afternoon de-stress events", icon: Calendar },
    ],
  },
  {
    category: "Wellbeing Tips",
    items: [
      { title: "The Power of 20-Minute Breaks", desc: "Short recovery periods improve focus by up to 30%", icon: BookOpen },
      { title: "Sleep & Academic Performance", desc: "7-9 hours of sleep correlates with higher GPA outcomes", icon: BookOpen },
      { title: "Movement as Medicine", desc: "Even 10 minutes of walking improves mood and cognition", icon: BookOpen },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen pb-24 px-4 pt-6 max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-bold mb-1">Resources</h1>
      <p className="text-sm text-muted-foreground mb-6">Support for your whole self</p>

      {resources.map((section, si) => (
        <motion.div
          key={section.category}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.1 }}
          className="mb-6"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {section.category}
          </p>
          <div className="space-y-2">
            {section.items.map(({ title, desc, icon: Icon }) => (
              <div key={title} className="glass-card p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
