// src/components/creators/CreatorCard.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Edit3,
  Trash2,
  Star,
  ExternalLink,
  User,
  Lock,
  Eye,
} from "lucide-react";

const CreatorCard = ({
  creator,
  onEdit,
  onDelete,
  onView,
  canDelete,
  isOwner,
  isLoggedIn,
}) => {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Ownership Badge */}
      {isOwner && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <User className="w-3 h-3" />
            <span>My Creator</span>
          </div>
        </div>
      )}

      {/* Public View Indicator */}
      {!isLoggedIn && (
        <div className="absolute top-3 right-3 z-10">
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            <Eye className="w-3 h-3" />
            <span>Public</span>
          </div>
        </div>
      )}

      <div className="relative h-32">
        <img
          src={
            "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
          }
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute -bottom-6 left-4">
          <img
            src={
              "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
            }
            alt={creator.name}
            className="w-16 h-16 rounded-full border-4 border-white object-cover shadow-lg"
          />
        </div>
      </div>

      <div className="p-4 pt-8">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {creator.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-4 h-4" fill="currentColor" />
            <span>{creator.rating || "4.5"}</span>
          </div>
        </div>

        <p className="text-sm text-purple-600 font-medium mb-2">
          {creator.designation}
        </p>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {creator.about}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {creator.specialties?.slice(0, 3).map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
          {creator.specialties?.length > 3 && (
            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
              +{creator.specialties.length - 3}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-gray-900">
            ${creator.price}/
            <span className="text-sm font-normal text-gray-500">hr</span>
          </div>
          <div className="flex gap-1">
            {/* <button
              onClick={() => onView(creator.id)}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              title="View Profile"
            >
              <ExternalLink size={16} />
            </button> */}

            {/* Edit Button - Only for logged in users */}
            {isLoggedIn ? (
              <button
                onClick={() => onEdit(creator)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                title="Edit"
              >
                <Edit3 size={16} />
              </button>
            ) : (
              <button
                onClick={() => onEdit(creator)}
                className="p-2 text-gray-300 cursor-not-allowed rounded-lg transition-colors duration-200"
                title="Login to edit"
              >
                <Edit3 size={16} />
              </button>
            )}

            {/* Delete Button - Only for owners */}
            {isLoggedIn ? (
              <button
                onClick={() => onDelete(creator.id)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  canDelete
                    ? "text-gray-400 hover:text-red-600 hover:bg-red-50"
                    : "text-gray-300 cursor-not-allowed"
                }`}
                title={
                  canDelete ? "Delete" : "You can only delete your own creators"
                }
                disabled={!canDelete}
              >
                {canDelete ? <Trash2 size={16} /> : <Lock size={16} />}
              </button>
            ) : (
              <button
                onClick={() => onDelete(creator.id)}
                className="p-2 text-gray-300 cursor-not-allowed rounded-lg transition-colors duration-200"
                title="Login to delete"
              >
                <Lock size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Author Info */}
        {creator.authorName && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Created by:{" "}
              <span className="font-medium text-gray-700">
                {creator.authorName}
              </span>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CreatorCard;
