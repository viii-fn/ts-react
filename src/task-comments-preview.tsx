"use client"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Send,
  CornerDownRight,
  X,
  Check,
  Link as LinkIcon,
  ExternalLink
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface CommentUser {
  id: string
  full_name: string
  avatar_url: string | null
}

interface Comment {
  id: string
  text: string
  parent_id: string | null
  attachment_urls: string[]
  link_url: string | null
  edited_at: string | null
  deleted_at: string | null
  created_at: string
  user: CommentUser
}

// Mock current user
const currentUserId = "user-1"
const canModerate = true

// Mock comments — adjust as needed for testing different states
const mockComments: Comment[] = [
  {
    id: "c1",
    text: "Hey, can we get a design review on this before merging?",
    parent_id: null,
    attachment_urls: [],
    link_url: "https://figma.com/file/example-design",
    edited_at: null,
    deleted_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    user: { id: "user-2", full_name: "Jane Doe", avatar_url: null },
  },
  {
    id: "c2",
    text: "Sure, I'll take a look this afternoon.",
    parent_id: "c1",
    attachment_urls: [],
    link_url: null,
    edited_at: null,
    deleted_at: null,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user: { id: "user-1", full_name: "You", avatar_url: null },
  },
  {
    id: "c3",
    text: "This comment was removed.",
    parent_id: null,
    attachment_urls: [],
    link_url: null,
    edited_at: null,
    deleted_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    user: { id: "user-3", full_name: "Sam Lee", avatar_url: null },
  },
]

export function TaskCommentsPreview() {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [newComment, setNewComment] = useState("")
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<string[]>(["Jane Doe"]) // hardcode to preview typing UI

  const handleSend = () => {
    if (!newComment.trim()) return
    const newC: Comment = {
      id: `c${Date.now()}`,
      text: newComment.trim(),
      parent_id: replyTo?.id || null,
      attachment_urls: [],
      link_url: linkUrl.trim() || null,
      edited_at: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
      user: { id: currentUserId, full_name: "You", avatar_url: null },
    }
    setComments(prev => [...prev, newC])
    setNewComment("")
    setLinkUrl("")
    setShowLinkInput(false)
    setReplyTo(null)
  }

  const handleEdit = (commentId: string) => {
    if (!editText.trim()) return
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, text: editText.trim(), edited_at: new Date().toISOString() } : c
      )
    )
    setEditingId(null)
    setEditText("")
  }

  const handleDelete = (commentId: string) => {
    setComments(prev =>
      prev.map(c => (c.id === commentId ? { ...c, deleted_at: new Date().toISOString() } : c))
    )
  }

  // Build threaded structure: top-level + replies map
  const topLevel = comments.filter(c => !c.parent_id)
  const repliesMap = comments.reduce<Record<string, Comment[]>>((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = [...(acc[c.parent_id] || []), c]
    }
    return acc
  }, {})

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = comment.user.id === currentUserId
    const canDelete = isOwner || canModerate
    const isDeleted = !!comment.deleted_at
    const isEditing = editingId === comment.id

    return (
      <div key={comment.id} className={`flex gap-3 group ${isReply ? "ml-8 mt-2" : ""}`}>
        {isReply && <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground/40 mt-2 shrink-0" />}
        <Avatar className="h-7 w-7 shrink-0 mt-0.5">
          <AvatarImage src={comment.user.avatar_url || undefined} />
          <AvatarFallback className="text-[8px] font-bold">
            {comment.user.full_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold">{comment.user.full_name}</span>
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
            {comment.edited_at && (
              <span className="text-[10px] text-muted-foreground italic">(edited)</span>
            )}
          </div>
          {isDeleted ? (
            <p className="text-xs text-muted-foreground italic mt-1">This comment was deleted.</p>
          ) : isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="min-h-[60px] text-xs bg-muted/20"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => handleEdit(comment.id)}>
                  <Check className="h-3 w-3" /> Save
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm mt-0.5 text-foreground/80 whitespace-pre-wrap break-words">
                {comment.text}
              </p>
              {comment.link_url && (
                
                  href={comment.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-md border border-primary/10 hover:bg-primary/10 transition-colors max-w-full truncate"
                >
                  <LinkIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{comment.link_url}</span>
                  <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
                </a>
              )}
            </>
          )}
          {!isDeleted && !isEditing && (
            <div className="flex items-center gap-3 mt-1.5">
              {!isReply && (
                <button
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
                  onClick={() => setReplyTo(comment)}
                >
                  Reply
                </button>
              )}
              {isOwner && (
                <button
                  className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider opacity-0 group-hover:opacity-100"
                  onClick={() => { setEditingId(comment.id); setEditText(comment.text) }}
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-wider opacity-0 group-hover:opacity-100"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
          )}
          {/* Replies */}
          {repliesMap[comment.id]?.map(reply => renderComment(reply, true))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-md mx-auto p-6">
      <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5" /> Comments
        <span className="ml-auto text-[9px] font-bold bg-primary/5 text-primary px-2 py-0.5 rounded-full">
          {comments.filter(c => !c.deleted_at).length}
        </span>
      </h4>

      {/* Comment list */}
      <div className="space-y-5 max-h-[320px] overflow-y-auto pr-1">
        {topLevel.length === 0 ? (
          <div className="text-center py-10 border border-dashed rounded-xl opacity-50">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">Be the first to start the discussion</p>
          </div>
        ) : (
          topLevel.map(c => renderComment(c))
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <p className="text-[10px] text-muted-foreground italic animate-pulse">
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </p>
      )}

      {/* Reply context banner */}
      {replyTo && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-xs">
          <span className="text-muted-foreground">
            Replying to <span className="font-bold text-foreground">{replyTo.user.full_name}</span>
          </span>
          <button onClick={() => setReplyTo(null)}>
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}

      {/* Link input */}
      {showLinkInput && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://..."
            className="h-8 text-xs bg-muted/20 border-primary/10"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            autoFocus
          />
          <button onClick={() => { setShowLinkInput(false); setLinkUrl("") }}>
            <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-[10px] text-destructive font-bold">{error}</p>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          placeholder={replyTo ? `Reply to ${replyTo.user.full_name}...` : "Add a comment... Use @ to mention someone"}
          className="min-h-[72px] text-xs bg-muted/20 border-primary/10 focus-visible:ring-primary/20 resize-none"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend()
          }}
        />
        <div className="flex flex-col gap-1.5 shrink-0">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={`h-8 w-9 ${showLinkInput || linkUrl ? "border-primary/40 text-primary" : ""}`}
            onClick={() => setShowLinkInput(s => !s)}
            title="Attach a link"
          >
            <LinkIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9"
            disabled={!newComment.trim()}
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-right -mt-2">⌘ + Enter to send</p>
    </div>
  )
}