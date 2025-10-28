import { useState } from "react";
import { useForm } from "../../hooks/useForm";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Upload, X, Plus } from "lucide-react";

const initialFormData = {
  name: "",
  designation: "",
  about: "",
  price: "",
  profileImage: null,
  coverImage: null,
  socialLinks: {
    instagram: "",
    youtube: "",
    twitter: "",
    tiktok: "",
  },
  specialties: [],
};

const CreatorForm = ({ onSubmit, loading, initialData, onCancel }) => {
  const {
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    handleNestedChange,
  } = useForm(initialData || initialFormData);

  const [specialtyInput, setSpecialtyInput] = useState("");

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";
    if (!formData.about.trim()) newErrors.about = "About is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const submitData = {
      ...formData,
      price: Number(formData.price),
      specialties: formData.specialties || [],
    };

    const images = {
      profileImage: formData.profileImage,
      coverImage: formData.coverImage,
    };

    onSubmit(submitData, images);
  };

  const addSpecialty = () => {
    if (
      specialtyInput.trim() &&
      !formData.specialties?.includes(specialtyInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...(prev.specialties || []), specialtyInput.trim()],
      }));
      setSpecialtyInput("");
    }
  };

  const removeSpecialty = (index) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }));
    }
  };

  const removeImage = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
            <Input
              label="Designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              error={errors.designation}
              required
            />
            <Input
              label="Hourly Rate ($)"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              error={errors.price}
              required
            />
          </div>
          <Input
            label="About"
            name="about"
            value={formData.about}
            onChange={handleChange}
            error={errors.about}
            required
            multiline
            rows={3}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Images
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Cover Image
              </label>
              {formData.coverImage ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.coverImage)}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("coverImage")}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors duration-200 hover:border-purple-400 hover:bg-purple-50 text-gray-500 hover:text-purple-600">
                  <Upload size={24} />
                  <span className="mt-2 text-sm">Upload Cover Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "coverImage")}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Profile Image
              </label>
              {formData.profileImage ? (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={URL.createObjectURL(formData.profileImage)}
                    alt="Profile preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage("profileImage")}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer transition-colors duration-200 hover:border-purple-400 hover:bg-purple-50 text-gray-500 hover:text-purple-600">
                  <Upload size={24} />
                  <span className="mt-2 text-sm">Upload Profile Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, "profileImage")}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Instagram"
              value={formData.socialLinks.instagram}
              onChange={(e) =>
                handleNestedChange("socialLinks", "instagram", e.target.value)
              }
              placeholder="https://instagram.com/username"
            />
            <Input
              label="YouTube"
              value={formData.socialLinks.youtube}
              onChange={(e) =>
                handleNestedChange("socialLinks", "youtube", e.target.value)
              }
              placeholder="https://youtube.com/username"
            />
            <Input
              label="Twitter"
              value={formData.socialLinks.twitter}
              onChange={(e) =>
                handleNestedChange("socialLinks", "twitter", e.target.value)
              }
              placeholder="https://twitter.com/username"
            />
            <Input
              label="TikTok"
              value={formData.socialLinks.tiktok}
              onChange={(e) =>
                handleNestedChange("socialLinks", "tiktok", e.target.value)
              }
              placeholder="https://tiktok.com/username"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Specialties
          </h3>
          <div className="flex gap-2 mb-3">
            <Input
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              placeholder="Add a specialty"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSpecialty())
              }
              className="flex-1"
            />
            <Button type="button" onClick={addSpecialty} variant="secondary">
              <Plus size={16} />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.specialties?.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {specialty}
                <button
                  type="button"
                  onClick={() => removeSpecialty(index)}
                  className="hover:text-purple-900 transition-colors duration-200"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? "Update Creator" : "Add Creator"}
        </Button>
      </div>
    </form>
  );
};

export default CreatorForm;
