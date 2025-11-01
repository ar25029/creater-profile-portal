// src/firebase/creatorService.js
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

export const creatorService = {
  async getCreators(userId = null) {
    try {
      let q;
      if (userId) {
        // Get only creators for specific user
        q = query(
          collection(db, "creators"),
          where("createdBy", "==", userId),
          orderBy("createdAt", "desc")
        );
      } else {
        // Get all creators (for admin or public view)
        q = query(collection(db, "creators"), orderBy("createdAt", "desc"));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      }));
    } catch (error) {
      console.error("Error fetching creators:", error);
      throw error;
    }
  },

  async getCreator(id) {
    try {
      const docRef = doc(db, "creators", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate(),
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching creator:", error);
      throw error;
    }
  },

  async addCreator(creatorData, images, userId, userName) {
    try {
      let profileImageUrl = "";
      let coverImageUrl = "";

      // Upload images in parallel if they exist
      const uploadPromises = [];

      if (images.profileImage) {
        uploadPromises.push(
          this.uploadImage(images.profileImage, "profiles").then((url) => {
            profileImageUrl = url;
          })
        );
      }

      if (images.coverImage) {
        uploadPromises.push(
          this.uploadImage(images.coverImage, "covers").then((url) => {
            coverImageUrl = url;
          })
        );
      }

      // Wait for all image uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      const creatorWithTimestamps = {
        ...creatorData,
        profileImage: profileImageUrl,
        coverImage: coverImageUrl,
        createdBy: userId,
        authorName: userName,
        rating: creatorData.rating || 4.5,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, "creators"),
        creatorWithTimestamps
      );
      return docRef.id;
    } catch (error) {
      console.error("Error adding creator:", error);
      throw error;
    }
  },

  async updateCreator(id, creatorData, images, userId) {
    try {
      // Verify ownership before update
      const creator = await this.getCreator(id);
      if (creator.createdBy !== userId) {
        throw new Error("You can only update your own creators.");
      }

      const updateData = {
        ...creatorData,
        updatedAt: serverTimestamp(),
      };

      const uploadPromises = [];

      if (images.profileImage) {
        uploadPromises.push(
          this.uploadImage(images.profileImage, "profiles").then((url) => {
            updateData.profileImage = url;
          })
        );
      }

      if (images.coverImage) {
        uploadPromises.push(
          this.uploadImage(images.coverImage, "covers").then((url) => {
            updateData.coverImage = url;
          })
        );
      }

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises);
      }

      await updateDoc(doc(db, "creators", id), updateData);
    } catch (error) {
      console.error("Error updating creator:", error);
      throw error;
    }
  },

  async deleteCreator(id, userId) {
    try {
      // Verify ownership before delete
      const creator = await this.getCreator(id);
      if (creator.createdBy !== userId) {
        throw new Error("You can only delete your own creators.");
      }

      await deleteDoc(doc(db, "creators", id));
    } catch (error) {
      console.error("Error deleting creator:", error);
      throw error;
    }
  },

  async uploadImage(file, folder) {
    try {
      const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },
};
