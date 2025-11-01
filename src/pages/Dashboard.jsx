import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreator } from "../contexts/CreatorContext";
import CreatorCard from "../components/creators/CreatorCard";
import CreatorForm from "../components/creators/CreatorForm";
import Button from "../components/ui/Button";
import {
  Plus,
  Search,
  Filter,
  Users,
  ArrowUp,
  ArrowDown,
  Clock,
  Edit3,
  Trash2,
  X,
  User,
  Shield,
  LogOut,
  BarChart3,
  LogIn,
} from "lucide-react";

const Dashboard = () => {
  const {
    creators = [],
    loading,
    logout,
    currentUser,
    addCreator,
    updateCreator,
    deleteCreator,
    canDeleteCreator,
  } = useCreator();
  const [showForm, setShowForm] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const filteredCreators = (creators || []).filter(
    (creator) =>
      creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator?.specialties?.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const myCreators = currentUser
    ? creators.filter((creator) => creator.createdBy === currentUser.id)
    : [];

  const getSortedCreators = () => {
    let sorted = [...filteredCreators];

    switch (sortOrder) {
      case "asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "recentlyAdded":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "recentlyUpdated":
        return sorted.sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        );
      case "priceHigh":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "priceLow":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      default:
        return sorted;
    }
  };

  const sortedCreators = getSortedCreators();

  const handleSubmit = async (formData, images) => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    setFormLoading(true);
    try {
      if (editingCreator) {
        await updateCreator(editingCreator.id, formData, images);
        setRecentActivity((prev) => [
          {
            type: "updated",
            creatorName: formData.name,
            timestamp: new Date(),
            id: editingCreator.id,
          },
          ...prev.slice(0, 9),
        ]);
      } else {
        const newCreatorId = await addCreator(formData, images);
        setRecentActivity((prev) => [
          {
            type: "added",
            creatorName: formData.name,
            timestamp: new Date(),
            id: newCreatorId,
          },
          ...prev.slice(0, 9),
        ]);
      }
      setShowForm(false);
      setEditingCreator(null);
    } catch (error) {
      console.error("Error saving creator:", error);
      alert(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (creator) => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }
    setEditingCreator(creator);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      return;
    }

    const creatorToDelete = creators.find((c) => c.id === id);

    // Check if user has permission to delete
    if (!canDeleteCreator(id)) {
      alert("You can only delete creators that you created.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete "${creatorToDelete?.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteCreator(id);
        setRecentActivity((prev) => [
          {
            type: "deleted",
            creatorName: creatorToDelete?.name,
            timestamp: new Date(),
            id: id,
          },
          ...prev.slice(0, 9),
        ]);
      } catch (error) {
        console.error("Error deleting creator:", error);
        alert(error.message);
      }
    }
  };

  const handleView = (id) => {
    // Navigate to creator detail page
    console.log("View creator:", id);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCreator(null);
  };

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handleClearSort = () => {
    setSortOrder(null);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await logout();
      } catch (error) {
        console.error("Logout error:", error);
        alert("Logout failed. Please try again.");
      }
    }
  };

  const handleLoginRedirect = () => {
    window.location.href = "/login";
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Calculate statistics
  const totalPrice = creators.reduce(
    (sum, creator) => sum + (creator.price || 0),
    0
  );
  const averagePrice = creators.length > 0 ? totalPrice / creators.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Login Required
                </h3>
                <p className="text-gray-600 mb-6">
                  You need to be logged in to perform this action. Please sign
                  in to continue.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowLoginPrompt(false)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleLoginRedirect} className="flex-1">
                    <LogIn size={16} />
                    Go to Login
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Activity Panel */}
      <AnimatePresence>
        {showRecentActivity && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl border-l border-gray-200 z-40"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <button
                  onClick={() => setShowRecentActivity(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-[calc(100vh-80px)] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                recentActivity.map((activity, index) => (
                  <motion.div
                    key={`${activity.id}-${activity.timestamp}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      activity.type === "added"
                        ? "bg-green-50 border-green-200"
                        : activity.type === "updated"
                        ? "bg-blue-50 border-blue-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          activity.type === "added"
                            ? "bg-green-100 text-green-600"
                            : activity.type === "updated"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {activity.type === "added" && (
                          <Plus className="w-4 h-4" />
                        )}
                        {activity.type === "updated" && (
                          <Edit3 className="w-4 h-4" />
                        )}
                        {activity.type === "deleted" && (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.creatorName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs font-medium ${
                              activity.type === "added"
                                ? "text-green-700"
                                : activity.type === "updated"
                                ? "text-blue-700"
                                : "text-red-700"
                            }`}
                          >
                            {activity.type === "added"
                              ? "Added"
                              : activity.type === "updated"
                              ? "Updated"
                              : "Deleted"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Creator Portal
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentUser
                    ? "Manage your creator profiles"
                    : "Browse all creators"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Recent Activity Button */}
              {currentUser && (
                <button
                  onClick={() => setShowRecentActivity(true)}
                  className="relative p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                  title="View Recent Activity"
                >
                  <Clock className="w-5 h-5 text-gray-600" />
                  {recentActivity.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {recentActivity.length}
                    </span>
                  )}
                </button>
              )}

              {/* User Info or Login Button */}
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      {myCreators.length} creators
                    </span>
                  </div>

                  <Button
                    onClick={handleLogout}
                    variant="secondary"
                    className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLoginRedirect}
                  className="shadow-lg hover:shadow-xl"
                >
                  <LogIn size={16} />
                  Login
                </Button>
              )}

              {/* Add Creator Button */}
              <Button
                onClick={() =>
                  currentUser ? setShowForm(true) : setShowLoginPrompt(true)
                }
                className="shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                Add Creator
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search creators by name, designation, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        {/* Controls Section */}
        <div className="flex items-center justify-between mt-4">
          {/* Left side - Stats */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    My Creators: {myCreators.length}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Total in system: {creators.length}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800">
                  Viewing all {creators.length} creators
                </span>
              </div>
            )}
          </div>

          {/* Right side - Recent activity and sort controls */}
          <div className="flex items-center gap-4">
            {/* Recent Activity Indicators - Only for logged in users */}
            {currentUser && (
              <div className="flex items-center gap-3">
                {/* Recently Added */}
                {recentActivity.find(
                  (activity) => activity.type === "added"
                ) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Plus className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Added:{" "}
                      {
                        recentActivity.find(
                          (activity) => activity.type === "added"
                        )?.creatorName
                      }
                    </span>
                    <span className="text-xs text-green-600">
                      {formatTimeAgo(
                        recentActivity.find(
                          (activity) => activity.type === "added"
                        )?.timestamp
                      )}
                    </span>
                  </div>
                )}

                {/* Recently Updated */}
                {recentActivity.find(
                  (activity) => activity.type === "updated"
                ) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Edit3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-800">
                      Updated:{" "}
                      {
                        recentActivity.find(
                          (activity) => activity.type === "updated"
                        )?.creatorName
                      }
                    </span>
                    <span className="text-xs text-blue-600">
                      {formatTimeAgo(
                        recentActivity.find(
                          (activity) => activity.type === "updated"
                        )?.timestamp
                      )}
                    </span>
                  </div>
                )}

                {/* Recently Deleted */}
                {recentActivity.find(
                  (activity) => activity.type === "deleted"
                ) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      Deleted:{" "}
                      {
                        recentActivity.find(
                          (activity) => activity.type === "deleted"
                        )?.creatorName
                      }
                    </span>
                    <span className="text-xs text-red-600">
                      {formatTimeAgo(
                        recentActivity.find(
                          (activity) => activity.type === "deleted"
                        )?.timestamp
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Sort Controls - Available for everyone */}
            <div className="flex items-center gap-2 border-l border-gray-300 pl-4">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Sort:
              </span>

              {/* Alphabetical Sort */}
              <button
                onClick={() => handleSort("asc")}
                className={`p-2 rounded-md transition-all flex items-center gap-1 ${
                  sortOrder === "asc"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                title="Sort A → Z"
              >
                <ArrowUp className="w-4 h-4" />
                <span className="text-xs">A-Z</span>
              </button>

              <button
                onClick={() => handleSort("desc")}
                className={`p-2 rounded-md transition-all flex items-center gap-1 ${
                  sortOrder === "desc"
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                title="Sort Z → A"
              >
                <ArrowDown className="w-4 h-4" />
                <span className="text-xs">Z-A</span>
              </button>

              {/* Recently Added Sort */}
              <button
                onClick={() => handleSort("recentlyAdded")}
                className={`p-2 rounded-md transition-all flex items-center gap-1 ${
                  sortOrder === "recentlyAdded"
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                title="Recently Added"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs">New</span>
              </button>

              {/* Price Sort */}
              <button
                onClick={() => handleSort("priceHigh")}
                className={`p-2 rounded-md transition-all flex items-center gap-1 ${
                  sortOrder === "priceHigh"
                    ? "bg-orange-600 text-white shadow-md"
                    : "bg-white border border-gray-200 hover:bg-gray-50"
                }`}
                title="Price: High to Low"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs">Price ↑</span>
              </button>

              {/* Clear Sort */}
              {sortOrder && (
                <button
                  onClick={handleClearSort}
                  className="p-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-1"
                  title="Clear Sort"
                >
                  <X className="w-4 h-4" />
                  <span className="text-xs">Clear</span>
                </button>
              )}

              {/* Sort Status Indicator */}
              <div className="text-sm text-gray-600 ml-2 min-w-[120px]">
                {sortOrder === "asc" && "A → Z"}
                {sortOrder === "desc" && "Z → A"}
                {sortOrder === "recentlyAdded" && "Recently Added"}
                {sortOrder === "priceHigh" && "Price: High to Low"}
                {!sortOrder && "Default"}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || sortOrder) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Filter className="w-4 h-4" />
              <span>Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 px-2 py-1 rounded-md">
                  Search: "{searchTerm}"
                </span>
              )}
              {sortOrder && (
                <span className="bg-blue-100 px-2 py-1 rounded-md">
                  {sortOrder === "asc" && "Sort: A → Z"}
                  {sortOrder === "desc" && "Sort: Z → A"}
                  {sortOrder === "recentlyAdded" && "Sort: Recently Added"}
                  {sortOrder === "priceHigh" && "Sort: Price High to Low"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <AnimatePresence mode="wait">
          {showForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCreator ? "Edit Creator" : "Add New Creator"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {editingCreator
                    ? "Update the creator information"
                    : "Fill in the details to add a new creator"}
                </p>
              </div>
              <CreatorForm
                onSubmit={handleSubmit}
                loading={formLoading}
                initialData={editingCreator}
                onCancel={handleCancel}
              />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Creators
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {creators.length}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {currentUser ? "My Creators" : "Active Creators"}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {currentUser ? myCreators.length : creators.length}
                      </p>
                      {currentUser && (
                        <p className="text-xs text-gray-500 mt-1">
                          {myCreators.length > 0
                            ? `${(
                                (myCreators.length / creators.length) *
                                100
                              ).toFixed(1)}% of total`
                            : "No creators yet"}
                        </p>
                      )}
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg. Price
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        ${averagePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {creators.length > 0 ? "Per hour" : "No data"}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Platform Status
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {currentUser ? "Active" : "Public"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUser ? "Logged in" : "Viewing publicly"}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading creators...</p>
                </div>
              ) : sortedCreators.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    👨‍💼
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? "No creators found" : "No creators yet"}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {searchTerm
                      ? "Try adjusting your search terms to find what you're looking for."
                      : "Get started by adding your first creator to the portal."}
                  </p>
                  {!searchTerm && (
                    <Button
                      onClick={() =>
                        currentUser
                          ? setShowForm(true)
                          : setShowLoginPrompt(true)
                      }
                    >
                      <Plus size={20} />
                      {currentUser
                        ? "Add Your First Creator"
                        : "Login to Add Creator"}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCreators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
                      canDelete={
                        currentUser ? canDeleteCreator(creator.id) : false
                      }
                      isOwner={
                        currentUser
                          ? creator.createdBy === currentUser.id
                          : false
                      }
                      isLoggedIn={!!currentUser}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
