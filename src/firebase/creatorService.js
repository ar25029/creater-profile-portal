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
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./config";

export const creatorService = {
  async getCreators() {
    const q = query(collection(db, "creators"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  },

  async getCreator(id) {
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
  },

  async addCreator(creatorData, images) {
    let profileImageUrl = "";
    let coverImageUrl = "";

    if (images.profileImage) {
      profileImageUrl = await this.uploadImage(images.profileImage, "profiles");
    }
    if (images.coverImage) {
      coverImageUrl = await this.uploadImage(images.coverImage, "covers");
    }

    const creatorWithTimestamps = {
      ...creatorData,
      profileImage: profileImageUrl,
      coverImage: coverImageUrl,
      rating: creatorData.rating || 4.5,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "creators"),
      creatorWithTimestamps
    );
    return docRef.id;
  },

  async updateCreator(id, creatorData, images = {}) {
    const updateData = { ...creatorData, updatedAt: serverTimestamp() };

    if (images.profileImage) {
      updateData.profileImage = await this.uploadImage(
        images.profileImage,
        "profiles"
      );
    }
    if (images.coverImage) {
      updateData.coverImage = await this.uploadImage(
        images.coverImage,
        "covers"
      );
    }

    await updateDoc(doc(db, "creators", id), updateData);
  },

  async deleteCreator(id) {
    await deleteDoc(doc(db, "creators", id));
  },

  async uploadImage(file, folder) {
    const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  },
};
