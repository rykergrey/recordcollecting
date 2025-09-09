import React, { useState } from 'react';
import type { Comment } from '../types';

interface CommentsProps {
  comments: Comment[];
  onAddComment: (text: string) => void;
}

const Comments: React.FC<CommentsProps> = ({ comments, onAddComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    return (
        <div>
            <form onSubmit={handleSubmit} className="mb-6">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    placeholder="Add a new comment or note..."
                />
                <button type="submit" className="mt-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg transition float-right">
                    Add Comment
                </button>
            </form>

            <div className="space-y-4 clear-both">
                {comments.length > 0 ? (
                    [...comments].reverse().map((comment) => (
                        <div key={comment.timestamp} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                            <p className="text-gray-200">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-2 text-right">{formatTimestamp(comment.timestamp)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No comments yet.</p>
                )}
            </div>
        </div>
    );
};

export default Comments;
