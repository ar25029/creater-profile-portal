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
  Menu,
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
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
                <div className="flex flex-col sm:flex-row gap-3">
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
            className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white shadow-2xl border-l border-gray-200 z-40"
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-80 h-full bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Menu</h3>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {currentUser && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {currentUser.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {myCreators.length} creators
                      </p>
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => {
                    setShowMobileMenu(false);
                    currentUser ? setShowForm(true) : setShowLoginPrompt(true);
                  }}
                  className="w-full"
                >
                  <Plus size={20} />
                  Add Creator
                </Button>
                {currentUser && (
                  <Button
                    onClick={() => {
                      setShowMobileMenu(false);
                      setShowRecentActivity(true);
                    }}
                    variant="secondary"
                    className="w-full"
                  >
                    <Clock size={20} />
                    Recent Activity
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-gray-900">
                  Creator Portal
                </h1>
                <p className="text-gray-600 text-sm lg:text-base mt-1">
                  {currentUser
                    ? "Manage your creator profiles"
                    : "Browse all creators"}
                </p>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
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

            {/* Mobile Add Button */}
            <div className="lg:hidden">
              <Button
                onClick={() =>
                  currentUser ? setShowForm(true) : setShowLoginPrompt(true)
                }
                size="small"
              >
                <Plus size={16} />
                <span className="sr-only">Add Creator</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-2xl mb-4 lg:mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
          <input
            type="text"
            placeholder="Search creators by name, designation, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 lg:pl-10 pr-10 lg:pr-12 py-2 lg:py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm lg:text-base"
          />
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
        </div>

        {/* Controls Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-4">
          {/* Left side - Stats */}
          <div className="flex items-center gap-2 lg:gap-4 overflow-x-auto pb-2 lg:pb-0">
            {currentUser ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    My Creators: {myCreators.length}
                  </span>
                </div>
                <div className="text-sm text-gray-600 whitespace-nowrap">
                  Total: {creators.length}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg whitespace-nowrap">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800">
                  Viewing all {creators.length} creators
                </span>
              </div>
            )}
          </div>

          {/* Right side - Recent activity and sort controls */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Recent Activity Indicators - Only for logged in users */}
            {currentUser && (
              <div className="flex items-center gap-2 lg:gap-3 overflow-x-auto pb-2 lg:pb-0">
                {recentActivity.find(
                  (activity) => activity.type === "added"
                ) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg whitespace-nowrap min-w-0">
                    <Plus className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-green-800 truncate">
                      Added:{" "}
                      {
                        recentActivity.find(
                          (activity) => activity.type === "added"
                        )?.creatorName
                      }
                    </span>
                    <span className="text-xs text-green-600 flex-shrink-0">
                      {formatTimeAgo(
                        recentActivity.find(
                          (activity) => activity.type === "added"
                        )?.timestamp
                      )}
                    </span>
                  </div>
                )}

                {recentActivity.find(
                  (activity) => activity.type === "updated"
                ) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg whitespace-nowrap min-w-0">
                    <Edit3 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-blue-800 truncate">
                      Updated:{" "}
                      {
                        recentActivity.find(
                          (activity) => activity.type === "updated"
                        )?.creatorName
                      }
                    </span>
                    <span className="text-xs text-blue-600 flex-shrink-0">
                      {formatTimeAgo(
                        recentActivity.find(
                          (activity) => activity.type === "updated"
                        )?.timestamp
                      )}
                    </span>
                  </div>
                )}

                {recentActivity.find(
                  (activity) => activity.type === "deleted"
                ) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg whitespace-nowrap min-w-0">
                    <Trash2 className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span className="text-sm text-red-800 truncate">
                      Deleted:{" "}
                      {
                        recentActivity.find(
                          (activity) => activity.type === "deleted"
                        )?.creatorName
                      }
                    </span>
                    <span className="text-xs text-red-600 flex-shrink-0">
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

            {/* Sort Controls */}
            <div className="flex items-center gap-2 lg:border-l lg:border-gray-300 lg:pl-4">
              <span className="text-sm font-medium text-gray-700 mr-2 hidden lg:block">
                Sort:
              </span>

              <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto pb-2 lg:pb-0">
                <button
                  onClick={() => handleSort("asc")}
                  className={`p-2 rounded-md transition-all flex items-center gap-1 flex-shrink-0 ${
                    sortOrder === "asc"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  title="Sort A → Z"
                >
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">A-Z</span>
                </button>

                <button
                  onClick={() => handleSort("desc")}
                  className={`p-2 rounded-md transition-all flex items-center gap-1 flex-shrink-0 ${
                    sortOrder === "desc"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  title="Sort Z → A"
                >
                  <ArrowDown className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Z-A</span>
                </button>

                <button
                  onClick={() => handleSort("recentlyAdded")}
                  className={`p-2 rounded-md transition-all flex items-center gap-1 flex-shrink-0 ${
                    sortOrder === "recentlyAdded"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  title="Recently Added"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">New</span>
                </button>

                <button
                  onClick={() => handleSort("priceHigh")}
                  className={`p-2 rounded-md transition-all flex items-center gap-1 flex-shrink-0 ${
                    sortOrder === "priceHigh"
                      ? "bg-orange-600 text-white shadow-md"
                      : "bg-white border border-gray-200 hover:bg-gray-50"
                  }`}
                  title="Price: High to Low"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-xs hidden sm:inline">Price ↑</span>
                </button>

                {sortOrder && (
                  <button
                    onClick={handleClearSort}
                    className="p-2 rounded-md bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 transition-all flex items-center gap-1 flex-shrink-0"
                    title="Clear Sort"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline">Clear</span>
                  </button>
                )}

                <div className="text-sm text-gray-600 ml-2 min-w-[80px] lg:min-w-[120px] hidden sm:block">
                  {sortOrder === "asc" && "A → Z"}
                  {sortOrder === "desc" && "Z → A"}
                  {sortOrder === "recentlyAdded" && "Recently Added"}
                  {sortOrder === "priceHigh" && "Price: High to Low"}
                  {!sortOrder && "Default"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm || sortOrder) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800 flex-wrap">
              <Filter className="w-4 h-4 flex-shrink-0" />
              <span>Active filters:</span>
              {searchTerm && (
                <span className="bg-blue-100 px-2 py-1 rounded-md text-sm whitespace-nowrap">
                  Search: "{searchTerm}"
                </span>
              )}
              {sortOrder && (
                <span className="bg-blue-100 px-2 py-1 rounded-md text-sm whitespace-nowrap">
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
              className="max-w-4xl mx-auto px-4 sm:px-0"
            >
              <div className="mb-6">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {editingCreator ? "Edit Creator" : "Add New Creator"}
                </h2>
                <p className="text-gray-600 mt-1 text-sm lg:text-base">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Creators
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                        {creators.length}
                      </p>
                    </div>
                    <div className="p-2 lg:p-3 bg-blue-50 rounded-lg">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {currentUser ? "My Creators" : "Active Creators"}
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
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
                    <div className="p-2 lg:p-3 bg-green-50 rounded-lg">
                      <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg. Price
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                        ${averagePrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {creators.length > 0 ? "Per hour" : "No data"}
                      </p>
                    </div>
                    <div className="p-2 lg:p-3 bg-purple-50 rounded-lg">
                      <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Platform Status
                      </p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                        {currentUser ? "Active" : "Public"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {currentUser ? "Logged in" : "Viewing publicly"}
                      </p>
                    </div>
                    <div className="p-2 lg:p-3 bg-orange-50 rounded-lg">
                      <Users className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" />
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
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl lg:text-4xl">
                    👨‍💼
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? "No creators found" : "No creators yet"}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm lg:text-base">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
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
