import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, Send } from 'lucide-react';
import { CommentItem } from '../../types/video';
import { loadComments, addComment } from '../../utils/storage';
import { soundEngine } from '../../utils/audioSynth';

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  commentCount: number;
  onCommentAdded?: () => void;
}

const QUICK_EMOJIS = ['🔥', '❤️', '👏', '😂', '🙌', '💯', '✨', '⚡'];

export const CommentsSheet: React.FC<CommentsSheetProps> = ({
  isOpen,
  onClose,
  videoId,
  commentCount,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const items = loadComments(videoId);
      setComments(items);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, videoId]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    soundEngine.playTone(520, 'sine', 0.1, 0.15);
    const newComment = addComment(videoId, trimmed);
    setComments((prev) => [newComment, ...prev]);
    setInputText('');
    if (onCommentAdded) {
      onCommentAdded();
    }
  };

  const handleToggleLike = (commentId: string) => {
    soundEngine.playLikeSound();
    setLikedCommentIds((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isCurrentlyLiked = likedCommentIds.has(commentId);
          return {
            ...c,
            likes: isCurrentlyLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
            isLiked: !isCurrentlyLiked,
          };
        }
        return c;
      })
    );
  };

  const handleAddEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg mx-auto bg-neutral-900 border-t border-neutral-800 rounded-t-3xl h-[65vh] max-h-[560px] flex flex-col shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto mt-2.5 mb-1 cursor-grab" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-800/80">
          <div className="w-6" />
          <h3 className="text-sm font-bold text-neutral-100">
            {commentCount + comments.length} Comments
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close comments"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comment List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-center">
              <p className="text-sm font-medium">No comments yet</p>
              <p className="text-xs text-neutral-500 mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((comment) => {
              const isLiked = likedCommentIds.has(comment.id) || comment.isLiked;
              return (
                <div key={comment.id} className="flex items-start gap-3">
                  <img
                    src={comment.creator.avatarUrl}
                    alt={comment.creator.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-700 bg-neutral-800"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=' + comment.creator.username;
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-300">
                        {comment.creator.name}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        · {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-100 mt-0.5 leading-relaxed break-words">
                      {comment.text}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-neutral-400">
                      <button
                        onClick={() => handleAddEmoji(`@${comment.creator.username} `)}
                        className="hover:text-neutral-200 transition-colors font-medium"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  {/* Like button on comment */}
                  <div className="flex flex-col items-center shrink-0 pt-1">
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500 transition-colors active:scale-125"
                      aria-label="Like comment"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isLiked ? 'text-rose-500 fill-rose-500' : ''
                        }`}
                      />
                    </button>
                    <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                      {comment.likes}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Quick Emoji Bar */}
        <div className="px-4 py-2 flex items-center justify-between border-t border-neutral-800 bg-neutral-900/90 overflow-x-auto no-scrollbar gap-2">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleAddEmoji(emoji)}
              className="text-lg hover:scale-125 transition-transform p-1 active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-800 bg-neutral-900 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add a thoughtful comment..."
            className="flex-1 bg-neutral-800 text-neutral-100 text-xs px-3.5 py-2.5 rounded-full placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            maxLength={300}
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              inputText.trim()
                ? 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
            aria-label="Send comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
