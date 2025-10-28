import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCreator } from "../contexts/CreatorContext";
import CreatorCard from "../components/creators/CreatorCard";
import CreatorForm from "../components/creators/CreatorForm";
import Button from "../components/ui/Button";
import { Plus, Search, Filter, Users } from "lucide-react";

const Dashboard = () => {
  const { creators, loading, addCreator, updateCreator, deleteCreator } =
    useCreator();
  const [showForm, setShowForm] = useState(false);
  const [editingCreator, setEditingCreator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const filteredCreators = creators.filter(
    (creator) =>
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.specialties?.some((specialty) =>
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleSubmit = async (formData, images) => {
    setFormLoading(true);
    try {
      if (editingCreator) {
        await updateCreator(editingCreator.id, formData, images);
      } else {
        await addCreator(formData, images);
      }
      setShowForm(false);
      setEditingCreator(null);
    } catch (error) {
      console.error("Error saving creator:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (creator) => {
    setEditingCreator(creator);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this creator?")) {
      try {
        await deleteCreator(id);
      } catch (error) {
        console.error("Error deleting creator:", error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
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
                  Manage your creator profiles with ease
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              Add Creator
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative max-w-2xl">
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
      </div>

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
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                        Active
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {creators.length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Avg. Rating
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        4.8
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <Users className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600">Loading creators...</p>
                </div>
              ) : filteredCreators.length === 0 ? (
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
                    <Button onClick={() => setShowForm(true)}>
                      <Plus size={20} />
                      Add Your First Creator
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      creator={creator}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onView={handleView}
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
