import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, Plus, Copy, LogIn, Crown, Zap, Heart, Check } from "lucide-react";
import { toast } from "sonner";
import WellbeingAvatar from "@/components/WellbeingAvatar";
import type { AvatarMood } from "@/lib/store";

interface GroupMember {
  user_id: string;
  profile: {
    display_name: string;
    avatar_mood: string;
    xp: number;
    level: number;
    equipped_items: string[];
    tasks_completed: number;
    recovery_taken: number;
    balance_score: number;
  };
}

interface Group {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  members: GroupMember[];
}

export default function GroupPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);

  useEffect(() => {
    if (user) loadGroups();
  }, [user]);

  const loadGroups = async () => {
    setLoading(true);
    // Get user's group memberships
    const { data: memberships } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user!.id);

    if (!memberships?.length) {
      setGroups([]);
      setLoading(false);
      return;
    }

    const groupIds = memberships.map((m) => m.group_id);

    // Get groups
    const { data: groupsData } = await supabase
      .from("groups")
      .select("*")
      .in("id", groupIds);

    if (!groupsData) {
      setLoading(false);
      return;
    }

    // Get all members for these groups
    const { data: allMembers } = await supabase
      .from("group_members")
      .select("group_id, user_id")
      .in("group_id", groupIds);

    // Get profiles for all members
    const memberUserIds = [...new Set(allMembers?.map((m) => m.user_id) || [])];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", memberUserIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

    const enrichedGroups: Group[] = groupsData.map((g) => ({
      ...g,
      members: (allMembers || [])
        .filter((m) => m.group_id === g.id)
        .map((m) => ({
          user_id: m.user_id,
          profile: profileMap.get(m.user_id) || {
            display_name: "Unknown",
            avatar_mood: "happy",
            xp: 0,
            level: 1,
            equipped_items: [],
            tasks_completed: 0,
            recovery_taken: 0,
            balance_score: 50,
          },
        })),
    }));

    setGroups(enrichedGroups);
    setLoading(false);
  };

  const [creating, setCreating] = useState(false);

  const createGroup = async () => {
    if (!newGroupName.trim() || creating) return;
    setCreating(true);
    const { data: group, error } = await supabase
      .from("groups")
      .insert({ name: newGroupName.trim(), created_by: user!.id })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create group");
      setCreating(false);
      return;
    }

    // Add creator as member
    await supabase.from("group_members").insert({ group_id: group.id, user_id: user!.id });

    toast.success("Group created!");
    setNewGroupName("");
    setShowCreate(false);
    setCreating(false);
    loadGroups();
  };

  const joinGroup = async () => {
    if (!inviteCode.trim()) return;

    // Find group by invite code
    const { data: groups } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", inviteCode.trim().toLowerCase());

    if (!groups?.length) {
      toast.error("No group found with that invite code");
      return;
    }

    const group = groups[0];

    // Check if already a member
    const { data: existing } = await supabase
      .from("group_members")
      .select("id")
      .eq("group_id", group.id)
      .eq("user_id", user!.id);

    if (existing?.length) {
      toast.error("You're already in this group");
      return;
    }

    // Check member count
    const { count } = await supabase
      .from("group_members")
      .select("id", { count: "exact" })
      .eq("group_id", group.id);

    if ((count || 0) >= group.max_members) {
      toast.error("This group is full");
      return;
    }

    await supabase.from("group_members").insert({ group_id: group.id, user_id: user!.id });

    toast.success(`Joined "${group.name}"!`);
    setInviteCode("");
    setShowJoin(false);
    loadGroups();
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse-soft text-muted-foreground">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 pt-8 max-w-lg mx-auto bg-background">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Groups</h1>
          <p className="text-sm text-muted-foreground">Stay accountable with friends</p>
        </div>
        <Users size={24} className="text-primary" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Create Group
        </button>
        <button
          onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          <LogIn size={16} /> Join Group
        </button>
      </div>

      {/* Create Group Form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-4 mb-4">
          <input
            type="text"
            placeholder="Group name..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />
          <button onClick={createGroup} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            Create
          </button>
        </motion.div>
      )}

      {/* Join Group Form */}
      {showJoin && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card p-4 mb-4">
          <input
            type="text"
            placeholder="Enter invite code..."
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary mb-3"
          />
          <button onClick={joinGroup} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
            Join
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {groups.length === 0 && (
        <div className="glass-card p-8 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="font-display font-semibold text-foreground mb-1">No groups yet</h3>
          <p className="text-sm text-muted-foreground">Create a group or join one with an invite code to stay accountable with friends.</p>
        </div>
      )}

      {/* Groups List */}
      {groups.map((group) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-elevated p-5 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-foreground">{group.name}</h3>
            <button
              onClick={() => copyInviteCode(group.invite_code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy size={12} /> {group.invite_code}
            </button>
          </div>

          <div className="space-y-3">
            {group.members.map((member) => {
              const isMe = member.user_id === user!.id;
              return (
                <button
                  key={member.user_id}
                  onClick={() => setSelectedMember(selectedMember?.user_id === member.user_id ? null : member)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-background/50 hover:bg-secondary/50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                    {member.profile.avatar_mood === "happy" ? "😊" : member.profile.avatar_mood === "tired" ? "😴" : "😌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground truncate">
                        {member.profile.display_name}
                      </span>
                      {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">you</span>}
                      {member.user_id === group.created_by && <Crown size={12} className="text-accent" />}
                    </div>
                    <span className="text-xs text-muted-foreground">Lvl {member.profile.level} · {member.profile.xp} XP</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5"><Check size={12} className="text-primary" /> {member.profile.tasks_completed}</span>
                    <span className="flex items-center gap-0.5"><Heart size={12} className="text-recovery" /> {member.profile.recovery_taken}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Expanded Member Detail */}
          {selectedMember && group.members.some((m) => m.user_id === selectedMember.user_id) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 p-4 rounded-xl bg-secondary/30 border border-border"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-display font-semibold text-foreground">{selectedMember.profile.display_name}'s Avatar</h4>
              </div>
              <div className="flex justify-center mb-3">
                <div className="scale-75">
                  <WellbeingAvatar
                    mood={selectedMember.profile.avatar_mood as AvatarMood}
                    xp={selectedMember.profile.xp}
                    level={selectedMember.profile.level}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-background">
                  <Zap size={14} className="mx-auto text-accent mb-1" />
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p className="text-sm font-bold text-foreground">{selectedMember.profile.balance_score}%</p>
                </div>
                <div className="p-2 rounded-lg bg-background">
                  <Check size={14} className="mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">Tasks</p>
                  <p className="text-sm font-bold text-foreground">{selectedMember.profile.tasks_completed}</p>
                </div>
                <div className="p-2 rounded-lg bg-background">
                  <Heart size={14} className="mx-auto text-recovery mb-1" />
                  <p className="text-xs text-muted-foreground">Recovery</p>
                  <p className="text-sm font-bold text-foreground">{selectedMember.profile.recovery_taken}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
