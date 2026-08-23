"use client";

import React, { useState } from "react";
import { Users, Plus, X, Loader2, ChevronRight, UserPlus } from "lucide-react";
import { ConversationType } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { formatUsername } from "@/utils/username";

interface GroupManagerProps {
  groups: ConversationType[];
  onSelectGroup: (id: string) => void;
  onCreateGroup: (data: {
    name: string;
    description?: string;
    avatar?: string;
    memberUsernames: string[];
  }) => Promise<boolean>;
}

export function GroupManager({ groups, onSelectGroup, onCreateGroup }: GroupManagerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberInput, setMemberInput] = useState("");
  const [memberUsernames, setMemberUsernames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddMember = () => {
    if (!memberInput.trim()) return;
    let clean = memberInput.trim().replace(/^@/, "").toLowerCase();
    if (!memberUsernames.includes(clean)) {
      setMemberUsernames([...memberUsernames, clean]);
    }
    setMemberInput("");
  };

  const handleRemoveMember = (u: string) => {
    setMemberUsernames(memberUsernames.filter((m) => m !== u));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const ok = await onCreateGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        memberUsernames,
      });

      if (ok) {
        setName("");
        setDescription("");
        setMemberUsernames([]);
        setShowCreateModal(false);
      } else {
        setError("Failed to create group. Please check usernames.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#161618] flex flex-col h-full select-none">
      {/* iOS Header */}
      <div className="px-4 pt-3 pb-2 bg-white/90 dark:bg-[#161618]/90 ios-blur border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
        <h1 className="text-[34px] font-bold tracking-tight text-black dark:text-white font-ios leading-none pt-1">
          Groups
        </h1>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="text-[#007AFF] dark:text-[#0A84FF] hover:opacity-75 transition-opacity"
          title="New Group"
        >
          <Plus className="w-6 h-6 stroke-[2.2]" />
        </button>
      </div>

      {/* Groups List Table View */}
      <div className="flex-1 overflow-y-auto">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-[#8E8E93]">
            <div className="w-14 h-14 rounded-[16px] bg-[#767680]/15 flex items-center justify-center text-[#007AFF] mb-3">
              <Users className="w-7 h-7" />
            </div>
            <p className="text-[17px] font-semibold text-black dark:text-white font-ios">
              No Groups Joined
            </p>
            <p className="text-[13px] text-[#8E8E93] mt-1 max-w-xs">
              Create a group to chat, share media, and coordinate with multiple users.
            </p>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="relative group hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <button
                type="button"
                onClick={() => onSelectGroup(group.id)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar
                    src={group.avatar}
                    name={group.name || "Group"}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[16px] text-black dark:text-white truncate font-ios">
                        {group.name}
                      </span>
                      <span className="text-[11px] font-medium text-[#8E8E93] bg-[#767680]/15 px-2 py-0.5 rounded-full flex-shrink-0">
                        {group.members.length} members
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-[13px] text-[#8E8E93] truncate mt-0.5">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#C7C7CC] flex-shrink-0" />
              </button>
              <div className="ios-separator ml-[76px]" />
            </div>
          ))
        )}
      </div>

      {/* Create Group iOS Sheet Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 animate-fade-in select-none">
          <div className="bg-[#F2F2F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-[24px] w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[17px] font-bold text-black dark:text-white font-ios">
                New Group
              </span>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-full bg-[#767680]/15 text-[#8E8E93] hover:text-black dark:hover:text-white flex items-center justify-center text-[12px]"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-[12px] text-[13px] font-semibold text-[#FF3B30]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-white dark:bg-[#2C2C2E] rounded-[16px] p-3.5 space-y-3 shadow-xs">
                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1 font-ios">
                    Group Subject *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Design Studio 🎨"
                    required
                    className="w-full px-3 py-2 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[10px] text-[15px] text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-black dark:text-white mb-1 font-ios">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Group description"
                    className="w-full px-3 py-2 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[10px] text-[15px] text-black dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-[#2C2C2E] rounded-[16px] p-3.5 space-y-2 shadow-xs">
                <label className="block text-[13px] font-semibold text-black dark:text-white font-ios">
                  Add Participants (@username)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                    placeholder="e.g. @sara_dev"
                    className="flex-1 px-3 py-2 bg-[#F2F2F7] dark:bg-[#1C1C1E] rounded-[10px] text-[15px] text-black dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3.5 py-2 bg-[#007AFF] text-white text-[13px] font-semibold rounded-[10px] active:scale-95 transition-all"
                  >
                    Add
                  </button>
                </div>

                {memberUsernames.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {memberUsernames.map((u) => (
                      <span
                        key={u}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00A884]/15 text-[#00A884] dark:text-[#34D399] text-[12px] font-semibold"
                      >
                        <span>{formatUsername(u)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(u)}
                          className="hover:text-red-500 font-bold ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-[15px] font-medium text-[#8E8E93] hover:text-black dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#007AFF] hover:bg-[#0062CC] text-white text-[15px] font-semibold rounded-[12px] shadow-xs active:scale-95 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

