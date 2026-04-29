// Authors:
// Aurelia Bouliane - 261118164
// Hooman Azari - 261055604

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, MapPin, Mail, Trash2, Link, Eye, EyeOff, Users, Pencil, Vote } from "lucide-react";
import Btn from "../../components/Btn";
import Avatar from "../../components/Avatar";

const ICON_SIZE = 13;

// -- SlotCard
// Props:
//   slot             — slot object
//   delay            — animation delay in seconds
//   onToggle         — toggle active/private
//   onDelete         — initiate delete
//   confirmingDelete — boolean
//   onConfirmDelete  — confirm delete
//   onCancelDelete   — cancel delete
//   onCopyLink       — copy invite link
//   copied           — boolean, true briefly after copy
//   onFinalize       — open finalize modal (group slots only)
export default function SlotCard({ slot, delay, onToggle, onDelete, confirmingDelete, onConfirmDelete, onCancelDelete, onCopyLink, copied, onFinalize, onEditPollOptions }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  const [expandedVotes, setExpandedVotes] = useState(false);
  const [expandedInvitees, setExpandedInvitees] = useState(false);
  const [expandedBookings, setExpandedBookings] = useState(false);
  const isActive = slot.status === "active";
  const isGroup  = slot.type === "group";
  const invitees = Array.isArray(slot.group_invite_emails) ? slot.group_invite_emails : [];

  return (
    <div
      className="mc-fade"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hov ? "rgba(232,25,44,0.35)" : "var(--border)"}`,
        borderRadius: 10, padding: "16px 18px", marginBottom: 12,
        boxShadow: hov ? "0 0 0 3px rgba(232,25,44,0.08),var(--shadow-sm)" : "var(--shadow-sm)",
        transition: "border-color 0.15s,box-shadow 0.15s",
        animationDelay: `${delay}s`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span style={{
              padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600,
              background: isActive ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.15)",
              color: isActive ? "#10b981" : "var(--text3)",
            }}>
              {isActive ? "Active" : "Private"}
            </span>
            {isGroup && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                Group Meeting
              </span>
            )}
            {!!slot.is_recurring &&
              slot.recurrence_weeks > 0 &&
              !(isGroup && slot.finalized) && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                Recurring · {slot.recurrence_weeks}w
              </span>
            )}
            {isGroup && !!slot.finalized && (
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 600, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                Finalized
              </span>
            )}
          </div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em", marginBottom: 10 }}>
            {slot.title}
          </div>
          
          {/* Meta - Date, Time, Location */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 16px", fontSize: 12.5, color: "var(--text2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Calendar size={ICON_SIZE} /> {slot.date}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={ICON_SIZE} /> {slot.time}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={ICON_SIZE} /> {slot.location}</span>
          </div>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, minWidth: 160 }}>
          <div style={{ width: "100%", fontSize: 12.5, fontWeight: 700, color: "var(--text2)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", textAlign: "center" }}>
            {isGroup ? `${slot.totalVoters || 0} ${slot.totalVoters === 1 ? 'voter' : 'voters'}` : `${slot.bookings?.length || 0} booked`}
          </div>
          {isGroup && !slot.finalized && (
            <Btn 
              variant="outline" 
              onClick={() => navigate(`/vote/${slot.invite_token}`)}
              style={{ width: "100%", fontSize: 11.5, padding: "6px 10px", color: "#10b981", borderColor: "rgba(16,185,129,0.3)", justifyContent: "center", gap: 6 }}
            >
              <Vote size={13} /> Vote on this poll
            </Btn>
          )}
        </div>
      </div>

      {/* Group vote counts */}
      {isGroup && slot.group_slots && !slot.finalized && (
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <button
            onClick={() => setExpandedVotes(e => !e)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
          >
            {expandedVotes ? "▾" : "▸"} {expandedVotes ? "Hide" : "Show"} vote counts ({slot.group_slots.length} slots)
          </button>
          {expandedVotes && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {slot.group_slots.map(gs => (
                <div key={gs.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                  <div style={{ fontSize: 13, color: "var(--text)" }}>
                    <span style={{ fontWeight: 600 }}>{gs.date}</span>
                    <span style={{ color: "var(--text3)", margin: "0 6px" }}>·</span>
                    {gs.time}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#3b82f6" }}>{gs.votes} votes</span>
                    <div style={{ width: 60, height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#3b82f6", borderRadius: 3, width: `${Math.min(100, (gs.votes / 6) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Group invitees list */}
      {isGroup && invitees.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setExpandedInvitees((e) => !e)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--text3)",
              fontFamily: "inherit",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {expandedInvitees ? "▾" : "▸"} {expandedInvitees ? "Hide" : "Show"} invited ({invitees.length})
          </button>
          {expandedInvitees && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {invitees.map((email) => {
                const name = String(email || "").split("@")[0].replace(".", " ");
                return (
                  <div
                    key={email}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 7,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar email={email} name={name} size={26} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                          {name || "Invitee"}
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{email}</div>
                      </div>
                    </div>
                    <a
                      href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${slot.title}`)}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        color: "var(--text2)",
                        textDecoration: "none",
                        padding: "4px 9px",
                        border: "1px solid var(--border)",
                        borderRadius: 6,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--text)";
                        e.currentTarget.style.borderColor = "var(--text3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text2)";
                        e.currentTarget.style.borderColor = "var(--border)";
                      }}
                    >
                      <Mail size={ICON_SIZE} /> Email
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Regular bookings list */}
      {!isGroup && slot.bookings.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setExpandedBookings(e => !e)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "var(--text3)", fontFamily: "inherit", padding: 0, display: "flex", alignItems: "center", gap: 4 }}
          >
            {expandedBookings ? "▾" : "▸"} {expandedBookings ? "Hide" : "Show"} bookers ({slot.bookings.length})
          </button>
          {expandedBookings && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {slot.bookings.map(b => (
                <div key={b.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 7 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar name={b.user} size={26} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.user}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text3)" }}>{b.email}</div>
                    </div>
                  </div>
                  <a
                    href={`mailto:${b.email}?subject=Re: ${encodeURIComponent(slot.title)}`}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--text2)", textDecoration: "none", padding: "4px 9px", border: "1px solid var(--border)", borderRadius: 6, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.borderColor = "var(--text3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "var(--text2)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    <Mail size={ICON_SIZE} /> Email
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Btn variant="outline" onClick={onToggle}>
            {isActive ? <EyeOff size={ICON_SIZE} /> : <Eye size={ICON_SIZE} />}
            {isActive ? "Make private" : "Activate"}
          </Btn>
          {isGroup && (
            <Btn variant="outline" onClick={onCopyLink}>
              <Link size={ICON_SIZE} /> {copied ? "Copied!" : "Copy invite link"}
            </Btn>
          )}
          {isGroup && !slot.finalized && onEditPollOptions && (
            <Btn variant="outline" onClick={onEditPollOptions} style={{ color: "var(--text2)", borderColor: "var(--border)" }}>
              <Pencil size={ICON_SIZE} /> Edit poll times
            </Btn>
          )}
          {isGroup && !slot.finalized && (
            <Btn variant="outline" onClick={onFinalize} style={{ color: "#3b82f6", borderColor: "rgba(59,130,246,0.3)" }}>
              <Users size={ICON_SIZE} /> Finalize time
            </Btn>
          )}
        </div>
        {confirmingDelete ? (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--text3)" }}>Delete this slot?</span>
            <Btn variant="red"     onClick={onConfirmDelete} style={{ padding: "4px 10px" }}>Yes</Btn>
            <Btn variant="outline" onClick={onCancelDelete}  style={{ padding: "4px 10px" }}>No</Btn>
          </div>
        ) : (
          <Btn variant="danger" onClick={onDelete}><Trash2 size={ICON_SIZE} /> Delete</Btn>
        )}
      </div>
    </div>
  );
}